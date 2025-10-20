import { NextRequest, NextResponse } from 'next/server';
import { moneyCalcBody } from '@/lib/validators';
import { guard } from '@/lib/limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const limited = await guard(ip);
  if (limited) return NextResponse.json(limited, { status: limited.status });

  try {
    const body = await req.json();
    const v = moneyCalcBody.safeParse(body);
    if (!v.success) {
      return NextResponse.json({ error: 'Invalid input', details: v.error.errors }, { status: 400 });
    }

    const { views, rpmLow = 0.5, rpmHigh = 4.0 } = v.data;

    // Calculate earnings based on RPM (Revenue Per Mille)
    const lowEarnings = (views * rpmLow) / 1000;
    const highEarnings = (views * rpmHigh) / 1000;
    const midpointEarnings = (lowEarnings + highEarnings) / 2;

    return NextResponse.json({
      views,
      rpmLow,
      rpmHigh,
      earnings: {
        low: Math.round(lowEarnings * 100) / 100,
        high: Math.round(highEarnings * 100) / 100,
        average: Math.round(midpointEarnings * 100) / 100
      },
      currency: 'USD',
      note: 'These are estimates based on typical YouTube RPM rates. Actual earnings may vary significantly based on factors like audience location, content category, seasonality, and ad performance.'
    });

  } catch (e: any) {
    return NextResponse.json({ 
      error: 'failed to calculate earnings', 
      detail: String(e?.message || e) 
    }, { status: 500 });
  }
}