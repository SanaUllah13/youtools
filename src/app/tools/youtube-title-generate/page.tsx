'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function YouTubeTitleGeneratorPage() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/youtube/title/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: topic,
          mode: 'economy'
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
                <span className="text-2xl">📝</span>
                <h1 className="text-lg font-semibold text-gray-900">YouTube Title Generator</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            YouTube Title Generator
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate catchy, click-worthy YouTube titles that grab attention and improve your video's
            discoverability. Perfect for content creators looking to boost their views.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Topic *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., How to learn JavaScript, Best cooking tips, Travel vlog..."
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white placeholder-gray-400 font-medium"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter your video topic or main idea to generate engaging titles
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Generating Titles...' : 'Generate Titles'}
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
              <h3 className="text-lg font-semibold text-gray-900">Generated Titles</h3>
              <span className="text-sm text-gray-500">{result.titles?.length || 0} titles</span>
            </div>
            
            {result.titles && result.titles.length > 0 && (
              <div className="space-y-4">
                {result.titles.map((title: string, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-black font-semibold text-lg mb-1">{title}</h4>
                        <div className="text-sm text-gray-500">
                          {title.length} characters • {title.length <= 60 ? 'Optimal length' : 'Consider shortening'}
                        </div>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(title)}
                        className="ml-4 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-6 mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">Export All Titles</h4>
                    <button
                      onClick={() => navigator.clipboard.writeText(result.titles.join('\n'))}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      Copy All
                    </button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <pre className="text-sm text-black font-mono whitespace-pre-wrap">
                      {result.titles.join('\n')}
                    </pre>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-3">💡 Title Tips</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Keep titles under 60 characters for mobile visibility</p>
                    <p>• Use power words like "Best", "Ultimate", "Secret", "Amazing"</p>
                    <p>• Include your main keyword early in the title</p>
                    <p>• Create curiosity with questions or surprising facts</p>
                    <p>• Test different titles to see what works for your audience</p>
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