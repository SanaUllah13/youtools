'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdSenseCalculatorPage() {
  const [formData, setFormData] = useState({
    pageViews: 10000,
    ctr: 0.02,
    cpc: 0.50
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
      const response = await fetch('/api/seo/adsense', {
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
                <span className="text-2xl">💵</span>
                <h1 className="text-lg font-semibold text-gray-900">AdSense Calculator</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            AdSense Revenue Calculator
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Calculate your potential Google AdSense earnings based on page views, click-through rate (CTR),
            and cost per click (CPC). Plan your content strategy and revenue goals.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Page Views *
              </label>
              <input
                type="number"
                min="1"
                value={formData.pageViews}
                onChange={(e) => setFormData({...formData, pageViews: parseInt(e.target.value)})}
                placeholder="10000"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white placeholder-gray-400 font-medium"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter your website's monthly page views
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Click-Through Rate (CTR) %
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.ctr * 100}
                  onChange={(e) => setFormData({...formData, ctr: parseFloat(e.target.value) / 100})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white font-medium"
                />
                <p className="mt-1 text-sm text-gray-500">Typical range: 0.5% - 3%</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost Per Click (CPC) $
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cpc}
                  onChange={(e) => setFormData({...formData, cpc: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white font-medium"
                />
                <p className="mt-1 text-sm text-gray-500">Typical range: $0.10 - $2.00</p>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">💡 Industry Benchmarks</h4>
              <div className="text-sm text-yellow-700 space-y-1">
                <p><strong>Finance:</strong> CTR: 1-2%, CPC: $1-3</p>
                <p><strong>Technology:</strong> CTR: 1.5-2.5%, CPC: $0.50-1.50</p>
                <p><strong>Health:</strong> CTR: 1-3%, CPC: $0.80-2.00</p>
                <p><strong>Travel:</strong> CTR: 1-2%, CPC: $0.30-1.00</p>
                <p><strong>Food:</strong> CTR: 1.5-2.5%, CPC: $0.20-0.80</p>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Calculating Revenue...' : 'Calculate AdSense Revenue'}
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
              <h3 className="text-lg font-semibold text-gray-900">Revenue Projection</h3>
              <span className="text-sm text-gray-500">{result.pageViews?.toLocaleString()} page views</span>
            </div>
            
            {result.revenue && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {result.clicks?.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-700 mt-1">Ad Clicks</div>
                    <div className="text-xs text-blue-600 mt-1">CTR: {(result.ctr * 100).toFixed(2)}%</div>
                  </div>

                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      ${result.revenue.daily?.toFixed(2)}
                    </div>
                    <div className="text-sm text-green-700 mt-1">Daily Revenue</div>
                    <div className="text-xs text-green-600 mt-1">CPC: ${result.cpc}</div>
                  </div>
                  
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">
                      ${result.revenue.monthly?.toFixed(2)}
                    </div>
                    <div className="text-sm text-purple-700 mt-1">Monthly Revenue</div>
                    <div className="text-xs text-purple-600 mt-1">Base calculation</div>
                  </div>
                  
                  <div className="text-center p-6 bg-orange-50 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600">
                      ${result.revenue.yearly?.toFixed(2)}
                    </div>
                    <div className="text-sm text-orange-700 mt-1">Yearly Revenue</div>
                    <div className="text-xs text-orange-600 mt-1">Projected annual</div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Revenue Scenarios</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Scenario
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Page Views
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Monthly Revenue
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Yearly Revenue
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {[
                          { name: 'Current', multiplier: 1 },
                          { name: '2x Growth', multiplier: 2 },
                          { name: '5x Growth', multiplier: 5 },
                          { name: '10x Growth', multiplier: 10 }
                        ].map(scenario => (
                          <tr key={scenario.name}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {scenario.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {(result.pageViews * scenario.multiplier).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                              ${(result.revenue.monthly * scenario.multiplier).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600">
                              ${(result.revenue.yearly * scenario.multiplier).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-3">💡 Revenue Optimization Tips</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• <strong>Improve CTR:</strong> Better ad placement, relevant content, mobile optimization</p>
                    <p>• <strong>Increase CPC:</strong> Target high-value keywords, quality content, user engagement</p>
                    <p>• <strong>Boost Traffic:</strong> SEO optimization, social media marketing, quality content</p>
                    <p>• <strong>Ad Placement:</strong> Above the fold, within content, responsive design</p>
                    <p>• <strong>Content Strategy:</strong> Focus on profitable niches with higher CPC rates</p>
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