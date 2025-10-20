'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TextComparePage() {
  const [formData, setFormData] = useState({
    textA: '',
    textB: ''
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
      const response = await fetch('/api/seo/text-compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          a: formData.textA,
          b: formData.textB
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
                <span className="text-2xl">⚖️</span>
                <h1 className="text-lg font-semibold text-gray-900">Text Compare Tool</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tool Description */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Text Compare Tool
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Compare two texts side by side and see the differences, similarities, and get detailed 
            analysis including word count, character differences, and similarity percentage.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Text A */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text A (Original) *
                </label>
                <textarea
                  value={formData.textA}
                  onChange={(e) => setFormData({...formData, textA: e.target.value})}
                  placeholder="Enter your first text here..."
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
                  required
                />
                <div className="text-sm text-gray-500 mt-1">
                  {formData.textA.length} characters
                </div>
              </div>

              {/* Text B */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text B (Comparison) *
                </label>
                <textarea
                  value={formData.textB}
                  onChange={(e) => setFormData({...formData, textB: e.target.value})}
                  placeholder="Enter your second text here..."
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
                  required
                />
                <div className="text-sm text-gray-500 mt-1">
                  {formData.textB.length} characters
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || !formData.textA.trim() || !formData.textB.trim()}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Comparing Texts...' : 'Compare Texts'}
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
            {/* Similarity Overview */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Similarity Analysis</h3>
              
              {/* Similarity Score */}
              <div className="text-center mb-6">
                <div className={`text-6xl font-bold mb-2 ${
                  result.similarity?.percentage >= 80 ? 'text-green-600' :
                  result.similarity?.percentage >= 60 ? 'text-yellow-600' :
                  result.similarity?.percentage >= 40 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {result.similarity?.percentage}%
                </div>
                <div className="text-lg text-gray-600">Similarity Score</div>
                <div className={`text-sm mt-2 ${
                  result.similarity?.percentage >= 80 ? 'text-green-700' :
                  result.similarity?.percentage >= 60 ? 'text-yellow-700' :
                  result.similarity?.percentage >= 40 ? 'text-orange-700' : 'text-red-700'
                }`}>
                  {result.similarity?.percentage >= 80 ? 'Very Similar' :
                   result.similarity?.percentage >= 60 ? 'Moderately Similar' :
                   result.similarity?.percentage >= 40 ? 'Somewhat Similar' : 'Very Different'}
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-semibold text-green-600">
                    {result.similarity?.details?.unchangedWords || 0}
                  </div>
                  <div className="text-sm text-green-700">Unchanged Words</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-semibold text-red-600">
                    {result.similarity?.details?.removedWords || 0}
                  </div>
                  <div className="text-sm text-red-700">Removed Words</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-semibold text-blue-600">
                    {result.similarity?.details?.addedWords || 0}
                  </div>
                  <div className="text-sm text-blue-700">Added Words</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-semibold text-purple-600">
                    {result.similarity?.details?.totalChanges || 0}
                  </div>
                  <div className="text-sm text-purple-700">Total Changes</div>
                </div>
              </div>
            </div>

            {/* Text Statistics Comparison */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Text Statistics</h3>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Metric</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Text A</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Text B</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium">Characters</td>
                      <td className="py-3 px-4 text-center">{formData.textA.length}</td>
                      <td className="py-3 px-4 text-center">{formData.textB.length}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-medium ${
                          formData.textB.length > formData.textA.length ? 'text-green-600' : 
                          formData.textB.length < formData.textA.length ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {formData.textB.length > formData.textA.length ? '+' : ''}
                          {formData.textB.length - formData.textA.length}
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium">Words</td>
                      <td className="py-3 px-4 text-center">
                        {formData.textA.split(/\s+/).filter(word => word.length > 0).length}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {formData.textB.split(/\s+/).filter(word => word.length > 0).length}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-medium ${
                          formData.textB.split(/\s+/).filter(word => word.length > 0).length > 
                          formData.textA.split(/\s+/).filter(word => word.length > 0).length ? 'text-green-600' : 
                          formData.textB.split(/\s+/).filter(word => word.length > 0).length < 
                          formData.textA.split(/\s+/).filter(word => word.length > 0).length ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {formData.textB.split(/\s+/).filter(word => word.length > 0).length > 
                           formData.textA.split(/\s+/).filter(word => word.length > 0).length ? '+' : ''}
                          {formData.textB.split(/\s+/).filter(word => word.length > 0).length - 
                           formData.textA.split(/\s+/).filter(word => word.length > 0).length}
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium">Lines</td>
                      <td className="py-3 px-4 text-center">{formData.textA.split('\n').length}</td>
                      <td className="py-3 px-4 text-center">{formData.textB.split('\n').length}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-medium ${
                          formData.textB.split('\n').length > formData.textA.split('\n').length ? 'text-green-600' : 
                          formData.textB.split('\n').length < formData.textA.split('\n').length ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {formData.textB.split('\n').length > formData.textA.split('\n').length ? '+' : ''}
                          {formData.textB.split('\n').length - formData.textA.split('\n').length}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Use Cases */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Use Cases</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">Content & Writing</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Compare document versions</li>
                    <li>Check content plagiarism</li>
                    <li>Track content changes</li>
                    <li>Analyze writing improvements</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">Development & SEO</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Compare meta descriptions</li>
                    <li>Analyze content updates</li>
                    <li>Check A/B test variations</li>
                    <li>Review content optimization</li>
                  </ul>
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