'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function YouTubeMoneyCalculatorPage() {
  const [formData, setFormData] = useState({
    views: 10000,
    rpmLow: 1,
    rpmHigh: 5
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
      const response = await fetch('/api/youtube/money', {
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
                <span className="text-2xl">💰</span>
                <h1 className="text-lg font-semibold text-gray-900">YouTube Money Calculator</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            YouTube Money Calculator
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Calculate potential earnings from your YouTube videos based on views and RPM (Revenue Per Mille).
            Get estimates for different scenarios and plan your content strategy.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Views *
              </label>
              <input
                type="number"
                min="1"
                value={formData.views}
                onChange={(e) => setFormData({...formData, views: parseInt(e.target.value)})}
                placeholder="10000"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white placeholder-gray-400 font-medium"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter the number of views your video has received or expects to receive
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RPM Low Estimate ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.rpmLow}
                  onChange={(e) => setFormData({...formData, rpmLow: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white font-medium"
                />
                <p className="mt-1 text-sm text-gray-500">Conservative RPM estimate</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RPM High Estimate ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.rpmHigh}
                  onChange={(e) => setFormData({...formData, rpmHigh: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white font-medium"
                />
                <p className="mt-1 text-sm text-gray-500">Optimistic RPM estimate</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 mb-2">💡 RPM Guidelines</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Gaming/Tech: $1-4 RPM typical</p>
                <p>• Finance/Business: $3-8 RPM typical</p>
                <p>• Entertainment: $0.50-2 RPM typical</p>
                <p>• Education: $2-5 RPM typical</p>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Calculating...' : 'Calculate Earnings'}
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
              <h3 className="text-lg font-semibold text-gray-900">Earnings Estimate</h3>
              <span className="text-sm text-gray-500">{result.views?.toLocaleString()} views</span>
            </div>
            
            {result.earnings && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      ${result.earnings.low?.toFixed(2)}
                    </div>
                    <div className="text-sm text-green-700 mt-1">Conservative Estimate</div>
                    <div className="text-xs text-green-600 mt-1">RPM: ${result.rpmLow}</div>
                  </div>
                  
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">
                      ${result.earnings.average?.toFixed(2)}
                    </div>
                    <div className="text-sm text-blue-700 mt-1">Average Estimate</div>
                    <div className="text-xs text-blue-600 mt-1">RPM: ${((result.rpmLow + result.rpmHigh) / 2).toFixed(2)}</div>
                  </div>
                  
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">
                      ${result.earnings.high?.toFixed(2)}
                    </div>
                    <div className="text-sm text-purple-700 mt-1">Optimistic Estimate</div>
                    <div className="text-xs text-purple-600 mt-1">RPM: ${result.rpmHigh}</div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Scaling Projections</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Views
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Low Estimate
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            High Estimate
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {[1, 5, 10, 50, 100].map(multiplier => (
                          <tr key={multiplier}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {(result.views * multiplier).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                              ${(result.earnings.low * multiplier).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600">
                              ${(result.earnings.high * multiplier).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-3">💡 Money Making Tips</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Focus on high-value niches like finance, business, or tech</p>
                    <p>• Optimize for watch time and engagement, not just views</p>
                    <p>• Consider multiple revenue streams beyond just AdSense</p>
                    <p>• Target countries with higher advertising rates (US, UK, Canada)</p>
                    <p>• Create longer videos (8+ minutes) to include more ads</p>
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