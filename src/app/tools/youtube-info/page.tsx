'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function YouTubeInfoPage() {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`/api/youtube/info?input=${encodeURIComponent(videoUrl)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }
      
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
                YouTools
              </Link>
              <span className="text-gray-300">•</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📹</span>
                <h1 className="text-lg font-semibold text-gray-900">YouTube Video Info</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tool Description */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            YouTube Video Info Extractor
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Extract detailed information from any YouTube video including title, description, 
            view count, duration, author, and more.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Video URL or Video ID
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtu.be/dQw4w9WgXcQ or dQw4w9WgXcQ"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter a YouTube video URL (any format) or just the video ID
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Extracting Info...' : 'Extract Video Information'}
            </button>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <div className="text-red-800">
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Video Information</h3>
            
            {/* Video Thumbnail and Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-1">
                {result.thumbnails && (
                  <img 
                    src={result.thumbnails[result.thumbnails.length - 1]?.url} 
                    alt="Video thumbnail"
                    className="w-full rounded-lg shadow-sm"
                  />
                )}
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Title:</label>
                  <h4 className="text-lg font-semibold text-gray-900 mt-1">{result.title}</h4>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Channel:</label>
                  <p className="text-gray-900 mt-1">{result.author}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Views:</label>
                    <p className="text-gray-900 font-medium">{result.viewCount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Duration:</label>
                    <p className="text-gray-900 font-medium">
                      {Math.floor(result.lengthSeconds / 60)}:{(result.lengthSeconds % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {result.description && (
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-600">Description:</label>
                <div className="mt-2 p-4 bg-gray-50 rounded-md max-h-40 overflow-y-auto">
                  <p className="text-gray-900 whitespace-pre-wrap text-sm">
                    {result.description.length > 500 
                      ? `${result.description.substring(0, 500)}...` 
                      : result.description
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Additional Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {result.likes && (
                <div className="text-center p-3 bg-green-50 rounded-md">
                  <div className="text-lg font-semibold text-green-600">{result.likes.toLocaleString()}</div>
                  <div className="text-sm text-green-700">Likes</div>
                </div>
              )}
              {result.category && (
                <div className="text-center p-3 bg-blue-50 rounded-md">
                  <div className="text-lg font-semibold text-blue-600">{result.category}</div>
                  <div className="text-sm text-blue-700">Category</div>
                </div>
              )}
              {result.publishDate && (
                <div className="text-center p-3 bg-purple-50 rounded-md">
                  <div className="text-sm font-semibold text-purple-600">
                    {new Date(result.publishDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-purple-700">Published</div>
                </div>
              )}
              {result.uploadDate && (
                <div className="text-center p-3 bg-orange-50 rounded-md">
                  <div className="text-sm font-semibold text-orange-600">
                    {new Date(result.uploadDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-orange-700">Uploaded</div>
                </div>
              )}
            </div>

            {/* Raw JSON */}
            <details className="mt-6">
              <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900 py-2">
                View Raw JSON Response
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-x-auto border">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            ← Back to All Tools
          </Link>
        </div>
      </main>
    </div>
  );
}