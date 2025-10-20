import { NextRequest, NextResponse } from 'next/server';
import { textInput } from '@/lib/validators';
import { guard } from '@/lib/limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const limited = await guard(ip);
  if (limited) return NextResponse.json(limited, { status: limited.status });

  try {
    const body = await req.json();
    const v = textInput.safeParse(body);
    if (!v.success) {
      return NextResponse.json({ error: 'Invalid input', details: v.error.errors }, { status: 400 });
    }

    const { text } = v.data;
    const reversed = text.split('').reverse().join('');

    return NextResponse.json({
      original: text,
      reversed,
      length: text.length,
      charactersReversed: text.length
    });

  } catch (e: any) {
    return NextResponse.json({ 
      error: 'failed to reverse text', 
      detail: String(e?.message || e) 
    }, { status: 500 });
  }
}