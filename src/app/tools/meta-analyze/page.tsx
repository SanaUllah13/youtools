'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MetaTagsAnalyzerPage() {
  const [formData, setFormData] = useState({
    html: ''
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
      const response = await fetch('/api/seo/meta-analyze', {
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

  const handleUrlLoad = async () => {
    const url = prompt('Enter a URL to fetch its HTML:');
    if (!url) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
      const html = await response.text();
      setFormData({ html });
    } catch (err) {
      setError('Failed to fetch HTML from URL');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
                <span className="text-2xl">🔍</span>
                <h1 className="text-lg font-semibold text-gray-900">Meta Tags Analyzer</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Meta Tags Analyzer
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Analyze and audit your website's meta tags for SEO optimization. 
            Check title tags, meta descriptions, and other important HTML meta elements.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  HTML Content *
                </label>
                <button
                  type="button"
                  onClick={handleUrlLoad}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Load from URL
                </button>
              </div>
              <textarea
                value={formData.html}
                onChange={(e) => setFormData({...formData, html: e.target.value})}
                placeholder="Paste your HTML content here or click 'Load from URL' to fetch from a website..."
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white placeholder-gray-400 font-mono text-sm"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter the complete HTML of a webpage or the &lt;head&gt; section
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 mb-2">💡 What We Analyze</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• <strong>Title Tag:</strong> Length, uniqueness, and SEO optimization</p>
                <p>• <strong>Meta Description:</strong> Length, compelling copy, and CTR potential</p>
                <p>• <strong>Open Graph Tags:</strong> Social media sharing optimization</p>
                <p>• <strong>Twitter Cards:</strong> Twitter-specific meta tags</p>
                <p>• <strong>Schema Markup:</strong> Structured data for search engines</p>
                <p>• <strong>Canonical URLs:</strong> Duplicate content prevention</p>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Analyzing Meta Tags...' : 'Analyze Meta Tags'}
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
              <h3 className="text-lg font-semibold text-gray-900">Meta Tags Analysis Results</h3>
              <div className="flex space-x-2">
                {result.score && (
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    result.score >= 80 
                      ? 'bg-green-100 text-green-800' 
                      : result.score >= 60 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    SEO Score: {result.score}/100
                  </span>
                )}
              </div>
            </div>
            
            {result.analysis && (
              <div className="space-y-6">
                {/* Title Tag Analysis */}
                {result.analysis.title && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900">Title Tag</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        getStatusColor(result.analysis.title.status)
                      }`}>
                        {result.analysis.title.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-900 bg-gray-50 p-3 rounded font-mono text-sm">
                        {result.analysis.title.content || 'No title tag found'}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Length:</span>
                          <span className="ml-2 font-medium">
                            {result.analysis.title.length || 0} characters
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Recommendation:</span>
                          <span className="ml-2 text-blue-600">50-60 characters</span>
                        </div>
                      </div>
                      {result.analysis.title.issues && result.analysis.title.issues.length > 0 && (
                        <div className="mt-2">
                          <span className="text-sm text-red-600 font-medium">Issues:</span>
                          <ul className="mt-1 text-sm text-red-600 list-disc list-inside">
                            {result.analysis.title.issues.map((issue: string, index: number) => (
                              <li key={index}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Meta Description Analysis */}
                {result.analysis.description && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900">Meta Description</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        getStatusColor(result.analysis.description.status)
                      }`}>
                        {result.analysis.description.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-900 bg-gray-50 p-3 rounded font-mono text-sm">
                        {result.analysis.description.content || 'No meta description found'}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Length:</span>
                          <span className="ml-2 font-medium">
                            {result.analysis.description.length || 0} characters
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Recommendation:</span>
                          <span className="ml-2 text-blue-600">150-160 characters</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Open Graph Tags */}
                {result.analysis.openGraph && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Open Graph Tags</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {Object.entries(result.analysis.openGraph).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-gray-600 capitalize">{key.replace('og:', '')}:</span>
                          <p className="text-gray-900 mt-1 bg-gray-50 p-2 rounded font-mono text-xs">
                            {String(value) || 'Not found'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SEO Recommendations */}
                {result.recommendations && result.recommendations.length > 0 && (
                  <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-3">SEO Recommendations</h4>
                    <ul className="space-y-1 text-sm text-yellow-700">
                      {result.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-yellow-500 mr-2">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* All Found Meta Tags */}
                {result.allTags && result.allTags.length > 0 && (
                  <div className="border-t pt-6">
                    <details>
                      <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900 mb-4">
                        All Meta Tags Found ({result.allTags.length})
                      </summary>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {result.allTags.map((tag: any, index: number) => (
                          <div key={index} className="bg-gray-50 p-3 rounded text-xs font-mono">
                            <code className="text-gray-800">{tag.html}</code>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
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