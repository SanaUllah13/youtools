'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function YouTubeTagGeneratorPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    max: 25
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/youtube/tags/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          mode: 'economy' // Always use economy mode for best cost efficiency
        })
      });
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
                <span className="text-2xl">🎯</span>
                <h1 className="text-lg font-semibold text-gray-900">YouTube Tag Generator</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tool Description */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            YouTube Tag Generator
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate SEO-optimized tags for your YouTube videos to improve discoverability 
            and reach the right audience. Choose between rule-based or AI-powered generation.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Enter your video title..."
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white placeholder-gray-400 font-medium"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the title of your video for better tag suggestions
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Description (optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter your video description for more accurate tags..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white placeholder-gray-400 font-medium"
              />
              <p className="mt-1 text-sm text-gray-500">
                Providing description helps generate more relevant tags
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Tags
              </label>
              <input
                type="number"
                min="5"
                max="50"
                value={formData.max}
                onChange={(e) => setFormData({...formData, max: parseInt(e.target.value)})}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white font-medium"
              />
              <p className="mt-1 text-sm text-gray-500">
                Number of tags to generate (5-50)
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Generating Tags...' : 'Generate Tags'}
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
              <h3 className="text-lg font-semibold text-gray-900">Generated Tags</h3>
              <div className="text-sm text-gray-500">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full mr-2">
                  {result.mode?.toUpperCase()}
                </span>
                {result.tags?.length || 0} tags
              </div>
            </div>
            
            {result.tags && result.tags.length > 0 ? (
              <div className="space-y-6">
                {/* Generated Tags */}
                <div className="flex flex-wrap gap-2">
                  {result.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full cursor-pointer hover:bg-green-200 transition-colors"
                      onClick={() => navigator.clipboard.writeText(tag)}
                      title="Click to copy"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                {/* Tag Stats */}
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Tag Statistics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      <div className="text-sm text-purple-700">Multi-word</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-semibold text-orange-600">
                        {result.tags.reduce((acc: number, tag: string) => acc + tag.length, 0)}
                      </div>
                      <div className="text-sm text-orange-700">Total Chars</div>
                    </div>
                  </div>
                </div>

                {/* Copy Options */}
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">Export Tags</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(result.tags.join(', '))}
                        className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                      >
                        Copy Comma-separated
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(result.tags.join('\n'))}
                        className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors"
                      >
                        Copy Line-separated
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <code className="text-sm text-gray-700 block whitespace-pre-wrap">
                      {result.tags.join(', ')}
                    </code>
                  </div>
                </div>

                {/* Usage Tips */}
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-3">💡 Usage Tips</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Use a mix of broad and specific tags for better reach</li>
                    <li>Include your brand name and channel-specific tags</li>
                    <li>Research trending tags in your niche regularly</li>
                    <li>YouTube allows up to 500 characters total for tags</li>
                    <li>Front-load your most important tags</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">🎯</div>
                <p className="text-gray-600">No tags could be generated</p>
                <p className="text-sm text-gray-500 mt-1">
                  Try providing more specific title or description content
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