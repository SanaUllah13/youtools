import { NextRequest, NextResponse } from 'next/server';
import { densityBody } from '@/lib/validators';
import { calculateKeywordDensity } from '@/lib/rules';
import { guard } from '@/lib/limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const limited = await guard(ip);
  if (limited) return NextResponse.json(limited, { status: limited.status });

  try {
    const body = await req.json();
    const v = densityBody.safeParse(body);
    if (!v.success) {
      return NextResponse.json({ error: 'Invalid input', details: v.error.errors }, { status: 400 });
    }

    const { text, stopwords = [] } = v.data;
    
    const results = calculateKeywordDensity(text, stopwords);
    const totalWords = text.split(/\s+/).length;
    
    return NextResponse.json({
      totalWords,
      uniqueWords: results.length,
      keywords: results,
      analysis: {
        highDensity: results.filter(r => r.density > 3).length,
        mediumDensity: results.filter(r => r.density > 1 && r.density <= 3).length,
        lowDensity: results.filter(r => r.density <= 1).length
      }
    });

  } catch (e: any) {
    return NextResponse.json({ 
      error: 'failed to analyze keyword density', 
      detail: String(e?.message || e) 
    }, { status: 500 });
  }
}