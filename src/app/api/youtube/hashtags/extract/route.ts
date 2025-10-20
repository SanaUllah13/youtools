import { NextRequest, NextResponse } from 'next/server';
import { videoInput } from '@/lib/validators';
import { extractId, videoInfo } from '@/lib/youtube';
import { getVideoInfoWithFallbacks, extractVideoId, extractHashtagsFromText } from '@/lib/youtube-scraper';
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

  const key = `yt:hashtags:${id}`;
  const hit = getC(key);
  if (hit) return NextResponse.json({ cached: true, hashtags: hit });

  try {
    // Try ytdl-core first, then scraper fallback
    let data = null;
    try {
      data = await videoInfo(id);
    } catch (ytdlError) {
      console.log('ytdl-core failed, using scraper fallback for hashtags:', ytdlError);
      data = await getVideoInfoWithFallbacks(input);
    }
    
    if (!data) {
      throw new Error('Failed to get video info for hashtag extraction');
    }
    
    // Extract hashtags from description using enhanced method
    const description = data.description || '';
    let hashtags = extractHashtagsFromText(description);
    
    // If no hashtags found in description, generate relevant ones from title and description
    if (hashtags.length === 0) {
      const { freeHashtagsFrom } = await import('@/lib/ai');
      hashtags = freeHashtagsFrom(`${data.title} ${description}`, '', 15);
    }
    
    setC(key, hashtags, 1000 * 60 * 30); // Cache for 30 minutes
    return NextResponse.json({ 
      hashtags,
      count: hashtags.length,
      videoId: id,
      videoTitle: data.title,
      hasDescription: description.length > 0,
      extractedFromDescription: extractHashtagsFromText(description).length > 0
    });
  } catch (e: any) {
    return NextResponse.json({ 
      error: 'failed to extract hashtags', 
      detail: String(e?.message || e),
      suggestion: 'Please check if the video URL is valid and accessible'
    }, { status: 502 });
  }
}