import { NextRequest, NextResponse } from 'next/server';
import { countryInput } from '@/lib/validators';
import { extractVideoId, getVideoInfoWithFallbacks } from '@/lib/youtube-scraper';
import { guard } from '@/lib/limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const limited = await guard(ip);
  if (limited) return NextResponse.json(limited, { status: limited.status });

  const body = await req.json();
  const { input, country } = body;
  
  const v = countryInput.safeParse({ input, country: country.toUpperCase() });
  if (!v.success) return NextResponse.json({ error: 'input & country required' }, { status: 400 });

  const id = extractVideoId(input);
  if (!id) return NextResponse.json({ error: 'invalid YouTube URL or ID' }, { status: 400 });

  try {
    const data = await getVideoInfoWithFallbacks(input);
    if (!data) {
      return NextResponse.json({ error: 'Video not found or unavailable' }, { status: 404 });
    }
    
    const list = data.availableCountries as string[] | null;
    
    const available = !list || list.includes(country.toUpperCase());
    
    return NextResponse.json({ 
      availability: {
        available,
        reason: !available ? 'Video is restricted in this country' : 'Video is available'
      },
      videoInfo: {
        id,
        title: data.title,
        author: data.author,
        lengthSeconds: data.lengthSeconds
      },
      alternativeCountries: list || [],
      country: country.toUpperCase()
    });
    
  } catch (e: any) {
    return NextResponse.json({ 
      error: 'failed to check region restrictions', 
      detail: String(e?.message || e) 
    }, { status: 502 });
  }
}