import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface TranscriptResponse {
  text: string;
  duration: number;
  offset: number;
}

interface TranscriptResult {
  success: boolean;
  data?: {
    transcript: TranscriptResponse[];
    videoId: string;
    totalDuration: number;
    language: string;
    availableLanguages?: string[];
    plainText?: string;
  };
  error?: string;
}

const RE_YOUTUBE =
  /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;

/**
 * Retrieve video id from url or string
 * @param videoId video url or video id
 */
function retrieveVideoId(videoId: string): string {
  if (videoId.length === 11) {
    return videoId;
  }
  const matchId = videoId.match(RE_YOUTUBE);
  if (matchId && matchId.length) {
    return matchId[1];
  }
  throw new Error('Invalid YouTube video URL or ID');
}

/**
 * Parse VTT timestamp to seconds
 * @param timeStr VTT time string (e.g., "00:01:30.500")
 */
function parseVttTime(timeStr: string): number {
  const parts = timeStr.split(':');
  const seconds = parseFloat(parts[parts.length - 1]);
  const minutes = parts.length > 1 ? parseInt(parts[parts.length - 2]) : 0;
  const hours = parts.length > 2 ? parseInt(parts[parts.length - 3]) : 0;
  
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Remove duplicates and overlapping segments with advanced repetition detection
 * Specifically designed to handle YouTube's cumulative transcript patterns
 * @param segments Transcript segments
 */
function removeDuplicateSegments(segments: TranscriptResponse[]): TranscriptResponse[] {
  if (!segments || segments.length === 0) return [];
  
  // Step 1: Handle cumulative segments by keeping only the longest version
  const cumulativeFiltered = filterCumulativeSegments(segments);
  
  // Step 2: Remove remaining duplicates with standard algorithm
  const cleanedSegments: TranscriptResponse[] = [];
  
  for (let i = 0; i < cumulativeFiltered.length; i++) {
    const segment = cumulativeFiltered[i];
    const cleanText = segment.text.toLowerCase().trim();
    
    // Skip empty segments
    if (!cleanText) continue;
    
    // Check against recent segments for duplicates
    let isDuplicate = false;
    const lookBackCount = Math.min(3, cleanedSegments.length);
    
    for (let j = cleanedSegments.length - lookBackCount; j < cleanedSegments.length; j++) {
      if (j < 0) continue;
      const existingText = cleanedSegments[j].text.toLowerCase().trim();
      
      // Exact match
      if (existingText === cleanText) {
        isDuplicate = true;
        break;
      }
      
      // Check for high similarity (85% or more)
      const similarity = calculateTextSimilarity(cleanText, existingText);
      if (similarity > 0.85) {
        // Keep the longer, more complete version
        if (cleanText.length > existingText.length) {
          cleanedSegments[j] = segment;
        }
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate) {
      cleanedSegments.push(segment);
    }
  }
  
  // Don't clean segments individually - will clean the merged content later
  return cleanedSegments;
}

/**
 * Clean repetitions within a single segment text
 * @param text Original text
 * @returns Cleaned text without internal repetitions
 */
function cleanWithinSegmentRepetition(text: string): string {
  let cleanedText = text.trim();
  
  // First pass: Remove obvious repetitions like "word word word"
  cleanedText = removeConsecutiveWordRepetitions(cleanedText);
  
  // Second pass: Remove phrase repetitions with simple working algorithm
  cleanedText = removeSimpleRepetitions(cleanedText);
  
  return cleanedText;
}

/**
 * Remove consecutive word repetitions (e.g., "your your your website" -> "your website")
 * @param text Input text
 * @returns Text with consecutive word repetitions removed
 */
function removeConsecutiveWordRepetitions(text: string): string {
  const words = text.split(/\s+/);
  const cleanedWords = [];
  let lastWord = '';
  let consecutiveCount = 0;
  
  for (const word of words) {
    const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (cleanWord === lastWord && cleanWord.length > 2) {
      consecutiveCount++;
      // Skip if we've seen this word 2+ times consecutively
      if (consecutiveCount >= 2) {
        continue;
      }
    } else {
      consecutiveCount = 0;
      lastWord = cleanWord;
    }
    
    cleanedWords.push(word);
  }
  
  return cleanedWords.join(' ');
}

/**
 * Remove simple repetitions - proven working algorithm
 * @param text Input text with potential repetitions
 * @returns Cleaned text
 */
function removeSimpleRepetitions(text: string): string {
  let cleanedText = text;
  let passCount = 0;
  const maxPasses = 3;
  
  // Multiple passes to catch all repetition patterns
  while (passCount < maxPasses) {
    const beforeLength = cleanedText.length;
    cleanedText = removeRepetitionPass(cleanedText);
    
    // If no change in this pass, we're done
    if (cleanedText.length === beforeLength) {
      break;
    }
    passCount++;
  }
  
  return cleanedText;
}

function removeRepetitionPass(text: string): string {
  // Very direct approach - look for repeated phrases
  const words = text.split(/\s+/);
  const result = [];
  
  for (let i = 0; i < words.length; i++) {
    // Check if we're starting a repetition
    let foundRepeat = false;
    
    for (let len = 2; len <= Math.min(15, Math.floor((words.length - i) / 2)); len++) {
      if (i + len * 2 > words.length) continue;
      
      const phrase1 = words.slice(i, i + len).join(' ').toLowerCase();
      const phrase2 = words.slice(i + len, i + len * 2).join(' ').toLowerCase();
      
      if (phrase1 === phrase2 && phrase1.length > 6) {
        // Add the first occurrence, skip the second
        for (let j = 0; j < len; j++) {
          result.push(words[i + j]);
        }
        i += len * 2 - 1; // Skip both patterns (-1 because loop will increment)
        foundRepeat = true;
        break;
      }
    }
    
    if (!foundRepeat) {
      result.push(words[i]);
    }
  }
  
  return result.join(' ');
}

/**
 * Filter cumulative segments - YouTube often creates overlapping segments where
 * each segment contains the previous content plus new content
 * @param segments Original segments
 * @returns Filtered segments with cumulative duplicates removed
 */
function filterCumulativeSegments(segments: TranscriptResponse[]): TranscriptResponse[] {
  if (!segments || segments.length === 0) return [];
  
  const filtered: TranscriptResponse[] = [];
  const timeWindow = 5.0; // Look within 5 seconds for potential cumulative segments
  
  for (let i = 0; i < segments.length; i++) {
    const currentSegment = segments[i];
    const currentText = currentSegment.text.trim();
    
    if (!currentText) continue;
    
    // Look for segments within time window that might be cumulative
    let isCumulative = false;
    
    for (let j = i + 1; j < segments.length; j++) {
      const futureSegment = segments[j];
      
      // Break if we're outside the time window
      if (futureSegment.offset - currentSegment.offset > timeWindow) {
        break;
      }
      
      const futureText = futureSegment.text.trim();
      
      // Check if future segment contains current segment (cumulative pattern)
      if (futureText.length > currentText.length && 
          futureText.toLowerCase().includes(currentText.toLowerCase())) {
        
        // Verify this is truly cumulative by checking word overlap
        const currentWords = currentText.toLowerCase().split(/\s+/);
        const futureWords = futureText.toLowerCase().split(/\s+/);
        
        // Count how many words from current segment appear in future segment
        const overlapCount = currentWords.filter(word => 
          word.length > 2 && futureWords.includes(word)
        ).length;
        
        const overlapRatio = overlapCount / Math.max(currentWords.length, 1);
        
        // If 70% or more words overlap, consider this cumulative
        if (overlapRatio >= 0.7) {
          isCumulative = true;
          break;
        }
      }
    }
    
    // Only add if not cumulative (not contained in a future segment)
    if (!isCumulative) {
      filtered.push(currentSegment);
    }
  }
  
  return filtered;
}

/**
 * Calculate similarity between two word arrays
 * @param arr1 First word array
 * @param arr2 Second word array
 * @returns Similarity score between 0 and 1
 */
function calculateWordArraySimilarity(arr1: string[], arr2: string[]): number {
  if (arr1.length !== arr2.length) return 0;
  
  let matches = 0;
  for (let i = 0; i < arr1.length; i++) {
    const word1 = arr1[i].toLowerCase().replace(/[^a-z0-9]/g, '');
    const word2 = arr2[i].toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (word1 === word2 && word1.length > 1) {
      matches++;
    }
  }
  
  return matches / arr1.length;
}

/**
 * Calculate similarity between two text strings
 * @param text1 First text
 * @param text2 Second text
 * @returns Similarity score between 0 and 1
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = text1.split(/\s+/).filter(w => w.length > 2); // Filter short words
  const words2 = text2.split(/\s+/).filter(w => w.length > 2);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = Math.max(words1.length, words2.length);
  
  return commonWords.length / totalWords;
}

/**
 * Merge transcript segments into complete sentences
 * @param segments Individual transcript segments
 */
function mergeSegmentsIntoSentences(segments: TranscriptResponse[]): TranscriptResponse[] {
  if (!segments || segments.length === 0) return [];
  
  // First, remove duplicates and overlapping segments
  const cleanedSegments = removeDuplicateSegments(segments);
  
  const mergedSegments: TranscriptResponse[] = [];
  let currentSentence = '';
  let sentenceStart = cleanedSegments[0]?.offset || 0;
  let sentenceEnd = sentenceStart;
  
  const sentenceEnders = ['.', '!', '?', ':', ';'];
  const musicMarkers = ['[Music]', '[Applause]', 'Music', 'Applause'];
  
  for (let i = 0; i < cleanedSegments.length; i++) {
    const segment = cleanedSegments[i];
    const nextSegment = i < cleanedSegments.length - 1 ? cleanedSegments[i + 1] : null;
    
    // Special handling for music notations - don't merge these
    const isMusic = musicMarkers.some(marker => segment.text.includes(marker)) || 
                   segment.text.includes('♪') || segment.text.match(/\[.*♪.*\]/);
    
    if (isMusic) {
      // Add any accumulated sentence first
      if (currentSentence.trim()) {
        mergedSegments.push({
          text: currentSentence.trim(),
          offset: sentenceStart,
          duration: sentenceEnd - sentenceStart
        });
        currentSentence = '';
      }
      
      // Add music segment as-is
      mergedSegments.push(segment);
      
      // Reset for next sentence
      if (nextSegment) {
        sentenceStart = nextSegment.offset;
        sentenceEnd = sentenceStart;
      }
      continue;
    }
    
    // Start new sentence if this is the first non-music segment
    if (currentSentence.length === 0) {
      sentenceStart = segment.offset;
    }
    
    // Add current segment text to the building sentence
    if (currentSentence.length > 0) {
      currentSentence += ' ';
    }
    currentSentence += segment.text;
    sentenceEnd = segment.offset + (segment.duration || 2.0); // Default 2 seconds if no duration
    
    // Check if this segment ends with sentence-ending punctuation
    const endsWithPunctuation = sentenceEnders.some(ender => 
      segment.text.trim().endsWith(ender));
      
    // Also end sentence if next segment starts with capital letter and there's a significant gap
    const nextStartsNewSentence = nextSegment && 
      /^[A-Z]/.test(nextSegment.text) && 
      (nextSegment.offset - (segment.offset + (segment.duration || 2.0)) > 1.0); // Increased gap threshold
    
    // End of sentence or end of transcript
    if (endsWithPunctuation || nextStartsNewSentence || !nextSegment) {
      // Only add if we have content
      if (currentSentence.trim()) {
        mergedSegments.push({
          text: currentSentence.trim(),
          offset: sentenceStart,
          duration: sentenceEnd - sentenceStart
        });
      }
      
      // Reset for next sentence
      currentSentence = '';
      if (nextSegment) {
        sentenceStart = nextSegment.offset;
        sentenceEnd = sentenceStart;
      }
    }
  }
  
  // Add any remaining content
  if (currentSentence.trim()) {
    mergedSegments.push({
      text: currentSentence.trim(),
      offset: sentenceStart,
      duration: sentenceEnd - sentenceStart
    });
  }
  
  // Apply repetition cleaning to all merged segments
  return mergedSegments.map(segment => ({
    ...segment,
    text: cleanWithinSegmentRepetition(segment.text)
  }));
}

/**
 * Fetch transcript from YouTube Video using yt-dlp
 * @param videoId Video url or video identifier
 * @param language Optional language code
 * @param mergeSegments Whether to merge segments into sentences
 */
async function fetchTranscript(
  videoId: string,
  language?: string,
  mergeSegments: boolean = true
): Promise<{ transcript: TranscriptResponse[]; availableLanguages: string[]; usedLanguage: string; }> {
  const identifier = retrieveVideoId(videoId);
  
  try {
    // Get video info with subtitles using yt-dlp
    const { stdout } = await execAsync(
      `yt-dlp --write-auto-subs --skip-download --print-json "${identifier}" 2>/dev/null | head -1`,
      { maxBuffer: 1024 * 1024 * 10 } // 10MB buffer
    );
    
    const videoInfo = JSON.parse(stdout.trim());
    
    if (!videoInfo.automatic_captions) {
      throw new Error('No automatic captions available for this video');
    }
    
    // Get available languages
    const availableLanguages = Object.keys(videoInfo.automatic_captions);
    
    // Find the requested language or use English/first available
    let targetLanguage = language;
    if (!targetLanguage) {
      // Prefer English, then first available
      targetLanguage = availableLanguages.find(lang => lang.startsWith('en')) || availableLanguages[0];
    }
    
    if (!availableLanguages.includes(targetLanguage)) {
      throw new Error(`Language '${targetLanguage}' not available. Available languages: ${availableLanguages.join(', ')}`);
    }
    
    const captionTrack = videoInfo.automatic_captions[targetLanguage];
    if (!captionTrack || captionTrack.length === 0) {
      throw new Error('No caption tracks found for the selected language');
    }
    
    // Find VTT format (or fallback to first available)
    const vttTrack = captionTrack.find((track: any) => track.ext === 'vtt') || captionTrack[0];
    
    // Fetch the transcript content
    const response = await fetch(vttTrack.url);
    if (!response.ok) {
      throw new Error('Failed to fetch transcript data');
    }
    
    const content = await response.text();
    
    // Parse VTT content
    const segments: TranscriptResponse[] = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines and WEBVTT header
      if (!line || line.startsWith('WEBVTT') || line.startsWith('Kind:') || line.startsWith('Language:')) {
        continue;
      }
      
      // Look for timestamp lines (format: 00:00:10.500 --> 00:00:13.500)
      if (line.includes(' --> ')) {
        const [startTime, endTime] = line.split(' --> ');
        const startSeconds = parseVttTime(startTime);
        const endSeconds = parseVttTime(endTime);
        
        // Get the text content from next non-empty lines
        let textLines = [];
        let j = i + 1;
        while (j < lines.length && lines[j].trim() !== '') {
          const textLine = lines[j].trim();
          if (textLine && !textLine.includes(' --> ')) {
            textLines.push(textLine);
          }
          j++;
        }
        
        if (textLines.length > 0) {
          segments.push({
            text: textLines.join(' ')
              .replace(/<[^>]*>/g, '') // Remove HTML tags
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .trim(),
            offset: startSeconds,
            duration: endSeconds - startSeconds
          });
        }
        
        i = j - 1; // Skip processed lines
      }
    }
    
    if (segments.length === 0) {
      throw new Error('No transcript segments found');
    }
    
    // Merge segments into sentences if requested
    let processedSegments = segments;
    if (mergeSegments) {
      processedSegments = mergeSegmentsIntoSentences(segments);
    }
    
    return {
      transcript: processedSegments,
      availableLanguages,
      usedLanguage: targetLanguage
    };
    
  } catch (error: any) {
    if (error.message.includes('No automatic captions') || error.message.includes('Language')) {
      throw error;
    }
    throw new Error(`Failed to fetch transcript: ${error.message}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoUrl, language, mergeSegments = true, includePlainText = false } = body;

    if (!videoUrl) {
      return NextResponse.json<TranscriptResult>(
        {
          success: false,
          error: 'Video URL is required'
        },
        { status: 400 }
      );
    }

    // Extract video ID from URL
    const videoId = retrieveVideoId(videoUrl);
    
    // Fetch transcript
    const { transcript, availableLanguages, usedLanguage } = await fetchTranscript(videoUrl, language, mergeSegments);
    
    // Calculate total duration
    const totalDuration = transcript.reduce((sum, item) => sum + item.duration, 0);

    // Generate plain text if requested
    let plainText;
    if (includePlainText) {
      plainText = transcript.map(item => item.text).join(' ');
    }

    const result: TranscriptResult = {
      success: true,
      data: {
        transcript,
        videoId,
        totalDuration,
        language: usedLanguage,
        availableLanguages,
        ...(includePlainText && { plainText })
      }
    };

    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('Transcript extraction error:', error);
    
    let errorMessage = 'Failed to extract transcript';
    let statusCode = 500;
    
    if (error.message) {
      errorMessage = error.message;
      
      if (error.message.includes('Invalid YouTube video')) {
        statusCode = 400;
      } else if (error.message.includes('No captions available')) {
        statusCode = 404;
      } else if (error.message.includes('Language') && error.message.includes('not available')) {
        statusCode = 400;
      }
    }

    const result: TranscriptResult = {
      success: false,
      error: errorMessage
    };

    return NextResponse.json(result, { status: statusCode });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'YouTube Transcript Extractor API',
    usage: 'POST with { videoUrl: string, language?: string, mergeSegments?: boolean, includePlainText?: boolean }',
    example: {
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      language: 'en',
      mergeSegments: true,
      includePlainText: false
    }
  });
}