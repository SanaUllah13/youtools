import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Cache to store trending videos data
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Valid countries and categories
const VALID_COUNTRIES = [
  'US', 'GB', 'CA', 'AU', 'DE', 'FR', 'JP', 'KR', 'IN', 'BR', 'MX', 'ES', 'IT', 'NL', 'SE', 'NO', 'DK'
];

const VALID_CATEGORIES = [
  'default', 'music', 'gaming', 'movies', 'news', 'live', 'sports', 'learning', 'fashion'
];

// Category ID mapping - both directions
const CATEGORY_IDS: { [key: string]: string } = {
  'default': '0',
  'music': '10',
  'gaming': '20',
  'movies': '1',
  'news': '25',
  'live': '0',
  'sports': '17',
  'learning': '27',
  'fashion': '26'
};

// Reverse mapping for ID to name
const CATEGORY_NAMES: { [key: string]: string } = {
  '0': 'default',
  '10': 'music',
  '20': 'gaming',
  '1': 'movies',
  '25': 'news',
  '17': 'sports',
  '27': 'learning',
  '26': 'fashion',
  '23': 'default', // Comedy -> default
  '24': 'default', // Entertainment -> default
  '15': 'default', // Pets & Animals -> default
  '19': 'default', // Travel & Events -> default
  '22': 'default', // People & Blogs -> default
  '2': 'default',  // Autos & Vehicles -> default
  '28': 'learning' // Science & Technology -> learning
};

// Mock data for fallback
const getMockData = () => [
  {
    id: 'dQw4w9WgXcQ',
    title: 'Sample Trending Video 1',
    channel: 'Sample Channel',
    channelId: 'UCsample1',
    channelUrl: 'https://youtube.com/channel/UCsample1',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    duration: '3:32',
    views: '1.2M',
    publishedAt: '2 days ago',
    description: 'This is sample data shown when live scraping is unavailable.',
    url: 'https://youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    id: 'sample2',
    title: 'Sample Trending Video 2',
    channel: 'Another Channel',
    channelId: 'UCsample2',
    channelUrl: 'https://youtube.com/channel/UCsample2',
    thumbnail: 'https://i.ytimg.com/vi/sample2/hqdefault.jpg',
    duration: '5:45',
    views: '890K',
    publishedAt: '1 day ago',
    description: 'Another sample video for demonstration purposes.',
    url: 'https://youtube.com/watch?v=sample2'
  },
  {
    id: 'sample3',
    title: 'Sample Trending Video 3',
    channel: 'Demo Channel',
    channelId: 'UCsample3',
    channelUrl: 'https://youtube.com/channel/UCsample3',
    thumbnail: 'https://i.ytimg.com/vi/sample3/hqdefault.jpg',
    duration: '8:20',
    views: '2.1M',
    publishedAt: '3 days ago',
    description: 'Third sample video showing trending content format.',
    url: 'https://youtube.com/watch?v=sample3'
  }
];

function formatDuration(duration: string | number): string {
  if (typeof duration === 'string' && duration.includes(':')) {
    return duration;
  }
  
  const seconds = typeof duration === 'string' ? parseInt(duration) : duration;
  if (isNaN(seconds)) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function formatViewCount(views: string | number): string {
  if (typeof views === 'string') {
    if (views.includes('views') || views.includes('view')) {
      return views;
    }
  }
  
  const num = typeof views === 'string' ? parseInt(views.replace(/,/g, '')) : views;
  if (isNaN(num)) return '0 views';
  
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M views`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K views`;
  }
  return `${num} views`;
}

function parseRSSFeed(xmlData: string, country: string): any[] {
  try {
    const $ = cheerio.load(xmlData, { xmlMode: true });
    const videos: any[] = [];
    
    $('entry').each((index, element) => {
      try {
        const $entry = $(element);
        const videoId = $entry.find('yt\\:videoId').text() || 
                       $entry.find('videoId').text() ||
                       $entry.find('id').text().split(':').pop();
        const title = $entry.find('title').text();
        const author = $entry.find('author name').text() || 
                      $entry.find('name').text();
        const published = $entry.find('published').text();
        const description = $entry.find('media\\:description').text() || 
                           $entry.find('description').text();
        
        if (videoId && title) {
          const publishedDate = new Date(published);
          const timeAgo = getRelativeTime(publishedDate);
          
          videos.push({
            id: videoId,
            title: title,
            channel: author || 'Unknown Channel',
            channelId: '',
            channelUrl: '',
            thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            duration: '0:00',
            views: 'N/A',
            publishedAt: timeAgo,
            description: description || '',
            url: `https://youtube.com/watch?v=${videoId}`
          });
        }
      } catch (error) {
        console.log('Error parsing RSS entry:', error);
      }
    });
    
    return videos.slice(0, 20); // Limit to 20 videos
  } catch (error) {
    console.log('Error parsing RSS feed:', error);
    return [];
  }
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
}

