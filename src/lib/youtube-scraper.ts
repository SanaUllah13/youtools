import axios from 'axios';
import * as cheerio from 'cheerio';

interface VideoInfo {
  id: string;
  url: string;
  title: string;
  description: string;
  author: string;
  channelId: string;
  thumbnails: any[];
  uploadDate: string | null;
  lengthSeconds: number;
  viewCount: number;
  keywords: string[];
  availableCountries: string[] | null;
  isLive: boolean;
}

// Extract video ID from various YouTube URL formats
export function extractVideoId(input: string): string | null {
  // If it's already an 11-character ID
  if (/^[\w-]{11}$/.test(input)) return input;
  
  // Various YouTube URL patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

// Method 1: Direct HTML scraping (lightweight and fast)
export async function scrapeVideoInfoHTML(videoId: string): Promise<VideoInfo | null> {
  try {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive'
      },
      timeout: 10000
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Extract JSON data from script tags
    let videoData: any = null;
    let ytInitialData: any = null;
    
    $('script').each((_, element) => {
      const scriptContent = $(element).html();
      if (scriptContent && scriptContent.includes('var ytInitialPlayerResponse = ')) {
        try {
          const match = scriptContent.match(/var ytInitialPlayerResponse = ({.+?});/);
          if (match) {
            videoData = JSON.parse(match[1]);
          }
        } catch (e) {
          // Continue to next script
        }
      }
      
      if (scriptContent && scriptContent.includes('var ytInitialData = ')) {
        try {
          const match = scriptContent.match(/var ytInitialData = ({.+?});/);
          if (match) {
            ytInitialData = JSON.parse(match[1]);
          }
        } catch (e) {
          // Continue to next script
        }
      }
      
      if (!videoData && scriptContent && scriptContent.includes('"videoDetails"')) {
        try {
          const match = scriptContent.match(/"videoDetails":\s*({[^}]+})/);
          if (match) {
            const details = JSON.parse(match[1]);
            videoData = { videoDetails: details };
          }
        } catch (e) {
          // Continue to next script
        }
      }
    });

    if (videoData?.videoDetails) {
      const vd = videoData.videoDetails;
      
      // Extract available countries from multiple sources
      let availableCountries: string[] | null = null;
      
      // Try microformat first
      if (videoData.microformat?.playerMicroformatRenderer?.availableCountries) {
        availableCountries = videoData.microformat.playerMicroformatRenderer.availableCountries;
      }
      // Try videoDetails
      else if (videoData.videoDetails?.availableCountries) {
        availableCountries = videoData.videoDetails.availableCountries;
      }
      // Try ytInitialData if available
      else if (ytInitialData?.contents?.twoColumnWatchNextResults?.results?.results?.contents?.[0]?.videoPrimaryInfoRenderer?.availableCountries) {
        availableCountries = ytInitialData.contents.twoColumnWatchNextResults.results.results.contents[0].videoPrimaryInfoRenderer.availableCountries;
      }
      // Check if video is blocked/restricted
      const isBlocked = videoData.playabilityStatus?.status === 'UNPLAYABLE' || 
                       videoData.playabilityStatus?.status === 'ERROR';
      
      // If video is blocked but no country list is found, assume it's region restricted
      if (isBlocked && !availableCountries) {
        // Set empty array to indicate restricted video
        availableCountries = [];
      }
      
      return {
        id: vd.videoId || videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        title: vd.title || $('title').text().replace(' - YouTube', ''),
        description: vd.shortDescription || vd.description || '',
        author: vd.author || vd.channelTitle || '',
        channelId: vd.channelId || '',
        thumbnails: vd.thumbnail?.thumbnails || [],
        uploadDate: null,
        lengthSeconds: parseInt(vd.lengthSeconds) || 0,
        viewCount: parseInt(vd.viewCount) || 0,
        keywords: vd.keywords || [],
        availableCountries,
        isLive: vd.isLiveContent || false,
      };
    }

    // Fallback: Extract from meta tags and page content
    return extractFromMetaTags($, videoId);

  } catch (error) {
    console.error('HTML scraping failed:', error);
    return null;
  }
}

