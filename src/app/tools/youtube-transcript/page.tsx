'use client';

import React, { useState } from 'react';

interface TranscriptSegment {
  text: string;
  duration: number;
  offset: number;
  lang?: string;
}

interface TranscriptData {
  transcript: TranscriptSegment[];
  videoId: string;
  totalDuration: number;
  language: string;
  availableLanguages?: string[];
  plainText?: string;
}

interface ApiResponse {
  success: boolean;
  data?: TranscriptData;
  error?: string;
}

export default function YoutubeTranscriptPage() {
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranscriptData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mergeSegments, setMergeSegments] = useState(true);
  const [activeTab, setActiveTab] = useState<'timestamped' | 'plain'>('timestamped');

  // Common languages for YouTube transcripts
  const languages = [
    { code: '', name: 'Auto-detect (Default)' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese (Simplified)' },
    { code: 'zh-TW', name: 'Chinese (Traditional)' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ar', name: 'Arabic' },
    { code: 'nl', name: 'Dutch' },
    { code: 'pl', name: 'Polish' },
    { code: 'tr', name: 'Turkish' },
    { code: 'th', name: 'Thai' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'id', name: 'Indonesian' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoUrl.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/youtube/transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl: videoUrl.trim(),
          language: selectedLanguage || undefined,
          mergeSegments: mergeSegments,
          includePlainText: true,
        }),
      });

      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        setResult(data.data);
      } else {
        setError(data.error || 'Failed to extract transcript');
      }
    } catch (error) {
      setError('Network error occurred. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTotalTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const downloadTranscript = () => {
    if (!result) return;

    const transcriptText = activeTab === 'timestamped'
      ? result.transcript
          .map(segment => `[${formatTime(segment.offset)}] ${segment.text}`)
          .join('\n\n')
      : result.plainText || result.transcript.map(segment => segment.text).join(' ');

    const blob = new Blob([transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube_transcript_${result.videoId}_${activeTab}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    if (!result) return;

    const transcriptText = activeTab === 'timestamped'
      ? result.transcript
          .map(segment => `[${formatTime(segment.offset)}] ${segment.text}`)
          .join('\n\n')
      : result.plainText || result.transcript.map(segment => segment.text).join(' ');

    navigator.clipboard.writeText(transcriptText).then(() => {
      alert(`${activeTab === 'timestamped' ? 'Timestamped transcript' : 'Plain text'} copied to clipboard!`);
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📋 YouTube Transcript Extractor
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Extract subtitles and transcripts from any YouTube video. Support for multiple languages and downloadable formats.
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                YouTube URL or Video ID
              </label>
              <input
                type="text"
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Language (Optional)
                </label>
                <select
                  id="language"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="mergeSegments" className="block text-sm font-medium text-gray-700 mb-2">
                  Transcript Format
                </label>
                <select
                  id="mergeSegments"
                  value={mergeSegments.toString()}
                  onChange={(e) => setMergeSegments(e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="true">Complete Sentences (Recommended)</option>
                  <option value="false">Individual Segments</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !videoUrl.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Extracting Transcript...' : 'Extract Transcript'}
            </button>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Transcript Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{result.transcript.length}</div>
                  <div className="text-sm text-gray-600">Segments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{formatTotalTime(result.totalDuration)}</div>
                  <div className="text-sm text-gray-600">Total Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{result.language}</div>
                  <div className="text-sm text-gray-600">Language</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{result.videoId}</div>
                  <div className="text-sm text-gray-600">Video ID</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-6">
                <button
                  onClick={downloadTranscript}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  📥 Download Transcript
                </button>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  📋 Copy Text
                </button>
              </div>
            </div>

            {/* Transcript Content with Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Transcript</h3>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('timestamped')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'timestamped'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    ⏱️ Timestamped
                  </button>
                  <button
                    onClick={() => setActiveTab('plain')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'plain'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    📄 Plain Text
                  </button>
                </div>
              </div>
              
              {activeTab === 'timestamped' ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {result.transcript.map((segment, index) => (
                    <div key={index} className="flex gap-4 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0 w-16 text-sm font-medium text-blue-600">
                        {formatTime(segment.offset)}
                      </div>
                      <div className="flex-1 text-sm text-gray-800 leading-relaxed">
                        {segment.text}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <div className="bg-gray-50 rounded-md p-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed font-sans">
                      {result.plainText || result.transcript.map(s => s.text).join(' ')}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Features</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">✨ Key Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Extract transcripts from any YouTube video</li>
                <li>• Support for multiple languages</li>
                <li>• Two viewing modes: Timestamped & Plain Text</li>
                <li>• Smart sentence merging (no duplicates!)</li>
                <li>• Download as text file</li>
                <li>• Copy to clipboard</li>
                <li>• Works with video URLs or IDs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">📝 Usage Tips</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Use "Complete Sentences" for clean, readable text</li>
                <li>• Use "Individual Segments" for precise timing</li>
                <li>• Switch between timestamped and plain text views</li>
                <li>• Auto-detect works for most videos</li>
                <li>• Download transcripts for offline use</li>
                <li>• Perfect for content analysis and subtitles</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}