function parseYouTubeAPIResponse(data: any, country: string): any[] {
  try {
    const videos: any[] = [];
    
    // Navigate through the API response structure
    const contents = data?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents;
    
    if (contents && Array.isArray(contents)) {
      for (const section of contents) {
        if (section.itemSectionRenderer?.contents) {
          for (const item of section.itemSectionRenderer.contents) {
            if (item.shelfRenderer?.content?.expandedShelfContentsRenderer?.items) {
              const videoItems = item.shelfRenderer.content.expandedShelfContentsRenderer.items;
              
              for (const videoItem of videoItems) {
                const videoRenderer = videoItem.videoRenderer;
                if (videoRenderer) {
                  const channelId = videoRenderer.ownerText?.runs?.[0]?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url?.split('/')[2] || '';
                  
                  videos.push({
                    id: videoRenderer.videoId,
                    title: videoRenderer.title?.runs?.[0]?.text || videoRenderer.title?.simpleText || 'Unknown Title',
                    channel: videoRenderer.ownerText?.runs?.[0]?.text || 'Unknown Channel',
                    channelId,
                    channelUrl: channelId ? `https://youtube.com/channel/${channelId}` : '',
                    thumbnail: videoRenderer.thumbnail?.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${videoRenderer.videoId}/hqdefault.jpg`,
                    duration: formatDuration(videoRenderer.lengthText?.simpleText || '0:00'),
                    views: formatViewCount(videoRenderer.viewCountText?.simpleText || '0').replace(' views', ''),
                    publishedAt: videoRenderer.publishedTimeText?.simpleText || 'Unknown',
                    description: videoRenderer.descriptionSnippet?.runs?.[0]?.text || '',
                    url: `https://youtube.com/watch?v=${videoRenderer.videoId}`
                  });
                }
              }
            }
          }
        }
      }
    }
    
    // Also try alternative structure paths
    if (videos.length === 0 && data?.contents?.richGridRenderer?.contents) {
      const gridContents = data.contents.richGridRenderer.contents;
      
      for (const item of gridContents) {
        if (item.richItemRenderer?.content?.videoRenderer) {
          const videoRenderer = item.richItemRenderer.content.videoRenderer;
          const channelId = videoRenderer.ownerText?.runs?.[0]?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url?.split('/')[2] || '';
          
          videos.push({
            id: videoRenderer.videoId,
            title: videoRenderer.title?.runs?.[0]?.text || videoRenderer.title?.simpleText || 'Unknown Title',
            channel: videoRenderer.ownerText?.runs?.[0]?.text || 'Unknown Channel',
            channelId,
            channelUrl: channelId ? `https://youtube.com/channel/${channelId}` : '',
            thumbnail: videoRenderer.thumbnail?.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${videoRenderer.videoId}/hqdefault.jpg`,
            duration: formatDuration(videoRenderer.lengthText?.simpleText || '0:00'),
            views: formatViewCount(videoRenderer.viewCountText?.simpleText || '0').replace(' views', ''),
            publishedAt: videoRenderer.publishedTimeText?.simpleText || 'Unknown',
            description: videoRenderer.descriptionSnippet?.runs?.[0]?.text || '',
            url: `https://youtube.com/watch?v=${videoRenderer.videoId}`
          });
        }
      }
    }
    
    return videos.slice(0, 20); // Limit to 20 videos
  } catch (error) {
    console.log('Error parsing YouTube API response:', error);
    return [];
  }
}

