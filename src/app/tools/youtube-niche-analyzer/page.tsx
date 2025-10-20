'use client';

import { useState } from 'react';
import Link from 'next/link';

// Add global CSS for line clamping
const styles = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

// Real YouTube video data interface
interface RealVideo {
  id: string;
  title: string;
  views: number;
  uploadedAt: string;
  duration: string;
  thumbnail: string;
  channelName: string;
  channelId: string;
  channelSubscribers: number;
  channelVerified: boolean;
}

// Real analysis result interface
interface AnalysisResult {
  niche: string;
  totalChannels: number;
  totalVideos: number;
  averageViews: number;
  topVideos: RealVideo[];
  marketSize: {
    score: number;
    level: 'Low' | 'Medium' | 'High' | 'Excellent';
    totalViews: number;
    videoCount: number;
    avgViewsPerVideo: number;
  };
  competition: {
    score: number;
    level: 'Low' | 'Medium' | 'High' | 'Saturated';
    topChannels: number;
    averageSubscribers: number;
    competitionIntensity: string;
  };
  monetization: {
    score: number;
    level: 'Poor' | 'Fair' | 'Good' | 'Excellent';
    estimatedRPM: number;
    revenueRanges: {
      views1K: string;
      views10K: string;
      views100K: string;
      views1M: string;
    };
  };
  insights: string[];
  recommendations: string[];
  cached?: boolean;
  dataSource?: string;
}

export default function YouTubeNicheAnalyzerPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [input, setInput] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) {
      setError('Please enter a YouTube URL or niche keywords');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/youtube/niche-analyzer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: input.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Failed to analyze');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 65) return 'text-blue-600';
    if (score >= 45) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 65) return 'bg-blue-100';
    if (score >= 45) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Very High': return 'bg-green-100 text-green-800';
      case 'High': return 'bg-blue-100 text-blue-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Excellent Opportunity': return 'bg-green-100 text-green-800';
      case 'Good Opportunity': return 'bg-blue-100 text-blue-800';
      case 'Caution': return 'bg-yellow-100 text-yellow-800';
      case 'Not Recommended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const sampleInputs = [
    'https://www.youtube.com/channel/UC8butISFwT-Wl7EV0hUK0BQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://www.youtube.com/@MrBeast',
    'Online Wealth Creation',
    'Personal Finance',
    'Technology Reviews',
    'Gaming Content',
    'Cooking Tutorials'
  ];

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
              <span className="ml-2 text-gray-600">YouTube Niche Analyzer</span>
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
            <div className="text-4xl mr-3">🎯</div>
            <h1 className="text-3xl font-bold text-gray-900">YouTube Niche Analyzer</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Analyze YouTube channels, videos, or niches for market size, competition level, monetization potential, 
            and growth trends. Use real YouTube URLs or keywords to get comprehensive insights.
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube URL or Niche Keywords
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter YouTube channel/video URL or niche keywords..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
              
              {/* Supported Formats */}
              <div className="mt-2 text-xs text-gray-500">
                <p className="font-medium mb-1">Supported formats:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li>Channel URLs: https://www.youtube.com/@channelname</li>
                  <li>Video URLs: https://youtu.be/videoID</li>
                  <li>Keywords: "personal finance", "gaming content"</li>
                </ul>
              </div>
              
              {/* Sample Inputs */}
              <div className="mt-3 p-4 bg-blue-50 rounded-md">
                <p className="text-sm font-medium text-blue-800 mb-2">💡 Try these examples:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {sampleInputs.map((sample, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setInput(sample)}
                      className="text-left text-xs text-blue-600 hover:text-blue-800 hover:underline p-1 rounded border border-blue-200 hover:border-blue-300"
                      title={sample}
                    >
                      {sample.length > 40 ? sample.substring(0, 40) + '...' : sample}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing YouTube Data...
                </span>
              ) : (
                '🎯 Analyze YouTube Niche'
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
            {/* Header with Niche Name and Stats */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2 capitalize">{result.niche}</h2>
                <div className="flex justify-center items-center space-x-8 text-sm">
                  <div>Channels analyzed <span className="font-bold">{result.totalChannels}</span></div>
                  <div>Videos analyzed <span className="font-bold">{result.totalVideos}</span></div>
                </div>
                {result.cached && (
                  <div className="text-xs text-blue-100 mt-2">
                    📊 Cached results • {result.dataSource === 'realtime' ? 'Real YouTube Data' : 'Analysis Data'}
                  </div>
                )}
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Market Size */}
              <div className="bg-gray-900 text-white rounded-lg p-6">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 mx-auto mb-4 relative">
                    <div className="w-full h-full rounded-full border-4 border-gray-700 flex items-center justify-center">
                      <div className={`text-2xl font-bold ${
                        result.marketSize.score >= 80 ? 'text-green-400' : 
                        result.marketSize.score >= 60 ? 'text-blue-400' : 
                        result.marketSize.score >= 40 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {result.marketSize.score}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Market Size</h3>
                  <div className="flex justify-center space-x-2 text-xs mb-3">
                    <span className="bg-red-500 w-2 h-2 rounded-full"></span>
                    <span>0-49</span>
                    <span className="bg-yellow-500 w-2 h-2 rounded-full"></span>
                    <span>50-70</span>
                    <span className="bg-green-500 w-2 h-2 rounded-full"></span>
                    <span>71-100</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Viral Views Potential</span>
                    <span>Loyal Audience</span>
                  </div>
                  <div className="flex justify-between text-green-400">
                    <span>{formatNumber(result.marketSize.avgViewsPerVideo)}</span>
                    <span>{formatNumber(result.marketSize.totalViews)}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  A viral video could reach {formatNumber(result.marketSize.avgViewsPerVideo * 2)} views and a good video {formatNumber(result.marketSize.avgViewsPerVideo)} views.
                  Given the high monetization score, this is looks like a decent opportunity if done right.
                </p>
              </div>

              {/* Competition */}
              <div className="bg-gray-900 text-white rounded-lg p-6">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 mx-auto mb-4 relative">
                    <div className="w-full h-full rounded-full border-4 border-gray-700 flex items-center justify-center">
                      <div className={`text-2xl font-bold ${
                        Math.round(result.competition.score) >= 80 ? 'text-red-400' : 
                        Math.round(result.competition.score) >= 60 ? 'text-yellow-400' : 
                        Math.round(result.competition.score) >= 40 ? 'text-blue-400' : 'text-green-400'
                      }`}>
                        {Math.round(result.competition.score)}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Competition</h3>
                  <div className="flex justify-center space-x-2 text-xs mb-3">
                    <span className="bg-red-500 w-2 h-2 rounded-full"></span>
                    <span>0-49</span>
                    <span className="bg-yellow-500 w-2 h-2 rounded-full"></span>
                    <span>50-70</span>
                    <span className="bg-green-500 w-2 h-2 rounded-full"></span>
                    <span>71-100</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-red-400 text-xs truncate">Market Entry</span>
                    <span className="text-red-400 text-xs truncate">Competition</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${
                      Math.round(result.competition.score) >= 60 ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {Math.round(result.competition.score) >= 60 ? 'Hard' : 'Moderate'}
                    </span>
                    <span className={`text-xs ${
                      Math.round(result.competition.score) >= 60 ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {result.competition.level}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                  {result.competition.competitionIntensity}
                </p>
              </div>

              {/* Monetization */}
              <div className="bg-gray-900 text-white rounded-lg p-6">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 mx-auto mb-4 relative">
                    <div className="w-full h-full rounded-full border-4 border-gray-700 flex items-center justify-center">
                      <div className={`text-2xl font-bold ${
                        result.monetization.score >= 80 ? 'text-green-400' : 
                        result.monetization.score >= 60 ? 'text-blue-400' : 
                        result.monetization.score >= 40 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {result.monetization.score}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Profitable</h3>
                  <div className="flex justify-center space-x-2 text-xs mb-3">
                    <span className="bg-red-500 w-2 h-2 rounded-full"></span>
                    <span>0-49</span>
                    <span className="bg-yellow-500 w-2 h-2 rounded-full"></span>
                    <span>50-70</span>
                    <span className="bg-green-500 w-2 h-2 rounded-full"></span>
                    <span>71-100</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-400">RPM Estimation</span>
                    <span className="text-green-400">Avg Views</span>
                  </div>
                  <div className="flex justify-between text-green-400">
                    <span>${result.monetization.estimatedRPM}</span>
                    <span>{formatNumber(result.averageViews)}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  This niche has high revenue per thousand views, showing strong profit potential. Since it seems saturated, this seems like a tough niche to stand out.
                </p>
              </div>
            </div>

            {/* Revenue Estimates */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Revenue Estimates</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{result.monetization.revenueRanges.views1K}</div>
                  <div className="text-sm text-gray-600">1K views</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{result.monetization.revenueRanges.views10K}</div>
                  <div className="text-sm text-gray-600">10K views</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{result.monetization.revenueRanges.views100K}</div>
                  <div className="text-sm text-gray-600">100K views</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{result.monetization.revenueRanges.views1M}</div>
                  <div className="text-sm text-gray-600">1M views</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center mt-3">
                Revenue Per Mille (RPM) = ${result.monetization.estimatedRPM} per 1,000 views. Actual revenue depends on audience demographics and engagement.
              </p>
            </div>

            {/* Top Performing Videos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">🏆 Top Performing Videos</h3>
                <p className="text-gray-600 mt-1">Recent highly performing videos in this niche</p>
              </div>
              
              {result.topVideos && result.topVideos.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">Video</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Views</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">Channel</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Upload Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Subscribers</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {result.topVideos.slice(0, 10).map((video, index) => (
                        <tr key={video.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-4">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <img 
                                  src={video.thumbnail} 
                                  alt={video.title}
                                  className="w-20 h-12 object-cover rounded"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'https://via.placeholder.com/80x60/cccccc/666666?text=Video';
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 line-clamp-2 leading-5 break-words overflow-hidden">
                                  {video.title}
                                </h4>
                                <div className="mt-1 text-xs text-gray-500 truncate">
                                  {video.duration}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900">{formatNumber(video.views)}</div>
                            <div className="text-xs text-gray-500">views</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900 flex items-center truncate">
                              <span className="truncate">{video.channelName}</span>
                              {video.channelVerified && <span className="ml-1 text-blue-500 flex-shrink-0">✓</span>}
                            </div>
                            <div className="text-xs text-gray-500">{formatNumber(video.channelSubscribers)} subs</div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            <div className="truncate">
                              {video.uploadedAt.includes('ago') ? video.uploadedAt : 
                               new Date(video.uploadedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900">{formatNumber(video.channelSubscribers)}</div>
                            <div className="text-xs text-gray-500">subs</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6">
                  <p className="text-gray-600">No videos found for analysis.</p>
                </div>
              )}
            </div>

            {/* Key Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Key Insights</h3>
                <ul className="space-y-3">
                  {result.insights.map((insight, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                      <span className="text-sm text-gray-700">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Recommendations</h3>
                <ul className="space-y-3">
                  {result.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-sm text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}