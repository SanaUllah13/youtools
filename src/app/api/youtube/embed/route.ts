import { NextRequest, NextResponse } from 'next/server';
import { embedQuery } from '@/lib/validators';
import { extractId } from '@/lib/youtube';
import { guard } from '@/lib/limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const limited = await guard(ip);
  if (limited) return NextResponse.json(limited, { status: limited.status });

  const body = await req.json();
  const input = body.input || '';
  const autoplay = body.autoplay || '0';
  const controls = body.controls || '1';
  const start = body.start || '';
  const end = body.end || '';
  const loop = body.loop || '0';
  const mute = body.mute || '0';
  const width = body.width || '560';
  const height = body.height || '315';

  const v = embedQuery.safeParse({ input, autoplay, controls });
  if (!v.success) {
    return NextResponse.json({ error: 'Invalid input parameters', details: v.error.errors }, { status: 400 });
  }

  const id = extractId(input);
  if (!id) return NextResponse.json({ error: 'invalid YouTube URL or ID' }, { status: 400 });

  try {
    // Build embed URL parameters
    const params = new URLSearchParams();
    if (autoplay === '1') params.set('autoplay', '1');
    if (controls === '0') params.set('controls', '0');
    if (start) params.set('start', start);
    if (end) params.set('end', end);
    if (loop === '1') {
      params.set('loop', '1');
      params.set('playlist', id); // Required for loop to work
    }
    if (mute === '1') params.set('mute', '1');

    const embedUrl = `https://www.youtube.com/embed/${id}${params.toString() ? '?' + params.toString() : ''}`;

    // Generate iframe embed code
    const embedCode = `<iframe width="${width}" height="${height}" src="${embedUrl}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;

    // Generate responsive embed code
    const responsiveCode = `<div style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%;">
  <iframe 
    src="${embedUrl}" 
    title="YouTube video player"
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
    referrerpolicy="strict-origin-when-cross-origin" 
    allowfullscreen
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
  </iframe>
</div>`;

    return NextResponse.json({
      videoId: id,
      embedUrl,
      embedCode,
      responsiveCode,
      parameters: {
        width,
        height,
        autoplay: autoplay === '1',
        controls: controls === '1',
        start: start || null,
        end: end || null,
        loop: loop === '1',
        mute: mute === '1'
      }
    });

  } catch (e: any) {
    return NextResponse.json({ 
      error: 'failed to generate embed code', 
      detail: String(e?.message || e) 
    }, { status: 500 });
  }
}