async function scrapeTrendingVideos(country: string, category: string) {
  const categoryId = CATEGORY_IDS[category] || '0';
  
  // Try different URL patterns and approaches
  const approaches = [
    {
      name: 'YouTube Internal API',
      url: 'https://www.youtube.com/youtubei/v1/browse',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'X-YouTube-Client-Name': '1',
        'X-YouTube-Client-Version': '2.20231215.01.00'
      },
      data: {
        context: {
          client: {
            clientName: 'WEB',
            clientVersion: '2.20231215.01.00',
            gl: country,
            hl: 'en'
          }
        },
        browseId: 'FEtrending'
      }
    },
    {
      name: 'Mobile Site',
      url: `https://m.youtube.com/feed/trending?gl=${country}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    },
    {
      name: 'Desktop with Random UA',
      url: `https://www.youtube.com/feed/trending?gl=${country}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'max-age=0',
        'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      }
    }
  ];

  for (let i = 0; i < approaches.length; i++) {
    const approach = approaches[i];
    
    try {
      console.log(`Attempting ${approach.name}: ${approach.url}`);
      
      // Add delay between requests
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      let response;
      if (approach.method === 'POST') {
        response = await axios.post(approach.url, approach.data, {
          headers: approach.headers,
          timeout: 15000,
          maxRedirects: 5
        });
      } else {
        response = await axios.get(approach.url, {
          headers: approach.headers,
          timeout: 15000,
          maxRedirects: 5
        });
      }

      console.log(`Response status: ${response.status}, Content-Type: ${response.headers['content-type']}`);
      
      // Handle YouTube Internal API response
      if (approach.name === 'YouTube Internal API' && response.data) {
        const videos = parseYouTubeAPIResponse(response.data, country);
        if (videos.length > 0) {
          console.log(`Successfully parsed ${videos.length} videos from YouTube API`);
          return videos;
        }
      }

      const $ = cheerio.load(response.data);
      
      // Debug: Log page structure
      console.log('Page title:', $('title').text());
      console.log('Scripts found:', $('script').length);
      console.log('First 500 chars:', response.data.substring(0, 500));
      
      // Method 1: Extract from ytInitialData script
      const scripts = $('script').toArray();
      let videos: any[] = [];

      for (const script of scripts) {
        const content = $(script).html() || '';
        
        if (content.includes('var ytInitialData = ') || content.includes('window["ytInitialData"] = ')) {
          try {
            // Extract JSON data with multiple patterns
            let jsonMatch = content.match(/(?:var ytInitialData = |window\["ytInitialData"\] = )({.+?});/);
            if (!jsonMatch) {
              jsonMatch = content.match(/ytInitialData["']?\s*[=:]\s*({.+?})[;,]/);
            }
            if (!jsonMatch) {
              jsonMatch = content.match(/ytInitialData"\s*:\s*({.+?})/);
            }
            if (!jsonMatch) {
              jsonMatch = content.match(/"ytInitialData"\s*:\s*({.+?})/);
            }
            
            if (jsonMatch) {
              const jsonData = JSON.parse(jsonMatch[1]);
              
              // Navigate through the YouTube data structure
              const tabs = jsonData?.contents?.twoColumnBrowseResultsRenderer?.tabs;
              if (tabs && Array.isArray(tabs)) {
                for (const tab of tabs) {
                  const tabRenderer = tab.tabRenderer;
                  if (tabRenderer?.content?.sectionListRenderer?.contents) {
                    const contents = tabRenderer.content.sectionListRenderer.contents;
                    
                    for (const content of contents) {
                      if (content.itemSectionRenderer?.contents) {
                        const items = content.itemSectionRenderer.contents;
                        
                        for (const item of items) {
                          if (item.shelfRenderer?.content?.expandedShelfContentsRenderer?.items) {
                            const videoItems = item.shelfRenderer.content.expandedShelfContentsRenderer.items;
                            
                            for (const videoItem of videoItems) {
                              const videoRenderer = videoItem.videoRenderer;
                              if (videoRenderer) {
                                const channelId = videoRenderer.ownerText?.runs?.[0]?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url?.split('/')?.[2] || '';
                                const video = {
                                  id: videoRenderer.videoId,
                                  title: videoRenderer.title?.runs?.[0]?.text || videoRenderer.title?.simpleText || 'Unknown Title',
                                  channel: videoRenderer.ownerText?.runs?.[0]?.text || 'Unknown Channel',
                                  channelId,
                                  channelUrl: channelId ? `https://youtube.com/channel/${channelId}` : '',
                                  thumbnail: videoRenderer.thumbnail?.thumbnails?.[0]?.url || '',
                                  duration: formatDuration(videoRenderer.lengthText?.simpleText || '0:00'),
                                  views: formatViewCount(videoRenderer.viewCountText?.simpleText || '0').replace(' views', ''),
                                  publishedAt: videoRenderer.publishedTimeText?.simpleText || 'Unknown',
                                  description: videoRenderer.descriptionSnippet?.runs?.[0]?.text || '',
                                  url: `https://youtube.com/watch?v=${videoRenderer.videoId}`
                                };
                                
                                if (video.id && video.title !== 'Unknown Title') {
                                  videos.push(video);
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
              
              if (videos.length > 0) {
                console.log(`Successfully extracted ${videos.length} videos from ytInitialData`);
                return videos;
              }
            }
          } catch (error) {
            console.log('Error parsing ytInitialData:', error);
          }
        }
      }

      // Method 2: Fallback HTML scraping
      const videoElements = $('div[class*="ytd-video-renderer"], div[class*="video-renderer"]').toArray();
      
      for (const element of videoElements) {
        try {
          const $element = $(element);
          const titleElement = $element.find('a[id="video-title"], h3 a, .video-title a').first();
          const title = titleElement.text().trim();
          const videoUrl = titleElement.attr('href');
          const videoId = videoUrl ? videoUrl.split('v=')[1]?.split('&')[0] : '';
          
          if (title && videoId) {
            const channel = $element.find('a[class*="channel"], .channel-name a').first().text().trim();
            const viewCount = $element.find('span[class*="view"], .view-count').first().text().trim();
            const publishedAt = $element.find('span[class*="published"], .published-time').first().text().trim();
            
            videos.push({
              id: videoId,
              title: title,
              channel: channel || 'Unknown Channel',
              channelId: '',
              channelUrl: '',
              thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
              duration: '0:00',
              views: formatViewCount(viewCount || '0').replace(' views', ''),
              publishedAt: publishedAt || 'Unknown',
              description: '',
              url: `https://youtube.com/watch?v=${videoId}`
            });
          }
        } catch (error) {
          console.log('Error parsing video element:', error);
        }
      }
      
      if (videos.length > 0) {
        console.log(`Successfully scraped ${videos.length} videos from HTML`);
        return videos;
      }

    } catch (error) {
      console.log(`Failed ${approach.name}:`, error.message || error);
      continue;
    }
  }

  console.log('All scraping methods failed, returning mock data');
  return getMockData();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || 'US';
    const categoryParam = searchParams.get('category') || 'default';

    // Validate parameters
    if (!VALID_COUNTRIES.includes(country)) {
      return NextResponse.json(
        { error: 'Invalid country code' },
        { status: 400 }
      );
    }

    // Handle both category names and IDs
    let category = categoryParam;
    if (CATEGORY_NAMES[categoryParam]) {
      // If it's a category ID, convert to name
      category = CATEGORY_NAMES[categoryParam];
    } else if (!VALID_CATEGORIES.includes(categoryParam)) {
      // If it's neither a valid name nor ID, error
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Generate cache key
    const cacheKey = `trending_${country}_${category}`;
    const cachedData = cache.get(cacheKey);

    // Check if cached data is still valid
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      console.log('Returning cached data');
      return NextResponse.json({
        videos: cachedData.data,
        count: cachedData.data.length,
        country,
        category,
        timestamp: new Date(cachedData.timestamp).toISOString(),
        cached: true
      });
    }

    // Scrape fresh data
    console.log(`Scraping trending videos for ${country}/${category}`);
    const videos = await scrapeTrendingVideos(country, category);

    // Cache the results
    cache.set(cacheKey, {
      data: videos,
      timestamp: Date.now()
    });

    // Determine if we're showing mock data
    const isMockData = videos.every(video => video.id.startsWith('sample') || video.id === 'dQw4w9WgXcQ');

    return NextResponse.json({
      videos,
      count: videos.length,
      country,
      category,
      timestamp: new Date().toISOString(),
      cached: false,
      isMockData,
      notice: isMockData ? 'Live data unavailable. Showing sample data for demonstration.' : undefined
    });

  } catch (error) {
    console.error('Error in trending API:', error);
    
    return NextResponse.json({
      videos: getMockData(),
      count: getMockData().length,
      country: 'US',
      category: 'default',
      timestamp: new Date().toISOString(),
      cached: false,
      error: 'Failed to fetch trending videos',
      isMockData: true,
      notice: 'Service temporarily unavailable. Showing sample data.'
    }, { status: 500 });
  }
}