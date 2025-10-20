'use client';

import { useState } from 'react';
import Link from 'next/link';

interface TranscriptItem {
  start: number;
  duration: number;
  text: string;
  timestamp: string;
  endTime: string;
}

interface TranscriptResult {
  videoId: string;
  title: string;
  transcript: TranscriptItem[];
  language: string;
  availableLanguages: string[];
  fullText: string;
  totalDuration: string;
  wordCount: number;
  cached?: boolean;
  demoMode?: boolean;
}

export default function YoutubeTranscribePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranscriptResult | null>(null);
  const [error, setError] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [language, setLanguage] = useState('en');

  const handleTranscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoUrl.trim()) {
      setError('Please enter a YouTube video URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/youtube/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: videoUrl.trim(),
          language: language 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Failed to fetch transcript');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const downloadTranscript = (format: 'txt' | 'srt' | 'vtt') => {
    if (!result) return;

    let content = '';
    let fileName = '';
    let mimeType = '';

    switch (format) {
      case 'txt':
        content = result.fullText;
        fileName = `${result.title.replace(/[^a-z0-9]/gi, '_')}_transcript.txt`;
        mimeType = 'text/plain';
        break;
      
      case 'srt':
        content = result.transcript.map((item, index) => {
          const startTime = formatTimeForSRT(item.start);
          const endTime = formatTimeForSRT(item.start + item.duration);
          return `${index + 1}\n${startTime} --> ${endTime}\n${item.text}\n`;
        }).join('\n');
        fileName = `${result.title.replace(/[^a-z0-9]/gi, '_')}_transcript.srt`;
        mimeType = 'text/srt';
        break;
      
      case 'vtt':
        content = 'WEBVTT\n\n' + result.transcript.map(item => {
          const startTime = formatTimeForVTT(item.start);
          const endTime = formatTimeForVTT(item.start + item.duration);
          return `${startTime} --> ${endTime}\n${item.text}\n`;
        }).join('\n');
        fileName = `${result.title.replace(/[^a-z0-9]/gi, '_')}_transcript.vtt`;
        mimeType = 'text/vtt';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTimeForSRT = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  };

  const formatTimeForVTT = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600">
                YouTools
              </Link>
              <span className="ml-2 text-gray-500">/</span>
              <span className="ml-2 text-gray-600">YouTube Video Transcribe</span>
            </div>
            <Link
              href="/"
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              ← Back to Tools
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title and Description */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="text-4xl mr-3">📝</div>
            <h1 className="text-3xl font-bold text-gray-900">YouTube Video Transcribe</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Extract subtitles and transcripts from YouTube videos. Get automatic captions, 
            manual subtitles, and download in multiple formats (TXT, SRT, VTT).
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <form onSubmit={handleTranscribe} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Video URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Enter YouTube video URL (e.g., https://www.youtube.com/watch?v=...)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
              <div className="mt-2 text-sm text-gray-500">
                <p>Supported formats:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>https://www.youtube.com/watch?v=VIDEO_ID</li>
                  <li>https://youtu.be/VIDEO_ID</li>
                  <li>Just the video ID (e.g., dQw4w9WgXcQ)</li>
                </ul>
                <div className="mt-3 p-3 bg-blue-50 rounded-md">
                  <p className="text-blue-800 font-medium mb-1">💡 Try these sample videos:</p>
                  <div className="space-y-1">
                    <button 
                      type="button"
                      onClick={() => setVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
                      className="block text-blue-600 hover:text-blue-800 text-xs"
                    >
                      Rick Astley - Never Gonna Give You Up
                    </button>
                    <button 
                      type="button"
                      onClick={() => setVideoUrl('https://www.youtube.com/watch?v=9bZkp7q19f0')}
                      className="block text-blue-600 hover:text-blue-800 text-xs"
                    >
                      PSY - Gangnam Style
                    </button>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    ⚠️ Note: Not all videos have transcripts available. Some may be disabled by the creator.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Language (optional)
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ru">Russian</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="zh">Chinese</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Will fallback to first available language if requested language is not found
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !videoUrl.trim()}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Transcribing...
                </span>
              ) : (
                'Get Transcript'
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="text-red-400">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div>
            {/* Demo Mode Notice */}
            {result.demoMode && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="text-yellow-400">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Demo Mode Active</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      🎆 This transcript is sample data because the actual video transcripts are currently unavailable. 
                      YouTube may be blocking transcript access or the video may not have captions enabled.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* Video Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {result.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span>Language: {result.language}</span>
                    <span>Duration: {result.totalDuration}</span>
                    <span>Words: {result.wordCount}</span>
                    <span>Lines: {result.transcript.length}</span>
                    {result.cached && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        Cached
                      </span>
                    )}
                    {result.demoMode && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        🎆 Demo Mode
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Download Options</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => downloadTranscript('txt')}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm"
                  >
                    📄 Download as TXT
                  </button>
                  <button
                    onClick={() => downloadTranscript('srt')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    🎬 Download as SRT
                  </button>
                  <button
                    onClick={() => downloadTranscript('vtt')}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    🌐 Download as VTT
                  </button>
                  <button
                    onClick={() => copyToClipboard(result.fullText)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm"
                  >
                    📋 Copy Full Text
                  </button>
                </div>
              </div>
            </div>

            {/* Transcript Display */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transcript</h3>
              
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                <div className="divide-y divide-gray-100">
                  {result.transcript.map((item, index) => (
                    <div key={index} className="p-4 hover:bg-gray-50">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                        <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded shrink-0">
                          {item.timestamp}
                        </span>
                        <p className="text-gray-800 flex-1 leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Text View */}
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Full Text (Paragraph Format)</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4 max-h-64 overflow-y-auto">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {result.fullText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}