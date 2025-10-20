'use client';

import { useState } from 'react';

type ToolType = 'youtube-info' | 'youtube-tags-generate' | 'youtube-hashtags-generate' | 'keyword-density' | 'text-compare' | 'backwards';

interface Tool {
  id: ToolType;
  name: string;
  description: string;
  category: string;
}

const tools: Tool[] = [
  {
    id: 'youtube-info',
    name: 'YouTube Video Info',
    description: 'Extract detailed information from any YouTube video',
    category: 'YouTube'
  },
  {
    id: 'youtube-tags-generate',
    name: 'YouTube Tag Generator',
    description: 'Generate SEO-optimized tags for your videos',
    category: 'YouTube'
  },
  {
    id: 'youtube-hashtags-generate',
    name: 'YouTube Hashtag Generator',
    description: 'Generate trending hashtags for your content',
    category: 'YouTube'
  },
  {
    id: 'keyword-density',
    name: 'Keyword Density Checker',
    description: 'Analyze keyword frequency in your text',
    category: 'SEO'
  },
  {
    id: 'text-compare',
    name: 'Text Compare',
    description: 'Compare two texts and see differences',
    category: 'SEO'
  },
  {
    id: 'backwards',
    name: 'Backwards Text',
    description: 'Reverse any text string',
    category: 'Tools'
  }
];

