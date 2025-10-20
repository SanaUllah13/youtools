'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function YouTubeEmbedGeneratorPage() {
  const [formData, setFormData] = useState({
    input: '',
    autoplay: '0',
    controls: '1'
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
      const response = await fetch('/api/youtube/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
                YouTools
              </Link>
              <span className="text-gray-300">•</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📺</span>
                <h1 className="text-lg font-semibold text-gray-900">YouTube Embed Generator</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            YouTube Embed Generator
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate custom YouTube embed codes with your preferred settings like autoplay, 
            controls, and more. Perfect for websites and blogs.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube URL or Video ID *
              </label>
              <input
                type="text"
                value={formData.input}
                onChange={(e) => setFormData({...formData, input: e.target.value})}
                placeholder="https://www.youtube.com/watch?v=... or video ID"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white placeholder-gray-400 font-medium"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter a YouTube URL or just the 11-character video ID
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Autoplay
                </label>
                <select
                  value={formData.autoplay}
                  onChange={(e) => setFormData({...formData, autoplay: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white font-medium"
                >
                  <option value="0">Disabled</option>
                  <option value="1">Enabled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Controls
                </label>
                <select
                  value={formData.controls}
                  onChange={(e) => setFormData({...formData, controls: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white font-medium"
                >
                  <option value="0">Hidden</option>
                  <option value="1">Visible</option>
                </select>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Generating Embed Code...' : 'Generate Embed Code'}
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
              <h3 className="text-lg font-semibold text-gray-900">Generated Embed Code</h3>
              <button
                onClick={() => navigator.clipboard.writeText(result.embedCode)}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                Copy Code
              </button>
            </div>
            
            {result.embedCode && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <pre className="text-sm text-black font-mono whitespace-pre-wrap overflow-x-auto">
                    {result.embedCode}
                  </pre>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Preview</h4>
                  <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                    <div dangerouslySetInnerHTML={{ __html: result.embedCode }} />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-3">💡 Embed Tips</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Use autoplay sparingly - many users find it annoying</p>
                    <p>• Always test embeds on mobile devices</p>
                    <p>• Consider using lazy loading for better page performance</p>
                    <p>• Make sure your embed is responsive with CSS</p>
                  </div>
                </div>
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