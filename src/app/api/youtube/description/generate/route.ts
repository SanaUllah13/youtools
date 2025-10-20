import { NextRequest, NextResponse } from 'next/server';
import { descriptionGenBody } from '@/lib/validators';
import { descriptionRB } from '@/lib/rules';
import { freeDescriptionFrom } from '@/lib/ai';
import { generateYouTubeDescription, hasOpenAI } from '@/lib/openai-service';
import { guard } from '@/lib/limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const limited = await guard(ip);
  if (limited) return NextResponse.json(limited, { status: limited.status });

  try {
    const body = await req.json();
    const v = descriptionGenBody.safeParse(body);
    if (!v.success) {
      return NextResponse.json({ error: 'Invalid input', details: v.error.errors }, { status: 400 });
    }

    const { title, bullets = [], mode } = v.data;

    let description: string = '';
    let usedMethod = mode;

    try {
      if (hasOpenAI && (mode === 'ai' || mode === 'economy')) {
        // Use OpenAI for professional descriptions
        console.log('🚀 Using OpenAI for professional description generation');
        description = await generateYouTubeDescription(title, { bullets });
        usedMethod = 'ai';
      } else if (mode === 'economy') {
        // Economy mode: use enhanced free generation
        console.log('🆓 Using free description generation');
        description = freeDescriptionFrom(title, bullets);
        if (!description) {
          description = descriptionRB(title, bullets);
        }
      } else {
        // Rule-based generation (rb mode or fallback)
        console.log('📝 Using rule-based description generation');
        description = descriptionRB(title, bullets);
      }
    } catch (openaiError: any) {
      console.log('⚠️ OpenAI failed, falling back to free generation:', openaiError?.message || openaiError);
      // Fallback to free generation
      description = freeDescriptionFrom(title, bullets);
      if (!description) {
        description = descriptionRB(title, bullets);
      }
      usedMethod = 'rb';
    }

    // Calculate some stats
    const wordCount = description.split(/\s+/).length;
    const charCount = description.length;
    const hashtagCount = (description.match(/#\w+/g) || []).length;

    return NextResponse.json({ 
      description,
      mode: usedMethod,
      stats: {
        characters: charCount,
        words: wordCount,
        hashtags: hashtagCount
      },
      title,
      bullets,
      usingOpenAI: hasOpenAI && (mode === 'ai' || mode === 'economy') && usedMethod === mode
    });

  } catch (e: any) {
    return NextResponse.json({ 
      error: 'failed to generate description', 
      detail: String(e?.message || e) 
    }, { status: 500 });
  }
}