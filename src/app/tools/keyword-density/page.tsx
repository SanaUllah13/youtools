'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function KeywordDensityPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/seo/keyword-density', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
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
                <span className="text-2xl">📊</span>
                <h1 className="text-lg font-semibold text-gray-900">Keyword Density Checker</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tool Description */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Keyword Density Analyzer
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Analyze keyword frequency and density in your text content. Perfect for SEO optimization, 
            content analysis, and ensuring proper keyword distribution.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Content *
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your text content here for keyword density analysis..."
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
                required
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>Enter your blog post, article, or any text content</span>
                <span>{text.length} characters</span>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Analyzing Keywords...' : 'Analyze Keyword Density'}
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
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Text Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-semibold text-blue-600">
                    {result.totalWords?.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-700">Total Words</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-semibold text-green-600">
                    {result.uniqueWords?.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-700">Unique Words</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-semibold text-purple-600">
                    {result.analysis?.sentences || 'N/A'}
                  </div>
                  <div className="text-sm text-purple-700">Sentences</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-semibold text-orange-600">
                    {result.analysis?.avgWordsPerSentence || 'N/A'}
                  </div>
                  <div className="text-sm text-orange-700">Avg Words/Sentence</div>
                </div>
              </div>
            </div>

            {/* Keyword Density Results */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Keyword Density Analysis</h3>
                <span className="text-sm text-gray-500">
                  Top {Math.min(20, result.keywords?.length || 0)} keywords
                </span>
              </div>
              
              {result.keywords && result.keywords.length > 0 ? (
                <div className="space-y-4">
                  {/* High Density Warning */}
                  {result.analysis?.highDensity > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                      <div className="flex">
                        <div className="text-yellow-400 mr-3">⚠️</div>
                        <div>
                          <h4 className="text-yellow-800 font-medium">High Keyword Density Detected</h4>
                          <p className="text-yellow-700 text-sm mt-1">
                            {result.analysis.highDensity} keyword(s) have density above 3%. Consider reducing usage to avoid keyword stuffing.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Keyword Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Keyword</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Count</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Density</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.keywords.slice(0, 20).map((keyword: any, index: number) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <span className="font-medium text-gray-900">{keyword.word}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                                {keyword.count}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                                keyword.density > 3 
                                  ? 'bg-red-100 text-red-800'
                                  : keyword.density > 1.5
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {keyword.density.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {keyword.density > 3 ? (
                                <span className="text-red-600 text-sm">Too High</span>
                              ) : keyword.density > 1.5 ? (
                                <span className="text-yellow-600 text-sm">Moderate</span>
                              ) : (
                                <span className="text-green-600 text-sm">Good</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {result.keywords.length > 20 && (
                    <p className="text-sm text-gray-500 text-center">
                      Showing top 20 keywords. Full analysis available in JSON response below.
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">📊</div>
                  <p className="text-gray-600">No keywords found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Try entering some text content to analyze
                  </p>
                </div>
              )}
            </div>

            {/* SEO Tips */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 SEO Recommendations</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Keep keyword density between 0.5% - 2.5% for optimal SEO</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Focus on natural language rather than keyword stuffing</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Use semantic variations and related keywords</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Place important keywords in headings and early paragraphs</span>
                </div>
                <div className="flex items-start">
                  <span className="text-orange-500 mr-2">⚠</span>
                  <span>Avoid keyword density above 3% to prevent penalties</span>
                </div>
              </div>
            </div>

            {/* Raw JSON */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <details>
                <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900 py-2">
                  View Raw JSON Response
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-x-auto border">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
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