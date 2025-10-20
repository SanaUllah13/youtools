'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function YouTubeTagsPage() {
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
      const response = await fetch(`/api/youtube/tags?input=${encodeURIComponent(videoUrl)}`);
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
                <span className="text-2xl">🏷️</span>
                <h1 className="text-lg font-semibold text-gray-900">YouTube Tag Extractor</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tool Description */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            YouTube Tag Extractor
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Extract and analyze tags from any YouTube video to understand SEO strategies 
            and discover trending keywords in your niche.
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
                Enter a YouTube video URL to extract its tags and keywords
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Extracting Tags...' : 'Extract Video Tags'}
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
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Extracted Tags</h3>
              <span className="text-sm text-gray-500">
                {result.tags?.length || 0} tags found
              </span>
            </div>
            
            {result.tags && result.tags.length > 0 ? (
              <div className="space-y-6">
                {/* Tags Display */}
                <div className="flex flex-wrap gap-2">
                  {result.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                {/* Tag Analysis */}
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Tag Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-semibold text-blue-600">
                        {result.tags.length}
                      </div>
                      <div className="text-sm text-blue-700">Total Tags</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-semibold text-green-600">
                        {Math.round(result.tags.reduce((acc: number, tag: string) => acc + tag.length, 0) / result.tags.length)}
                      </div>
                      <div className="text-sm text-green-700">Avg. Length</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-semibold text-purple-600">
                        {result.tags.filter((tag: string) => tag.includes(' ')).length}
                      </div>
                      <div className="text-sm text-purple-700">Multi-word Tags</div>
                    </div>
                  </div>
                </div>

                {/* Copy Tags */}
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">Copy Tags</h4>
                    <button
                      onClick={() => navigator.clipboard.writeText(result.tags.join(', '))}
                      className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors"
                    >
                      Copy All
                    </button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <code className="text-sm text-gray-700">
                      {result.tags.join(', ')}
                    </code>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">🏷️</div>
                <p className="text-gray-600">No tags found for this video</p>
                <p className="text-sm text-gray-500 mt-1">
                  The video might not have any public tags or they might be hidden by the creator
                </p>
              </div>
            )}

            {/* Raw JSON */}
            <details className="mt-6 border-t pt-6">
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