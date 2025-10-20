import { NextRequest, NextResponse } from 'next/server';
import { videoInput } from '@/lib/validators';
import { extractId, videoInfo } from '@/lib/youtube';
import { getVideoInfoWithFallbacks, extractVideoId } from '@/lib/youtube-scraper';
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

  const key = `yt:info:${id}`;
  const hit = getC(key);
  if (hit) return NextResponse.json({ cached: true, ...hit });

  try {
    // Try ytdl-core first (if working)
    let data = null;
    try {
      data = await videoInfo(id);
    } catch (ytdlError) {
      console.log('ytdl-core failed, using scraper fallback:', ytdlError);
      // Use scraper fallback
      data = await getVideoInfoWithFallbacks(input);
    }
    
    if (!data) {
      throw new Error('All video info extraction methods failed');
    }
    
    setC(key, data, 1000 * 60 * 10); // Cache for 10 minutes
    return NextResponse.json({ method: data === null ? 'scraper' : 'ytdl-core', ...data });
  } catch (e: any) {
    return NextResponse.json({ 
      error: 'failed to fetch video info', 
      detail: String(e?.message || e),
      suggestion: 'Please check if the video URL is valid and publicly accessible' 
    }, { status: 502 });
  }
}