'use client';

import { useState } from 'react';

interface Tool {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  available: boolean;
}

interface ToolsGridProps {
  tools: Tool[];
}

export default function ToolsGrid({ tools }: ToolsGridProps) {
  const categories = ['All', 'YouTube', 'SEO', 'Tools'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTools = selectedCategory === 'All' 
    ? tools 
    : tools.filter(tool => tool.category === selectedCategory);

  const handleToolClick = (tool: Tool) => {
    if (tool.available) {
      const toolRoutes: { [key: string]: string } = {
        'youtube-info': '/tools/youtube-info',
        'youtube-tags': '/tools/youtube-tags',
        'youtube-tags-generate': '/tools/youtube-tags-generate',
        'youtube-hashtags-extract': '/tools/youtube-hashtags-extract',
        'youtube-hashtags-generate': '/tools/youtube-hashtags-generate',
        'youtube-title-generate': '/tools/youtube-title-generate',
        'youtube-description-generate': '/tools/youtube-description-generate',
        'youtube-embed': '/tools/youtube-embed',
        'youtube-money': '/tools/youtube-money-calculator',
        'youtube-region-check': '/tools/youtube-region-check',
        'youtube-trending': '/tools/youtube-trending',
        'youtube-channel-stats': '/tools/youtube-channel-analytics',
        'youtube-niche-analyzer': '/tools/youtube-niche-analyzer',
        'youtube-transcript': '/tools/youtube-transcript',
        'keyword-density': '/tools/keyword-density',
        'meta-analyze': '/tools/meta-analyze',
        'adsense-calculator': '/tools/adsense-calculator',
        'text-compare': '/tools/text-compare',
        'backwards-text': '/tools/backwards-text'
      };
      const route = toolRoutes[tool.id] || '/tools';
      window.location.href = route;
    }
  };

  return (
    <>
      {/* Category Filter */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 transition-all cursor-pointer group ${
              tool.available 
                ? 'hover:shadow-md hover:border-blue-300' 
                : 'opacity-75 border-dashed'
            }`}
            onClick={() => handleToolClick(tool)}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="text-3xl mr-3">{tool.icon}</div>
                  <div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      tool.category === 'YouTube' 
                        ? 'bg-red-100 text-red-800'
                        : tool.category === 'SEO'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {tool.category}
                    </span>
                  </div>
                </div>
                {tool.available ? (
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Ready
                  </span>
                ) : (
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                    Soon
                  </span>
                )}
              </div>
              <h3 className={`text-lg font-semibold mb-2 transition-colors ${
                tool.available 
                  ? 'text-gray-900 group-hover:text-blue-600' 
                  : 'text-gray-500'
              }`}>
                {tool.title}
              </h3>
              <p className={`text-sm ${
                tool.available ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {tool.description}
              </p>
              {tool.available && (
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-blue-600 text-sm font-medium flex items-center">
                    Try it now <span className="ml-1">→</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}