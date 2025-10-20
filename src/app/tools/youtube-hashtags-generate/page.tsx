'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function YouTubeHashtagGeneratorPage() {
  const [formData, setFormData] = useState({
    title: '',
    niche: '',
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
      const response = await fetch('/api/youtube/hashtags/generate', {
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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
                YouTools
              </Link>
              <span className="text-gray-300">•</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🔥</span>
                <h1 className="text-lg font-semibold text-gray-900">YouTube Hashtag Generator</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            YouTube Hashtag Generator
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate trending hashtags for your YouTube videos to increase visibility and engagement.
            Choose between rule-based or AI-powered generation for best results.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Video Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Enter your video title..."
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white placeholder-gray-400 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Niche/Category *</label>
              <input
                type="text"
                value={formData.niche}
                onChange={(e) => setFormData({...formData, niche: e.target.value})}
                placeholder="e.g., technology, cooking, fitness, gaming..."
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white placeholder-gray-400 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Hashtags</label>
              <input
                type="number"
                min="5"
                max="50"
                value={formData.max}
                onChange={(e) => setFormData({...formData, max: parseInt(e.target.value)})}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white font-medium"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Generating Hashtags...' : 'Generate Hashtags'}
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
              <h3 className="text-lg font-semibold text-gray-900">Generated Hashtags</h3>
              <span className="text-sm text-gray-500">{result.hashtags?.length || 0} hashtags</span>
            </div>
            
            {result.hashtags && result.hashtags.length > 0 && (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {result.hashtags.map((hashtag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-block bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full cursor-pointer hover:bg-red-200 transition-colors"
                      onClick={() => navigator.clipboard.writeText(hashtag)}
                      title="Click to copy"
                    >
                      {hashtag}
                    </span>
                  ))}
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
                    <code className="text-sm text-black font-mono">{result.hashtags.join(' ')}</code>
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