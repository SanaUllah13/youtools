'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BackwardsTextPage() {
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
      const response = await fetch('/api/tools/backwards', {
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

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    // You could add a toast notification here
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
                <span className="text-2xl">🔄</span>
                <h1 className="text-lg font-semibold text-gray-900">Backwards Text Generator</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tool Description */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Backwards Text Generator
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Reverse any text string instantly. Perfect for creating backwards text for social media, 
            puzzles, or just for fun. Simply enter your text and get the reversed version.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text to Reverse *
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text here to reverse it..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
                required
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>Enter any text you want to reverse</span>
                <span>{text.length} characters</span>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Reversing Text...' : 'Reverse Text'}
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
            {/* Original vs Reversed */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original Text */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Original Text</h3>
                  <button
                    onClick={() => handleCopy(text)}
                    className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-900 font-mono text-sm whitespace-pre-wrap break-words">
                    {text}
                  </p>
                </div>
              </div>

              {/* Reversed Text */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Reversed Text</h3>
                  <button
                    onClick={() => handleCopy(result.reversed)}
                    className="text-sm bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded transition-colors"
                  >
                    Copy Result
                  </button>
                </div>
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-blue-900 font-mono text-sm whitespace-pre-wrap break-words">
                    {result.reversed}
                  </p>
                </div>
              </div>
            </div>

            {/* Text Analysis */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Text Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-semibold text-blue-600">
                    {text.length}
                  </div>
                  <div className="text-sm text-blue-700">Characters</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-semibold text-green-600">
                    {text.split(/\s+/).filter(word => word.length > 0).length}
                  </div>
                  <div className="text-sm text-green-700">Words</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-semibold text-purple-600">
                    {text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length}
                  </div>
                  <div className="text-sm text-purple-700">Sentences</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-semibold text-orange-600">
                    {text.split(/\n/).length}
                  </div>
                  <div className="text-sm text-orange-700">Lines</div>
                </div>
              </div>
            </div>

            {/* Use Cases */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Use Cases</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">Fun & Creative</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Social media posts</li>
                    <li>Puzzles and brain teasers</li>
                    <li>Games and challenges</li>
                    <li>Creative writing exercises</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">Technical</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>String manipulation testing</li>
                    <li>Data processing examples</li>
                    <li>Algorithm demonstrations</li>
                    <li>Text analysis practice</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Additional Tools */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 More Text Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link 
                  href="/tools/text-compare"
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">⚖️</span>
                    <div>
                      <h4 className="font-medium text-gray-900">Text Compare</h4>
                      <p className="text-sm text-gray-500">Compare two texts</p>
                    </div>
                  </div>
                </Link>
                <Link 
                  href="/tools/keyword-density"
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">📊</span>
                    <div>
                      <h4 className="font-medium text-gray-900">Keyword Density</h4>
                      <p className="text-sm text-gray-500">Analyze keywords</p>
                    </div>
                  </div>
                </Link>
                <div className="p-4 border border-gray-200 rounded-lg opacity-50 cursor-not-allowed">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">📝</span>
                    <div>
                      <h4 className="font-medium text-gray-500">Case Converter</h4>
                      <p className="text-sm text-gray-400">Coming soon</p>
                    </div>
                  </div>
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