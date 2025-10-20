import { NextRequest, NextResponse } from 'next/server';
import { videoInput } from '@/lib/validators';
import { extractId, videoInfo } from '@/lib/youtube';
import { getVideoInfoWithFallbacks, extractVideoId, extractKeywordsFromContent } from '@/lib/youtube-scraper';
import { tagsFrom } from '@/lib/rules';
import { getC, setC } from '@/lib/cache';
import { guard } from '@/lib/limit';

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const limited = await guard(ip);
  if (limited) return NextResponse.json(limited, { status: limited.status });

  const input = new URL(req.url).searchParams.get('input') || '';
  const v = videoInput.safeParse({ input });
  if (!v.success) return NextResponse.json({ error: 'input required' }, { status: 400 });

  const id = extractId(input) || extractVideoId(input);
  if (!id) return NextResponse.json({ error: 'invalid YouTube URL or ID' }, { status: 400 });

  const key = `yt:tags:${id}`;
  const hit = getC(key);
  if (hit) return NextResponse.json({ cached: true, tags: hit });

  try {
    // Try ytdl-core first, then scraper fallback
    let data = null;
    try {
      data = await videoInfo(id);
    } catch (ytdlError) {
      console.log('ytdl-core failed, using scraper fallback for tags:', ytdlError);
      data = await getVideoInfoWithFallbacks(input);
    }
    
    if (!data) {
      throw new Error('Failed to get video info for tag extraction');
    }
    
    // Use existing keywords if available, otherwise generate from title and description
    let tags = data.keywords || [];
    if (tags.length === 0) {
      // Try enhanced keyword extraction first
      tags = extractKeywordsFromContent(data.title || '', data.description || '');
      
      // Fallback to original method if no results
      if (tags.length === 0) {
        tags = tagsFrom(data.title || '', data.description || '', 25);
      }
    }
    
    setC(key, tags, 1000 * 60 * 30); // Cache for 30 minutes
    return NextResponse.json({ 
      tags, 
      count: tags.length,
      videoTitle: data.title,
      source: data.keywords?.length > 0 ? 'video_metadata' : 'extracted'
    });
  } catch (e: any) {
    return NextResponse.json({ 
      error: 'failed to extract tags', 
      detail: String(e?.message || e),
      suggestion: 'Please check if the video URL is valid and accessible'
    }, { status: 502 });
  }
}