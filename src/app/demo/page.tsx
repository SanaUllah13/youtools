'use client';

import { useState } from 'react';

export default function DemoPage() {
  const [videoUrl, setVideoUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
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
        throw new Error(data.error || 'Failed to fetch video info');
      }
      
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">YouTube Video Info Demo</h1>
          <p className="text-gray-600">Test our YouTube video information extraction API</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Video URL or ID
              </label>
              <input
                type="text"
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtu.be/dQw4w9WgXcQ or dQw4w9WgXcQ"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Get Video Info'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <div className="text-red-800 text-sm">
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Video Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Title:</label>
                <p className="text-gray-900">{result.title}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Author:</label>
                <p className="text-gray-900">{result.author}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">View Count:</label>
                  <p className="text-gray-900">{result.viewCount?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Duration (seconds):</label>
                  <p className="text-gray-900">{result.lengthSeconds}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Description:</label>
                <p className="text-gray-900 text-sm mt-1 max-h-32 overflow-y-auto">
                  {result.description || 'No description available'}
                </p>
              </div>

              {result.keywords && result.keywords.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Keywords:</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {result.keywords.slice(0, 10).map((keyword: string, index: number) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <details>
                  <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900">
                    Raw JSON Response
                  </summary>
                  <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-x-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <a
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm"
          >
            ← Back to Tools
          </a>
        </div>
      </div>
    </div>
  );
}