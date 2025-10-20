import ToolsGrid from '@/components/ToolsGrid';

const tools = [
  // YouTube Tools
  {
    id: 'youtube-info',
    title: 'YouTube Video Info',
    description: 'Extract detailed information from any YouTube video',
    category: 'YouTube',
    icon: '📹',
    available: true
  },
  {
    id: 'youtube-tags',
    title: 'YouTube Tag Extractor',
    description: 'Extract tags from any YouTube video',
    category: 'YouTube',
    icon: '🏷️',
    available: true
  },
  {
    id: 'youtube-tags-generate',
    title: 'YouTube Tag Generator',
    description: 'Generate SEO-optimized tags for your videos',
    category: 'YouTube',
    icon: '🎯',
    available: true
  },
  {
    id: 'youtube-hashtags-extract',
    title: 'YouTube Hashtag Extractor',
    description: 'Extract hashtags from video descriptions',
    category: 'YouTube',
    icon: '#️⃣',
    available: true
  },
  {
    id: 'youtube-hashtags-generate',
    title: 'YouTube Hashtag Generator',
    description: 'Generate trending hashtags for your content',
    category: 'YouTube',
    icon: '🔥',
    available: true
  },
  {
    id: 'youtube-title-generate',
    title: 'YouTube Title Generator',
    description: 'Create catchy video titles that get clicks',
    category: 'YouTube',
    icon: '📝',
    available: true
  },
  {
    id: 'youtube-description-generate',
    title: 'YouTube Description Generator',
    description: 'Generate compelling video descriptions',
    category: 'YouTube',
    icon: '📜',
    available: true
  },
  {
    id: 'youtube-embed',
    title: 'YouTube Embed Generator',
    description: 'Generate responsive embed codes for videos',
    category: 'YouTube',
    icon: '📺',
    available: true
  },
  {
    id: 'youtube-money',
    title: 'YouTube Money Calculator',
    description: 'Estimate potential earnings from video views',
    category: 'YouTube',
    icon: '💰',
    available: true
  },
  {
    id: 'youtube-region-check',
    title: 'YouTube Region Checker',
    description: 'Check if a video is available in specific countries',
    category: 'YouTube',
    icon: '🌍',
    available: true
  },
  // SEO Tools
  {
    id: 'keyword-density',
    title: 'Keyword Density Checker',
    description: 'Analyze keyword frequency in your text content',
    category: 'SEO',
    icon: '📊',
    available: true
  },
  {
    id: 'meta-analyze',
    title: 'Meta Tags Analyzer',
    description: 'Analyze and audit your meta tags',
    category: 'SEO',
    icon: '🔍',
    available: true
  },
  {
    id: 'adsense-calculator',
    title: 'AdSense Revenue Calculator',
    description: 'Calculate potential AdSense earnings',
    category: 'SEO',
    icon: '💵',
    available: true
  },
  {
    id: 'text-compare',
    title: 'Text Compare Tool',
    description: 'Compare two texts and see differences',
    category: 'SEO',
    icon: '⚖️',
    available: true
  },
  // Utility Tools
  {
    id: 'backwards-text',
    title: 'Backwards Text Generator',
    description: 'Reverse any text string',
    category: 'Tools',
    icon: '🔄',
    available: true
  },
  {
    id: 'youtube-trending',
    title: 'YouTube Trending Videos',
    description: 'Get trending videos by country and category',
    category: 'YouTube',
    icon: '🔥',
    available: true
  },
  {
    id: 'youtube-channel-stats',
    title: 'YouTube Channel Analytics',
    description: 'Analyze channel performance and statistics',
    category: 'YouTube',
    icon: '📈',
    available: true
  },
  {
    id: 'youtube-niche-analyzer',
    title: 'YouTube Niche Analyzer',
    description: 'Analyze YouTube niches for market size, competition, and monetization potential',
    category: 'YouTube',
    icon: '🎯',
    available: true
  },
  {
    id: 'youtube-transcript',
    title: 'YouTube Transcript Extractor',
    description: 'Extract subtitles/transcripts from any YouTube video',
    category: 'YouTube',
    icon: '📋',
    available: true
  },
  // Coming Soon
  {
    id: 'ai-image-generator',
    title: 'AI Image Generator',
    description: 'Generate images from text prompts',
    category: 'Tools',
    icon: '🎨',
    available: false
  }
];

export default function Home() {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">YouTools</h1>
              <span className="ml-2 text-sm text-gray-500">Free YouTube & SEO Tools</span>
            </div>
            <div className="flex space-x-4">
              <a
                href="/tools"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Test APIs
              </a>
              <a
                href="/demo"
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Quick Demo
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Powerful YouTube & SEO Tools
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Boost your content with our comprehensive suite of YouTube analytics, 
            SEO optimization, and content creation tools. All free to use!
          </p>
        </div>

        {/* Tools Grid - Client Component */}
        <ToolsGrid tools={tools} />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>© 2024 YouTools. Built with Next.js 14, TypeScript, and Tailwind CSS.</p>
            <p className="mt-2 text-sm">Free tools for content creators and SEO professionals.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
