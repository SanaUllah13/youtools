import { NextRequest, NextResponse } from 'next/server';
import { videoInput } from '@/lib/validators';
import { extractId, videoInfo } from '@/lib/youtube';
import { getVideoInfoWithFallbacks, extractVideoId } from '@/lib/youtube-scraper';
import { getC, setC } from '@/lib/cache';
import { guard } from '@/lib/limit';
import youtubeSearch from 'youtube-sr';

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const limited = await guard(ip);
  if (limited) return NextResponse.json(limited, { status: limited.status });

  const input = new URL(req.url).searchParams.get('input') || '';
  const v = videoInput.safeParse({ input });
  if (!v.success) return NextResponse.json({ error: 'input required' }, { status: 400 });

  const id = extractId(input) || extractVideoId(input);
  if (!id) return NextResponse.json({ error: 'invalid YouTube URL or ID' }, { status: 400 });

  const key = `yt:info:${id}`;
  const hit = getC(key);
  if (hit) return NextResponse.json({ cached: true, ...hit });

  try {
    let data: any = null;
    let method = 'unknown';
    
    // Try Method 1: ytdl-core
    try {
      console.log('Trying ytdl-core for:', id);
      data = await videoInfo(id);
      method = 'ytdl-core';
      console.log('ytdl-core succeeded');
    } catch (ytdlError) {
      console.log('ytdl-core failed:', ytdlError);
      
      // Try Method 2: youtube-sr
      try {
        console.log('Trying youtube-sr for:', id);
        const video = await youtubeSearch.getVideo(`https://www.youtube.com/watch?v=${id}`);
        if (video) {
          data = {
            id: video.id || id,
            url: video.url || `https://www.youtube.com/watch?v=${id}`,
            title: video.title || '',
            description: video.description || '',
            author: video.channel?.name || '',
            channelId: video.channel?.id || '',
            thumbnails: video.thumbnail ? [{ url: video.thumbnail.url }] : [],
            uploadDate: video.uploadedAt || null,
            lengthSeconds: video.duration || 0,
            viewCount: video.views || 0,
            likes: video.likes || 0,
            comments: video.comments || 0,
            keywords: [],
            availableCountries: null,
            isLive: video.live || false,
          };
          method = 'youtube-sr';
          console.log('youtube-sr succeeded');
        }
      } catch (srError) {
        console.log('youtube-sr failed:', srError);
        
        // Try Method 3: HTML scraper
        try {
          console.log('Trying scraper fallback for:', id);
          data = await getVideoInfoWithFallbacks(input);
          method = 'scraper';
          console.log('scraper succeeded');
        } catch (scraperError) {
          console.log('scraper failed:', scraperError);
        }
      }
    }
    
    if (!data || !data.title) {
      throw new Error('All video info extraction methods failed');
    }
    
    setC(key, data, 1000 * 60 * 10); // Cache for 10 minutes
    return NextResponse.json({ method, ...data });
  } catch (e: any) {
    console.error('All methods failed:', e);
    return NextResponse.json({ 
      error: 'failed to fetch video info', 
      detail: String(e?.message || e),
      suggestion: 'Please check if the video URL is valid and publicly accessible' 
    }, { status: 502 });
  }
}