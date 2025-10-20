'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function YouTubeHashtagExtractorPage() {
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
      const response = await fetch(`/api/youtube/hashtags/extract?input=${encodeURIComponent(videoUrl)}`);
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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
                YouTools
              </Link>
              <span className="text-gray-300">•</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">#️⃣</span>
                <h1 className="text-lg font-semibold text-gray-900">YouTube Hashtag Extractor</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            YouTube Hashtag Extractor
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Extract hashtags from YouTube video descriptions and analyze hashtag usage patterns
            to understand trending content strategies.
          </p>
        </div>

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
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter a YouTube video URL to extract hashtags from its description
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Extracting Hashtags...' : 'Extract Hashtags'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <div className="text-red-800"><strong>Error:</strong> {error}</div>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Extracted Hashtags</h3>
              <span className="text-sm text-gray-500">{result.hashtags?.length || 0} hashtags found</span>
            </div>
            
            {result.hashtags && result.hashtags.length > 0 ? (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {result.hashtags.map((hashtag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-block bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full cursor-pointer hover:bg-purple-200 transition-colors"
                      onClick={() => navigator.clipboard.writeText(hashtag)}
                      title="Click to copy"
                    >
                      {hashtag}
                    </span>
                  ))}
                </div>
                
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Hashtag Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-semibold text-purple-600">
                        {result.hashtags.length}
                      </div>
                      <div className="text-sm text-purple-700">Total Hashtags</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-semibold text-blue-600">
                        {result.hashtags.filter((tag: string) => tag.length > 10).length}
                      </div>
                      <div className="text-sm text-blue-700">Long Hashtags</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-semibold text-green-600">
                        {result.hashtags.filter((tag: string) => tag.length <= 10).length}
                      </div>
                      <div className="text-sm text-green-700">Short Hashtags</div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">Export Hashtags</h4>
                    <button
                      onClick={() => navigator.clipboard.writeText(result.hashtags.join(' '))}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      Copy All
                    </button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <code className="text-sm text-gray-700">{result.hashtags.join(' ')}</code>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">#️⃣</div>
                <p className="text-gray-600">No hashtags found in this video's description</p>
                <p className="text-sm text-gray-500 mt-1">
                  The video might not use hashtags or they might be in a different format
                </p>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700">
            ← Back to All Tools
          </Link>
        </div>
      </main>
    </div>
  );
}