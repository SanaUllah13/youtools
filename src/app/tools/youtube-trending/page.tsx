'use client';

import { useState } from 'react';
import Link from 'next/link';

interface TrendingVideo {
  id: string;
  title: string;
  channel: string;
  channelId: string;
  channelUrl: string;
  thumbnail: string;
  duration: string;
  views: string;
  publishedAt: string;
  description: string;
  url: string;
}

interface TrendingResponse {
  videos: TrendingVideo[];
  count: number;
  country: string;
  category: string;
  timestamp: string;
  availableCountries: { [key: string]: string };
  availableCategories: { [key: string]: string };
  cached?: boolean;
}

export default function YoutubeTrendingPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrendingResponse | null>(null);
  const [error, setError] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [selectedCategory, setSelectedCategory] = useState('0');

  const countries = {
    'US': 'United States',
    'IN': 'India',
    'JP': 'Japan',
    'KR': 'South Korea',
    'GB': 'United Kingdom',
    'DE': 'Germany',
    'FR': 'France',
    'BR': 'Brazil',
    'CA': 'Canada',
    'AU': 'Australia',
    'MX': 'Mexico',
    'IT': 'Italy',
    'ES': 'Spain',
    'RU': 'Russia',
    'NL': 'Netherlands'
  };

  const categories = {
    '0': 'All',
    '10': 'Music',
    '20': 'Gaming',
    '23': 'Comedy',
    '24': 'Entertainment',
    '25': 'News & Politics',
    '26': 'Howto & Style',
    '27': 'Education',
    '28': 'Science & Technology',
    '17': 'Sports',
    '15': 'Pets & Animals',
    '19': 'Travel & Events',
    '22': 'People & Blogs',
    '1': 'Film & Animation',
    '2': 'Autos & Vehicles'
  };

  const handleFetchTrending = async () => {
    if (!selectedCountry) {
      setError('Please select a country');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`/api/youtube/trending?country=${selectedCountry}&category=${selectedCategory}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Failed to fetch trending videos');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatViewCount = (views: string): string => {
    if (!views) return 'N/A';
    return views.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  };

  const getTimeAgo = (publishedAt: string): string => {
    if (!publishedAt) return '';
    return publishedAt;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600">
                YouTools
              </Link>
              <span className="ml-2 text-gray-500">/</span>
              <span className="ml-2 text-gray-600">YouTube Trending Videos</span>
            </div>
            <Link
              href="/"
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              ← Back to Tools
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title and Description */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="text-4xl mr-3">🔥</div>
            <h1 className="text-3xl font-bold text-gray-900">YouTube Trending Videos</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover what's trending on YouTube in different countries and categories. 
            Get real-time insights into viral content and popular videos.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country/Region
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                {Object.entries(countries).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                {Object.entries(categories).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <button
                onClick={handleFetchTrending}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Fetching...
                  </span>
                ) : (
                  'Get Trending Videos'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="text-red-400">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div>
            {/* Results Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Trending in {result.country} - {result.category}
                  </h2>
                  <p className="text-gray-600">
                    {result.count} trending videos found
                    {result.cached && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        Cached
                      </span>
                    )}
                  </p>
                  
                  {/* Sample Data Notice */}
                  {(result.videos.some(v => v.id === 'dQw4w9WgXcQ' || v.title.includes('Sample'))) && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                      <div className="flex items-start">
                        <div className="text-amber-600 mr-2">ℹ️</div>
                        <div>
                          <h4 className="text-sm font-medium text-amber-800">Sample Data</h4>
                          <p className="text-sm text-amber-700 mt-1">
                            Currently showing sample trending videos due to YouTube's anti-scraping measures. 
                            The tool structure is fully functional and will display real trending data when scraping is possible.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 sm:mt-0 text-sm text-gray-500">
                  Last updated: {new Date(result.timestamp).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Videos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {result.videos.map((video, index) => (
                <div key={video.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Rank Badge */}
                  <div className="absolute z-10 bg-red-600 text-white text-sm font-bold px-2 py-1 rounded-br-lg">
                    #{index + 1}
                  </div>
                  
                  {/* Thumbnail */}
                  <div className="relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`;
                      }}
                    />
                    {video.duration && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 cursor-pointer"
                        onClick={() => window.open(video.url, '_blank')}>
                      {video.title}
                    </h3>
                    
                    <div className="flex items-center mb-2">
                      <span
                        className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer"
                        onClick={() => video.channelUrl && window.open(video.channelUrl, '_blank')}
                      >
                        {video.channel}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{formatViewCount(video.views)} views</span>
                      <span>{getTimeAgo(video.publishedAt)}</span>
                    </div>

                    {video.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {video.description}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-2">
                      <button
                        onClick={() => window.open(video.url, '_blank')}
                        className="flex-1 bg-red-600 text-white text-sm py-2 px-3 rounded-md hover:bg-red-700 transition-colors"
                      >
                        Watch on YouTube
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(video.url);
                          // You could add a toast notification here
                        }}
                        className="bg-gray-100 text-gray-700 text-sm py-2 px-3 rounded-md hover:bg-gray-200 transition-colors"
                        title="Copy link"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Videos Message */}
            {result.videos.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No trending videos found</h3>
                <p className="text-gray-600">Try selecting a different country or category.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}