'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ChannelVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: string;
  publishedAt: string;
  url: string;
}

interface ChannelAnalytics {
  channelId: string;
  channelName: string;
  channelHandle: string;
  channelUrl: string;
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
  joinedDate: string;
  description: string;
  avatar: string;
  banner: string;
  isVerified: boolean;
  country: string;
  categories: string[];
  recentVideos: ChannelVideo[];
  popularVideos: ChannelVideo[];
  engagement: {
    avgViews: number;
    avgViewsFormatted: string;
    estimatedMonthlyEarnings: string;
    engagementRate: string;
  };
  socialLinks: Array<{
    platform: string;
    url: string;
  }>;
  timestamp?: string;
  cached?: boolean;
}

export default function YoutubeChannelAnalyticsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ChannelAnalytics | null>(null);
  const [error, setError] = useState('');
  const [channelInput, setChannelInput] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!channelInput.trim()) {
      setError('Please enter a YouTube channel URL, ID, username, or handle');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/youtube/channel-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channel: channelInput.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Failed to analyze channel');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: string | number): string => {
    if (typeof num === 'string') return num;
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
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
              <span className="ml-2 text-gray-600">YouTube Channel Analytics</span>
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
            <div className="text-4xl mr-3">📈</div>
            <h1 className="text-3xl font-bold text-gray-900">YouTube Channel Analytics</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get comprehensive analytics and insights for any YouTube channel. 
            Analyze subscriber counts, engagement rates, recent videos, and more.
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Channel
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={channelInput}
                  onChange={(e) => setChannelInput(e.target.value)}
                  placeholder="Enter channel URL, ID, username, or @handle"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
              <div className="mt-2 text-sm text-gray-500">
                <p>Examples:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>https://www.youtube.com/@channel</li>
                  <li>https://www.youtube.com/channel/UC...</li>
                  <li>https://www.youtube.com/user/username</li>
                  <li>@channelhandle</li>
                  <li>channelname</li>
                </ul>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !channelInput.trim()}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Channel...
                </span>
              ) : (
                'Analyze Channel'
              )}
            </button>
          </form>
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
          <div className="space-y-6">
            {/* Channel Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Banner */}
              {result.banner && (
                <div className="h-32 md:h-48 bg-gradient-to-r from-blue-500 to-purple-600">
                  <img
                    src={result.banner}
                    alt="Channel Banner"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {result.avatar ? (
                      <img
                        src={result.avatar}
                        alt={result.channelName}
                        className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                        onError={(e) => {
                          // Hide the broken image and show fallback
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    {/* Fallback avatar */}
                    <div 
                      className={`w-20 h-20 rounded-full border-4 border-white shadow-lg bg-gray-300 flex items-center justify-center text-gray-600 ${result.avatar ? 'hidden' : 'flex'}`}
                      style={{ display: result.avatar ? 'none' : 'flex' }}
                    >
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Channel Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">{result.channelName}</h1>
                      {result.isVerified && (
                        <span className="text-blue-600" title="Verified Channel">
                          ✓
                        </span>
                      )}
                      {result.cached && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          Cached
                        </span>
                      )}
                    </div>
                    
                    {result.channelHandle && (
                      <p className="text-gray-600 mb-2">{result.channelHandle}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span>{result.subscriberCount} subscribers</span>
                      <span>{result.videoCount} videos</span>
                      {result.joinedDate && (
                        <span>Joined {result.joinedDate}</span>
                      )}
                      {result.country && (
                        <span>📍 {result.country}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open(result.channelUrl, '_blank')}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                    >
                      Visit Channel
                    </button>
                  </div>
                </div>
                
                {/* Description */}
                {result.description && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-gray-700 line-clamp-3">{result.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Views</p>
                    <p className="text-2xl font-bold text-gray-900">{result.engagement.avgViewsFormatted}</p>
                  </div>
                  <div className="text-3xl">👁️</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{result.engagement.engagementRate}</p>
                  </div>
                  <div className="text-3xl">📊</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Est. Monthly Earnings</p>
                    <p className="text-lg font-bold text-gray-900">{result.engagement.estimatedMonthlyEarnings}</p>
                  </div>
                  <div className="text-3xl">💰</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Videos</p>
                    <p className="text-2xl font-bold text-gray-900">{result.videoCount}</p>
                  </div>
                  <div className="text-3xl">📹</div>
                </div>
              </div>
            </div>

            {/* Recent Videos */}
            {result.recentVideos.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Videos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.recentVideos.map((video) => (
                    <div key={video.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-32 object-cover cursor-pointer"
                          onClick={() => window.open(video.url, '_blank')}
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
                      <div className="p-3">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 hover:text-blue-600 cursor-pointer"
                            onClick={() => window.open(video.url, '_blank')}>
                          {video.title}
                        </h3>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{video.views} views</span>
                          <span>{video.publishedAt}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Videos */}
            {result.popularVideos.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Popular Videos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.popularVideos.map((video) => (
                    <div key={video.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-32 object-cover cursor-pointer"
                          onClick={() => window.open(video.url, '_blank')}
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
                      <div className="p-3">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 hover:text-blue-600 cursor-pointer"
                            onClick={() => window.open(video.url, '_blank')}>
                          {video.title}
                        </h3>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{video.views} views</span>
                          <span>{video.publishedAt}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {result.categories.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Categories</h2>
                <div className="flex flex-wrap gap-2">
                  {result.categories.map((category, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis Timestamp */}
            {result.timestamp && (
              <div className="text-center text-sm text-gray-500">
                Analysis completed at {new Date(result.timestamp).toLocaleString()}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}