export default function ToolsPage() {
  const [selectedTool, setSelectedTool] = useState<ToolType>('youtube-info');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    videoUrl: '',
    title: '',
    description: '',
    niche: '',
    mode: 'rb',
    max: 25,
    text: '',
    textA: '',
    textB: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      let response: Response;
      
      switch (selectedTool) {
        case 'youtube-info':
          response = await fetch(`/api/youtube/info?input=${encodeURIComponent(formData.videoUrl)}`);
          break;
          
        case 'youtube-tags-generate':
          response = await fetch('/api/youtube/tags/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: formData.title,
              description: formData.description,
              max: formData.max,
              mode: formData.mode
            })
          });
          break;
          
        case 'youtube-hashtags-generate':
          response = await fetch('/api/youtube/hashtags/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: formData.title,
              niche: formData.niche,
              max: formData.max,
              mode: formData.mode
            })
          });
          break;
          
        case 'keyword-density':
          response = await fetch('/api/seo/keyword-density', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: formData.text
            })
          });
          break;
          
        case 'text-compare':
          response = await fetch('/api/seo/text-compare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              a: formData.textA,
              b: formData.textB
            })
          });
          break;
          
        case 'backwards':
          response = await fetch('/api/tools/backwards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: formData.text
            })
          });
          break;
          
        default:
          throw new Error('Unknown tool');
      }
      
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

  const renderForm = () => {
    const tool = tools.find(t => t.id === selectedTool);
    
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{tool?.name}</h2>
        <p className="text-gray-600 mb-6">{tool?.description}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {selectedTool === 'youtube-info' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Video URL or ID
              </label>
              <input
                type="text"
                value={formData.videoUrl}
                onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                placeholder="https://youtu.be/dQw4w9WgXcQ or dQw4w9WgXcQ"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}
          
          {(selectedTool === 'youtube-tags-generate' || selectedTool === 'youtube-hashtags-generate') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter video title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              {selectedTool === 'youtube-tags-generate' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter video description..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Niche/Category</label>
                  <input
                    type="text"
                    value={formData.niche}
                    onChange={(e) => setFormData({...formData, niche: e.target.value})}
                    placeholder="e.g., technology, cooking, fitness..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                  <select
                    value={formData.mode}
                    onChange={(e) => setFormData({...formData, mode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="rb">Rule-based (Free)</option>
                    <option value="ai">AI-powered</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Results</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={formData.max}
                    onChange={(e) => setFormData({...formData, max: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </>
          )}
          
          {(selectedTool === 'keyword-density' || selectedTool === 'backwards') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text</label>
              <textarea
                value={formData.text}
                onChange={(e) => setFormData({...formData, text: e.target.value})}
                placeholder="Enter your text here..."
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}
          
          {selectedTool === 'text-compare' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text A</label>
                <textarea
                  value={formData.textA}
                  onChange={(e) => setFormData({...formData, textA: e.target.value})}
                  placeholder="Enter first text..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text B</label>
                <textarea
                  value={formData.textB}
                  onChange={(e) => setFormData({...formData, textB: e.target.value})}
                  placeholder="Enter second text..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : `Run ${tool?.name}`}
          </button>
        </form>
      </div>
    );
  };

  const renderResult = () => {
    if (!result) return null;
    
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Results</h3>
        
        <div className="space-y-4">
          {selectedTool === 'youtube-info' && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Title:</label>
                <p className="text-gray-900">{result.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Author:</label>
                <p className="text-gray-900">{result.author}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Views:</label>
                  <p className="text-gray-900">{result.viewCount?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Duration:</label>
                  <p className="text-gray-900">{Math.floor(result.lengthSeconds / 60)}:{(result.lengthSeconds % 60).toString().padStart(2, '0')}</p>
                </div>
              </div>
            </div>
          )}
          
          {(selectedTool === 'youtube-tags-generate' || selectedTool === 'youtube-hashtags-generate') && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-gray-600">
                  {selectedTool === 'youtube-tags-generate' ? 'Generated Tags:' : 'Generated Hashtags:'}
                </label>
                <span className="text-xs text-gray-500">Mode: {result.mode} | Count: {result.count}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(selectedTool === 'youtube-tags-generate' ? result.tags : result.hashtags)?.map((item: string, index: number) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {selectedTool === 'keyword-density' && (
            <div>
              <div className="mb-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Words:</span>
                    <span className="ml-2 font-medium">{result.totalWords}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Unique Words:</span>
                    <span className="ml-2 font-medium">{result.uniqueWords}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">High Density:</span>
                    <span className="ml-2 font-medium">{result.analysis?.highDensity}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {result.keywords?.slice(0, 10).map((keyword: any, index: number) => (
                  <div key={index} className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-900">{keyword.word}</span>
                    <div className="text-sm text-gray-600">
                      <span>{keyword.count}x</span>
                      <span className="ml-2">({keyword.density.toFixed(1)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {selectedTool === 'text-compare' && (
            <div>
              <div className="mb-4">
                <div className="text-lg font-medium text-center">
                  Similarity: {result.similarity?.percentage}%
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm mt-2">
                  <div className="text-center">
                    <div className="text-green-600">Unchanged</div>
                    <div className="font-medium">{result.similarity?.details?.unchangedWords}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-600">Removed</div>
                    <div className="font-medium">{result.similarity?.details?.removedWords}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-600">Added</div>
                    <div className="font-medium">{result.similarity?.details?.addedWords}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {selectedTool === 'backwards' && (
            <div>
              <label className="text-sm font-medium text-gray-600">Reversed Text:</label>
              <p className="text-gray-900 font-mono bg-gray-50 p-3 rounded">{result.reversed}</p>
            </div>
          )}
        </div>
        
        <details className="mt-6">
          <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900">
            Raw JSON Response
          </summary>
          <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </details>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">API Testing Dashboard</h1>
          <p className="text-gray-600">Test all available APIs and see their responses</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tool Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Available Tools</h3>
              <div className="space-y-2">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedTool === tool.id
                        ? 'bg-blue-100 text-blue-800 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div>{tool.name}</div>
                    <div className="text-xs text-gray-500">{tool.category}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {renderForm()}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-800 text-sm">
                  <strong>Error:</strong> {error}
                </div>
              </div>
            )}
            
            {result && renderResult()}
          </div>
        </div>

        <div className="text-center mt-8">
          <a
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm"
          >
            ← Back to Homepage
          </a>
        </div>
      </div>
    </div>
  );
}