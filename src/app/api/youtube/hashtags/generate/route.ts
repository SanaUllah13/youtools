import { NextRequest, NextResponse } from 'next/server';
import { hashtagsBody } from '@/lib/validators';
import { hashFrom } from '@/lib/rules';
import { freeHashtagsFrom } from '@/lib/ai';
import { generateYouTubeHashtags, hasOpenAI } from '@/lib/openai-service';
import { guard } from '@/lib/limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const limited = await guard(ip);
  if (limited) return NextResponse.json(limited, { status: limited.status });

  try {
    const body = await req.json();
    const v = hashtagsBody.safeParse(body);
    if (!v.success) {
      return NextResponse.json({ error: 'Invalid input', details: v.error.errors }, { status: 400 });
    }

    const { title, niche, max, mode } = v.data;

    let hashtags: string[] = [];
    let usedMethod = mode;

    try {
      if (hasOpenAI && (mode === 'ai' || mode === 'economy')) {
        // Use OpenAI for professional hashtags
        console.log('🚀 Using OpenAI for professional hashtag generation');
        hashtags = await generateYouTubeHashtags(`${title} ${niche}`, max);
        usedMethod = 'ai';
      } else if (mode === 'economy') {
        // Economy mode: use enhanced free generation
        console.log('🆓 Using free hashtag generation');
        hashtags = freeHashtagsFrom(`${title} ${niche}`, niche, max);
        if (hashtags.length === 0) {
          hashtags = hashFrom(title, niche, max);
        }
      } else {
        // Rule-based generation (rb mode or fallback)
        console.log('📝 Using rule-based hashtag generation');
        hashtags = hashFrom(title, niche, max);
      }
    } catch (openaiError: any) {
      console.log('⚠️ OpenAI failed, falling back to free generation:', openaiError?.message || openaiError);
      // Fallback to free generation
      hashtags = freeHashtagsFrom(`${title} ${niche}`, niche, max);
      if (hashtags.length === 0) {
        hashtags = hashFrom(title, niche, max);
      }
      usedMethod = 'rb';
    }

    return NextResponse.json({ 
      hashtags: hashtags.slice(0, max),
      mode: usedMethod,
      count: Math.min(hashtags.length, max),
      title,
      niche,
      usingOpenAI: hasOpenAI && (mode === 'ai' || mode === 'economy') && usedMethod === mode
    });

  } catch (e: any) {
    return NextResponse.json({ 
      error: 'failed to generate hashtags', 
      detail: String(e?.message || e) 
    }, { status: 500 });
  }
}