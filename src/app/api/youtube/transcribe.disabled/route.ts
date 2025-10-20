import { NextRequest, NextResponse } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { YoutubeTranscript } from 'youtube-transcript';
import TranscriptApi from 'youtube-transcript-api';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Types for the youtube-transcript package
interface YoutubeTranscriptItem {
  text: string;
  duration: number;
  offset: number;
}

// Types for youtube-transcript-api
interface YTTranscriptApiItem {
  text: string;
  start: number;
  dur: number;
}

import { guard } from '@/lib/limit';

// Simple cache implementation
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

function getCache(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  if (cached) {
    cache.delete(key); // Clean up expired cache
  }
  return null;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// Generate demo transcript for testing
function generateDemoTranscript(videoId: string): YoutubeTranscriptItem[] {
  const demoTexts = {
    'dQw4w9WgXcQ': [
      "We're no strangers to love",
      "You know the rules and so do I",
      "A full commitment's what I'm thinking of",
      "You wouldn't get this from any other guy",
      "I just wanna tell you how I'm feeling",
      "Gotta make you understand",
      "Never gonna give you up",
      "Never gonna let you down",
      "Never gonna run around and desert you",
      "Never gonna make you cry",
      "Never gonna say goodbye",
      "Never gonna tell a lie and hurt you"
    ],
    '9bZkp7q19f0': [
      "Oppan Gangnam Style",
      "Gangnam Style",
      "A girl who is warm and humanly during the day",
      "A classy girl who know how to enjoy the freedom of a cup of coffee",
      "A girl whose heart gets hotter when night comes",
      "A girl with that kind of twist",
      "I'm a guy who is as warm as you during the day",
      "A guy who one-shots his coffee before it even cools down",
      "A guy whose heart bursts when night comes",
      "That kind of guy"
    ],
    'amvEyw_Qrrw': [
      "This is a demo transcript for testing purposes",
      "The original video may not have captions available",
      "This tool demonstrates how transcripts would appear",
      "When a video has subtitles or closed captions enabled",
      "You can extract the full text content",
      "Analyze the spoken content",
      "Create summaries or search for specific topics",
      "This is particularly useful for content creators",
      "Who want to analyze their own videos",
      "Or research competitor content",
      "Remember to always respect copyright and fair use",
      "Thank you for trying YouTools transcript feature"
    ],
    // Add more demo videos for testing
    'demo1': [
      "Welcome to this tutorial video",
      "Today we'll be learning about web development",
      "First, let's talk about HTML basics",
      "HTML stands for HyperText Markup Language",
      "It's the foundation of every web page",
      "Next, we'll cover CSS for styling",
      "And finally, JavaScript for interactivity",
      "Don't forget to like and subscribe"
    ]
  };

  const texts = demoTexts[videoId as keyof typeof demoTexts] || demoTexts['demo1'];
  
  return texts.map((text, index) => ({
    text,
    duration: 3000 + Math.random() * 2000, // 3-5 seconds
    offset: index * 4000 // 4 seconds apart
  }));
}

interface TranscriptItem {
  text: string;
  start: number;
  duration: number;
  end?: number;
}

interface TranscriptResponse {
  videoId: string;
  title: string;
  transcript: TranscriptItem[];
  language: string;
  availableLanguages: string[];
  demoMode?: boolean;
}

// Extract video ID from various YouTube URL formats
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&#?]*)/,
    /youtube\.com\/v\/([^&#?]*)/,
    /youtube\.com\/.*[?&]v=([^&#?]*)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // If it's already a video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
    return url.trim();
  }

  return null;
}

// Enhanced transcript fetching with multiple real data methods
async function fetchTranscript(videoId: string, language: string = 'en'): Promise<TranscriptResponse> {
  console.log(`🔍 Fetching transcript for video: ${videoId}, language: ${language}`);
  
  let transcriptData: any[] = [];
  let lastError: any = null;
  let isDemoMode = false;
  let methodUsed = '';

  // Method 1: Try the most reliable youtube-transcript package with enhanced options
  const ytTranscriptApproaches = [
    { name: 'Basic fetch', fn: () => YoutubeTranscript.fetchTranscript(videoId) },
    { name: 'With language', fn: () => YoutubeTranscript.fetchTranscript(videoId, { lang: language }) },
    { name: 'English fallback', fn: () => language !== 'en' ? YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' }) : Promise.reject(new Error('Skip')) },
    { name: 'Auto-generated only', fn: () => YoutubeTranscript.fetchTranscript(videoId, { lang: language, autoGenerated: true }) },
    { name: 'Manual captions only', fn: () => YoutubeTranscript.fetchTranscript(videoId, { lang: language, autoGenerated: false }) },
    { name: 'With country US', fn: () => YoutubeTranscript.fetchTranscript(videoId, { lang: language, country: 'US' }) },
    { name: 'With country UK', fn: () => YoutubeTranscript.fetchTranscript(videoId, { lang: language, country: 'GB' }) }
  ];
  
  for (let i = 0; i < ytTranscriptApproaches.length; i++) {
    const approach = ytTranscriptApproaches[i];
    try {
      console.log(`📡 Method ${i + 1}: ${approach.name}...`);
      const result = await approach.fn();
      if (result && result.length > 0) {
        console.log(`✅ Method ${i + 1} succeeded: ${result.length} items with real data!`);
        transcriptData = result;
        methodUsed = `youtube-transcript (${approach.name})`;
        break;
      }
    } catch (error: any) {
      console.log(`❌ Method ${i + 1} failed:`, error.message);
      lastError = error;
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  // If still no data, provide real error message
  if (!transcriptData.length) {
    console.log('⚠️ All real transcript methods failed');
    
    // Provide helpful error message based on the last error
    let errorMessage = 'No transcript/captions available for this video';
    
    if (lastError?.message?.includes('Transcript is disabled') || lastError?.message?.includes('disabled on this video')) {
      errorMessage = 'Transcripts/captions are disabled for this video by the creator.';
    } else if (lastError?.message?.includes('Video unavailable') || lastError?.message?.includes('private')) {
      errorMessage = 'Video is unavailable, private, or does not exist.';
    } else if (lastError?.message?.includes('Could not retrieve') || lastError?.message?.includes('blocked')) {
      errorMessage = 'YouTube is blocking transcript access. This may be due to anti-bot measures or the video simply doesn\'t have captions.';
    } else if (lastError?.message?.includes('age restricted')) {
      errorMessage = 'Video is age restricted and cannot be accessed.';
    } else if (lastError?.message?.includes('No transcripts were found') || lastError?.message?.includes('No captions')) {
      errorMessage = 'No captions or subtitles are available for this video.';
    }

    // Throw real error - no more demo mode for all videos
    console.error(`💥 No transcript available for video ${videoId}: ${errorMessage}`);
    throw new Error(`${errorMessage}\n\nTo test the transcript functionality, try these videos with known captions:\n- Rick Astley - Never Gonna Give You Up: dQw4w9WgXcQ\n- PSY - Gangnam Style: 9bZkp7q19f0`);
  }

  console.log(`🎉 Successfully fetched ${transcriptData.length} transcript items using: ${methodUsed}`);
  
  // Normalize transcript data format
  const transcript: TranscriptItem[] = transcriptData.map((item: any) => {
    // Handle different formats from different sources
    const text = item.text || item.content || '';
    const startMs = item.offset || (item.start * 1000) || 0;
    const durationMs = item.duration || (item.dur * 1000) || 3000;
    
    return {
      text: text.trim(),
      start: startMs / 1000, // Convert to seconds
      duration: durationMs / 1000, // Convert to seconds
      end: (startMs + durationMs) / 1000 // Calculate end time
    };
  });
  
  // Get video title
  const title = await getVideoTitle(videoId);
  
  return {
    videoId,
    title,
    transcript,
    language,
    availableLanguages: [language],
    demoMode: isDemoMode
  };
}

// Get video title from YouTube page
async function getVideoTitle(videoId: string): Promise<string> {
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (response.ok) {
      const html = await response.text();
      const titleMatch = html.match(/<title>(.+?)<\/title>/);
      if (titleMatch) {
        return titleMatch[1].replace(' - YouTube', '').trim();
      }
    }
  } catch (e) {
    console.log('Failed to get video title:', e);
  }
  
  return 'Unknown Title';
}

// Format timestamp for display
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const limited = await guard(ip);
  if (limited) return NextResponse.json(limited, { status: limited.status });

  const url = new URL(req.url);
  const videoUrl = url.searchParams.get('url') || '';
  const language = url.searchParams.get('lang') || 'en';

  if (!videoUrl) {
    return NextResponse.json({ 
      error: 'Video URL required',
      message: 'Please provide a YouTube video URL',
      examples: [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ',
        'dQw4w9WgXcQ'
      ]
    }, { status: 400 });
  }

  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    return NextResponse.json({ 
      error: 'Invalid video URL',
      message: 'Unable to extract video ID from the provided URL',
      provided: videoUrl
    }, { status: 400 });
  }

  const cacheKey = `transcript:${videoId}:${language}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, cached: true });
  }

  try {
    const result = await fetchTranscript(videoId, language);

    // Format transcript with timestamps for easy reading
    const formattedTranscript = result.transcript.map(item => ({
      ...item,
      timestamp: formatTime(item.start),
      endTime: formatTime(item.start + item.duration)
    }));

    const response = {
      ...result,
      transcript: formattedTranscript,
      fullText: result.transcript.map(item => item.text).join(' '),
      totalDuration: result.transcript.length > 0 
        ? formatTime(result.transcript[result.transcript.length - 1].start + result.transcript[result.transcript.length - 1].duration)
        : '0:00',
      wordCount: result.transcript.map(item => item.text.split(' ').length).reduce((a, b) => a + b, 0)
    };

    // Cache for 1 hour
    setCache(cacheKey, response);

    return NextResponse.json({
      ...response,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Transcribe API error:', error);
    
    // Determine appropriate status code based on error type
    let statusCode = 500;
    if (error.message?.includes('No transcript available') || 
        error.message?.includes('No captions') ||
        error.message?.includes('Transcript is disabled')) {
      statusCode = 404;
    } else if (error.message?.includes('Video unavailable') ||
               error.message?.includes('Video is age restricted')) {
      statusCode = 403;
    }
    
    return NextResponse.json({
      error: 'Failed to fetch transcript',
      detail: error.message || 'Unknown error occurred',
      videoUrl,
      suggestion: statusCode === 404 
        ? 'This video does not have captions available. Try a video that has subtitles enabled.'
        : 'Please verify the video exists, is public, and accessible.'
    }, { status: statusCode });
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const limited = await guard(ip);
  if (limited) return NextResponse.json(limited, { status: limited.status });

  try {
    const body = await req.json();
    const { url, language = 'en' } = body;

    if (!url) {
      return NextResponse.json({ 
        error: 'Video URL required',
        message: 'Please provide a YouTube video URL'
      }, { status: 400 });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json({ 
        error: 'Invalid video URL',
        message: 'Unable to extract video ID from the provided URL',
        provided: url
      }, { status: 400 });
    }

    const cacheKey = `transcript:${videoId}:${language}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const result = await fetchTranscript(videoId, language);

    // Format transcript with timestamps
    const formattedTranscript = result.transcript.map(item => ({
      ...item,
      timestamp: formatTime(item.start),
      endTime: formatTime(item.start + item.duration)
    }));

    const response = {
      ...result,
      transcript: formattedTranscript,
      fullText: result.transcript.map(item => item.text).join(' '),
      totalDuration: result.transcript.length > 0 
        ? formatTime(result.transcript[result.transcript.length - 1].start + result.transcript[result.transcript.length - 1].duration)
        : '0:00',
      wordCount: result.transcript.map(item => item.text.split(' ').length).reduce((a, b) => a + b, 0)
    };

    // Cache for 1 hour
    setCache(cacheKey, response);

    return NextResponse.json({
      ...response,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Transcribe API error:', error);
    
    // Determine appropriate status code based on error type
    let statusCode = 500;
    if (error.message?.includes('No transcript available') || 
        error.message?.includes('No captions') ||
        error.message?.includes('Transcript is disabled')) {
      statusCode = 404;
    } else if (error.message?.includes('Video unavailable') ||
               error.message?.includes('Video is age restricted')) {
      statusCode = 403;
    }
    
    return NextResponse.json({
      error: 'Failed to fetch transcript',
      detail: error.message || 'Unknown error occurred',
      suggestion: statusCode === 404 
        ? 'This video does not have captions available. Try a video that has subtitles enabled.'
        : 'Please verify the video exists, is public, and accessible.'
    }, { status: statusCode });
  }
}