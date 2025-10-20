import { NextRequest, NextResponse } from 'next/server';
import { adsenseBody } from '@/lib/validators';
import { guard } from '@/lib/limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const limited = await guard(ip);
  if (limited) return NextResponse.json(limited, { status: limited.status });

  try {
    const body = await req.json();
    const v = adsenseBody.safeParse(body);
    if (!v.success) {
      return NextResponse.json({ error: 'Invalid input', details: v.error.errors }, { status: 400 });
    }

    const { pageViews, ctr, cpc } = v.data;

    const clicks = pageViews * ctr;
    const revenue = clicks * cpc;

    // Calculate best/worst case scenarios (+/- 20%)
    const bestCase = revenue * 1.2;
    const worstCase = revenue * 0.8;

    return NextResponse.json({
      pageViews,
      ctr,
      cpc,
      clicks: Math.round(clicks * 100) / 100,
      revenue: {
        daily: Math.round(revenue * 100) / 100,
        monthly: Math.round((revenue * 30) * 100) / 100,
        yearly: Math.round((revenue * 365) * 100) / 100
      },
      note: 'Estimates based on provided CTR and CPC. Actual performance may vary due to factors like ad quality, user location, device type, and seasonal trends.'
    });

  } catch (e: any) {
    return NextResponse.json({ 
      error: 'failed to calculate AdSense revenue', 
      detail: String(e?.message || e) 
    }, { status: 500 });
  }
}