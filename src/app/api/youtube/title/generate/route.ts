import { NextRequest, NextResponse } from 'next/server';
import { titleGenBody } from '@/lib/validators';
import { titleRB } from '@/lib/rules';
import { freeTitlesFrom } from '@/lib/ai';
import { generateYouTubeTitles, hasOpenAI } from '@/lib/openai-service';
import { guard } from '@/lib/limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const limited = await guard(ip);
  if (limited) return NextResponse.json(limited, { status: limited.status });

  try {
    const body = await req.json();
    const v = titleGenBody.safeParse(body);
    if (!v.success) {
      return NextResponse.json({ error: 'Invalid input', details: v.error.errors }, { status: 400 });
    }

    const { text, mode } = v.data;

    let titles: string[] = [];
    let usedMethod = mode;

    try {
      if (hasOpenAI && (mode === 'ai' || mode === 'economy')) {
        // Use OpenAI for professional results
        console.log('🚀 Using OpenAI for professional title generation');
        titles = await generateYouTubeTitles(text, 5);
        usedMethod = 'ai';
      } else if (mode === 'economy') {
        // Economy mode: use enhanced free generation
        console.log('🆓 Using enhanced free generation');
        titles = freeTitlesFrom(text, 5);
        if (titles.length === 0) {
          titles = titleRB(text);
        }
      } else {
        // Rule-based generation (rb mode or fallback)
        console.log('📝 Using rule-based generation');
        titles = titleRB(text);
      }
    } catch (openaiError: any) {
      console.log('⚠️ OpenAI failed, falling back to free generation:', openaiError?.message || openaiError);
      // Fallback to free generation
      titles = freeTitlesFrom(text, 5);
      if (titles.length === 0) {
        titles = titleRB(text);
      }
      usedMethod = 'rb';
    }

    // Ensure all titles are under 70 characters
    titles = titles.map(title => title.length > 70 ? title.slice(0, 67) + '...' : title);

    return NextResponse.json({ 
      titles: titles.slice(0, 5),
      mode: usedMethod,
      count: Math.min(titles.length, 5),
      originalText: text,
      usingOpenAI: hasOpenAI && (mode === 'ai' || mode === 'economy') && usedMethod === mode
    });

  } catch (e: any) {
    return NextResponse.json({ 
      error: 'failed to generate titles', 
      detail: String(e?.message || e) 
    }, { status: 500 });
  }
}