// Method 2: Extract from meta tags (fallback)
function extractFromMetaTags($: cheerio.CheerioAPI, videoId: string): VideoInfo | null {
  try {
    const title = $('meta[property="og:title"]').attr('content') || 
                  $('meta[name="title"]').attr('content') ||
                  $('title').text().replace(' - YouTube', '');
    
    const description = $('meta[property="og:description"]').attr('content') || 
                       $('meta[name="description"]').attr('content') || '';
    
    const author = $('link[itemprop="name"]').attr('content') || 
                  $('meta[name="author"]').attr('content') || '';

    if (title) {
      return {
        id: videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        title,
        description,
        author,
        channelId: '',
        thumbnails: [{
          url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          width: 1280,
          height: 720
        }],
        uploadDate: null,
        lengthSeconds: 0,
        viewCount: 0,
        keywords: [],
        availableCountries: null,
        isLive: false,
      };
    }

    return null;
  } catch (error) {
    console.error('Meta tag extraction failed:', error);
    return null;
  }
}

// Method 3: Using oembed API (YouTube's official but limited API)
export async function scrapeVideoInfoOEmbed(videoId: string): Promise<Partial<VideoInfo> | null> {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await axios.get(url, { timeout: 5000 });
    
    if (response.data) {
      return {
        id: videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        title: response.data.title,
        author: response.data.author_name,
        description: '',
        channelId: '',
        thumbnails: [{
          url: response.data.thumbnail_url,
          width: response.data.thumbnail_width,
          height: response.data.thumbnail_height
        }],
        uploadDate: null,
        lengthSeconds: 0,
        viewCount: 0,
        keywords: [],
        availableCountries: null,
        isLive: false,
      };
    }
    
    return null;
  } catch (error) {
    console.error('OEmbed API failed:', error);
    return null;
  }
}

// Main function with multiple fallback methods
export async function getVideoInfoWithFallbacks(input: string): Promise<VideoInfo | null> {
  const videoId = extractVideoId(input);
  if (!videoId) {
    throw new Error('Invalid YouTube URL or video ID');
  }

  // Try multiple methods in order of preference
  const methods = [
    () => scrapeVideoInfoHTML(videoId),
    () => scrapeVideoInfoOEmbed(videoId)
  ];

  for (const method of methods) {
    try {
      const result = await method();
      if (result && result.title) {
        return result as VideoInfo;
      }
    } catch (error) {
      console.error('Method failed, trying next:', error);
      continue;
    }
  }

  throw new Error('All video info extraction methods failed');
}

// Enhanced hashtag extraction
export function extractHashtagsFromText(text: string): string[] {
  if (!text) return [];
  
  const hashtagRegex = /#[\w\u00c0-\u024f\u1e00-\u1eff]+/gi;
  const matches = text.match(hashtagRegex);
  
  if (!matches) return [];
  
  // Clean and deduplicate
  return [...new Set(matches.map(tag => tag.toLowerCase()))];
}

// Enhanced keyword extraction from title and description
export function extractKeywordsFromContent(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  
  // Common stop words to filter out
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
    'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were',
    'will', 'with', 'the', 'this', 'but', 'they', 'have', 'had', 'what', 'said',
    'each', 'which', 'do', 'how', 'their', 'if', 'up', 'out', 'many', 'then',
    'them', 'these', 'so', 'some', 'her', 'would', 'make', 'like', 'into', 'him',
    'time', 'two', 'more', 'go', 'no', 'way', 'could', 'my', 'than', 'first',
    'been', 'call', 'who', 'oil', 'sit', 'now', 'find', 'down', 'day', 'did',
    'get', 'come', 'made', 'may', 'part'
  ]);
  
  // Extract words, filter out stop words and short words
  const words = text
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .slice(0, 20); // Limit to top 20 keywords
    
  // Remove duplicates and return
  return [...new Set(words)];
}