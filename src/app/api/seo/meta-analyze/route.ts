import { NextRequest, NextResponse } from 'next/server';
import { metaAnalyzeBody } from '@/lib/validators';
import { guard } from '@/lib/limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const limited = await guard(ip);
  if (limited) return NextResponse.json(limited, { status: limited.status });

  try {
    const body = await req.json();
    const v = metaAnalyzeBody.safeParse(body);
    if (!v.success) {
      return NextResponse.json({ error: 'Invalid input', details: v.error.errors }, { status: 400 });
    }

    const { html } = v.data;

    // Extract meta tags using regex patterns
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const descriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    
    // Extract Open Graph tags
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    const ogDescriptionMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    
    // Extract Twitter Card tags
    const twitterTitleMatch = html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    const twitterDescriptionMatch = html.match(/<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']*)["'][^>]*>/i);

    const title = titleMatch ? titleMatch[1].trim() : null;
    const description = descriptionMatch ? descriptionMatch[1].trim() : null;
    const keywords = keywordsMatch ? keywordsMatch[1].trim() : null;

    // Analyze findings
    const warnings = [];
    const recommendations = [];

    // Title analysis
    if (!title) {
      warnings.push('Missing title tag');
    } else {
      if (title.length < 10) warnings.push('Title is too short (less than 10 characters)');
      if (title.length > 60) warnings.push('Title is too long (more than 60 characters)');
      if (title.length >= 10 && title.length <= 60) recommendations.push('Title length is optimal');
    }

    // Description analysis
    if (!description) {
      warnings.push('Missing meta description');
    } else {
      if (description.length < 120) warnings.push('Meta description is too short (less than 120 characters)');
      if (description.length > 160) warnings.push('Meta description is too long (more than 160 characters)');
      if (description.length >= 120 && description.length <= 160) recommendations.push('Meta description length is optimal');
    }

    // Keywords analysis
    if (keywords) {
      const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);
      if (keywordList.length > 10) warnings.push('Too many keywords (more than 10)');
      if (keywordList.length <= 10 && keywordList.length > 0) recommendations.push(`Keywords count is reasonable (${keywordList.length})`);
    }

    // Open Graph analysis
    const hasOG = !!(ogTitleMatch || ogDescriptionMatch || ogImageMatch);
    if (!hasOG) warnings.push('Missing Open Graph meta tags for social media sharing');

    // Twitter Card analysis
    const hasTwitter = !!(twitterTitleMatch || twitterDescriptionMatch || twitterImageMatch);
    if (!hasTwitter) warnings.push('Missing Twitter Card meta tags');

    return NextResponse.json({
      score: Math.max(0, 100 - (warnings.length * 15)),
      analysis: {
        title: {
          content: title,
          length: title ? title.length : 0,
          status: !title ? 'error' : (title.length >= 10 && title.length <= 60) ? 'good' : 'warning',
          issues: !title ? ['Missing title tag'] : (title.length < 10 ? ['Title too short'] : title.length > 60 ? ['Title too long'] : [])
        },
        description: {
          content: description,
          length: description ? description.length : 0,
          status: !description ? 'error' : (description.length >= 120 && description.length <= 160) ? 'good' : 'warning'
        },
        openGraph: {
          'og:title': ogTitleMatch ? ogTitleMatch[1].trim() : null,
          'og:description': ogDescriptionMatch ? ogDescriptionMatch[1].trim() : null,
          'og:image': ogImageMatch ? ogImageMatch[1].trim() : null
        }
      },
      recommendations,
      allTags: []
    });

  } catch (e: any) {
    return NextResponse.json({ 
      error: 'failed to analyze meta tags', 
      detail: String(e?.message || e) 
    }, { status: 500 });
  }
}