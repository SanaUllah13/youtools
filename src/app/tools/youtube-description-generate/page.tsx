'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function YouTubeDescriptionGeneratorPage() {
  const [formData, setFormData] = useState({
    title: '',
    bullets: [''] as string[]
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
      const response = await fetch('/api/youtube/description/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          bullets: formData.bullets.filter(bullet => bullet.trim()),
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

  const addBullet = () => {
    setFormData({...formData, bullets: [...formData.bullets, '']});
  };

  const removeBullet = (index: number) => {
    const newBullets = formData.bullets.filter((_, i) => i !== index);
    setFormData({...formData, bullets: newBullets});
  };

  const updateBullet = (index: number, value: string) => {
    const newBullets = [...formData.bullets];
    newBullets[index] = value;
    setFormData({...formData, bullets: newBullets});
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
                <span className="text-2xl">📜</span>
                <h1 className="text-lg font-semibold text-gray-900">YouTube Description Generator</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            YouTube Description Generator
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate compelling YouTube video descriptions that engage viewers, improve SEO,
            and encourage subscriptions and engagement.
          </p>
        </div>

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
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Key Points (Optional)
                </label>
                <button
                  type="button"
                  onClick={addBullet}
                  className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors"
                >
                  + Add Point
                </button>
              </div>
              {formData.bullets.map((bullet, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={bullet}
                    onChange={(e) => updateBullet(index, e.target.value)}
                    placeholder={`Key point ${index + 1}...`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                  />
                  {formData.bullets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBullet(index)}
                      className="text-red-600 hover:text-red-800 px-2"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <p className="text-sm text-gray-500 mt-2">
                Add key points your video covers to generate more targeted descriptions
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Generating Description...' : 'Generate Description'}
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
              <h3 className="text-lg font-semibold text-gray-900">Generated Description</h3>
              <button
                onClick={() => navigator.clipboard.writeText(result.description)}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                Copy Description
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <pre className="text-gray-900 whitespace-pre-wrap text-sm font-sans">
                  {result.description}
                </pre>
              </div>

              {result.stats && (
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Description Stats</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-semibold text-blue-600">
                        {result.stats.characters}
                      </div>
                      <div className="text-sm text-blue-700">Characters</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-semibold text-green-600">
                        {result.stats.words}
                      </div>
                      <div className="text-sm text-green-700">Words</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-semibold text-purple-600">
                        {result.stats.hashtags}
                      </div>
                      <div className="text-sm text-purple-700">Hashtags</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-3">💡 Description Tips</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• First 125 characters are most important for search visibility</p>
                  <p>• Include your main keywords early in the description</p>
                  <p>• Add timestamps for longer videos to improve user experience</p>
                  <p>• Include links to your social media and other videos</p>
                  <p>• Use 3-5 relevant hashtags at the end</p>
                </div>
              </div>
            </div>
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