'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function YouTubeRegionCheckerPage() {
  const [formData, setFormData] = useState({
    input: '',
    country: 'US'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' },
    { code: 'IN', name: 'India' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'ES', name: 'Spain' },
    { code: 'IT', name: 'Italy' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'SE', name: 'Sweden' },
    { code: 'NO', name: 'Norway' },
    { code: 'DK', name: 'Denmark' },
    { code: 'FI', name: 'Finland' },
    { code: 'PL', name: 'Poland' },
    { code: 'RU', name: 'Russia' },
    { code: 'CN', name: 'China' },
    { code: 'SG', name: 'Singapore' },
    { code: 'TH', name: 'Thailand' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'PH', name: 'Philippines' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'TW', name: 'Taiwan' },
    { code: 'HK', name: 'Hong Kong' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'EG', name: 'Egypt' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'KE', name: 'Kenya' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CL', name: 'Chile' },
    { code: 'CO', name: 'Colombia' },
    { code: 'PE', name: 'Peru' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/youtube/region-check', {
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
                <span className="text-2xl">🌍</span>
                <h1 className="text-lg font-semibold text-gray-900">YouTube Region Checker</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            YouTube Region Checker
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Check if a YouTube video is available in specific countries and regions.
            Perfect for content creators managing global accessibility.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube URL or Video ID *
              </label>
              <input
                type="text"
                value={formData.input}
                onChange={(e) => setFormData({...formData, input: e.target.value})}
                placeholder="https://www.youtube.com/watch?v=... or video ID"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white placeholder-gray-400 font-medium"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter a YouTube URL or just the 11-character video ID
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country to Check
              </label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white font-medium"
              >
                {countries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name} ({country.code})
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-500">
                Select the country you want to check video availability for
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Common Use Cases</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• <strong>Content Creators:</strong> Verify global accessibility before publishing</p>
                <p>• <strong>Marketers:</strong> Check if promotional videos reach target markets</p>
                <p>• <strong>Educators:</strong> Ensure educational content is available worldwide</p>
                <p>• <strong>Businesses:</strong> Confirm product videos are accessible in all regions</p>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Checking Availability...' : 'Check Region Availability'}
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
              <h3 className="text-lg font-semibold text-gray-900">Availability Check Results</h3>
              <span className="text-sm text-gray-500">
                {countries.find(c => c.code === formData.country)?.name} ({formData.country})
              </span>
            </div>
            
            {result.availability && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold ${
                    result.availability.available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.availability.available ? (
                      <>
                        <span className="text-2xl mr-2">✅</span>
                        Video is Available
                      </>
                    ) : (
                      <>
                        <span className="text-2xl mr-2">❌</span>
                        Video is Not Available
                      </>
                    )}
                  </div>
                </div>

                {result.videoInfo && (
                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-4">Video Information</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Title:</label>
                        <p className="text-gray-900 mt-1">{result.videoInfo.title}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Channel:</label>
                        <p className="text-gray-900 mt-1">{result.videoInfo.author}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Video ID:</label>
                          <p className="text-gray-900 mt-1 font-mono text-sm">{result.videoInfo.id}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Duration:</label>
                          <p className="text-gray-900 mt-1">
                            {Math.floor((result.videoInfo.lengthSeconds || 0) / 60)}:
                            {((result.videoInfo.lengthSeconds || 0) % 60).toString().padStart(2, '0')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!result.availability.available && result.availability.reason && (
                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Restriction Details</h4>
                    <div className="bg-yellow-50 p-4 rounded-md">
                      <p className="text-yellow-800">{result.availability.reason}</p>
                    </div>
                  </div>
                )}

                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-3">💡 Tips for Global Accessibility</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• <strong>Music Content:</strong> Consider copyright restrictions in different regions</p>
                    <p>• <strong>Licensed Content:</strong> Check distribution rights before uploading</p>
                    <p>• <strong>Cultural Sensitivity:</strong> Be aware of local content guidelines</p>
                    <p>• <strong>Language Barriers:</strong> Add subtitles for broader accessibility</p>
                    <p>• <strong>VPN Testing:</strong> Use VPN services to test accessibility yourself</p>
                  </div>
                </div>

                {result.alternativeCountries && result.alternativeCountries.length > 0 && (
                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Available in These Countries</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.alternativeCountries.map((countryCode: string) => (
                        <span
                          key={countryCode}
                          className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full"
                        >
                          {countries.find(c => c.code === countryCode)?.name || countryCode}
                        </span>
                      ))}
                    </div>
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