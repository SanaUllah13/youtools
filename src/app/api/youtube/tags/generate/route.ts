import { NextRequest, NextResponse } from 'next/server';
import { genTagsBody } from '@/lib/validators';
import { tagsFrom } from '@/lib/rules';
import { freeTagsFrom } from '@/lib/ai';
import { guard } from '@/lib/limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const limited = await guard(ip);
  if (limited) return NextResponse.json(limited, { status: limited.status });

  try {
    const body = await req.json();
    const v = genTagsBody.safeParse(body);
    if (!v.success) {
      return NextResponse.json({ error: 'Invalid input', details: v.error.errors }, { status: 400 });
    }

    const { title, description, max, mode } = v.data;

    let tags: string[] = [];

    if (mode === 'rb') {
      // Rule-based generation (FREE)
      tags = tagsFrom(title, description, max);
    } else if (mode === 'economy' || mode === 'ai') {
      // FREE tag generation - no API costs!
      tags = freeTagsFrom(`${title} ${description}`, max);
      
      // Fallback to rule-based if free generation fails
      if (tags.length === 0) {
        tags = tagsFrom(title, description, max);
      }
    }

    return NextResponse.json({ 
      tags: tags.slice(0, max),
      mode,
      count: tags.length 
    });

  } catch (e: any) {
    return NextResponse.json({ 
      error: 'failed to generate tags', 
      detail: String(e?.message || e) 
    }, { status: 500 });
  }
}