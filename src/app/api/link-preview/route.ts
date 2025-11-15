import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // Validate URL
    const urlObj = new URL(url);
    
    // For security, only allow HTTP/HTTPS protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return NextResponse.json({ error: 'Invalid protocol' }, { status: 400 });
    }

    // Fetch the page content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TaskTrackerBot/1.0)',
      },
    });

    if (!response.ok) {
      return NextResponse.json({
        domain: urlObj.hostname,
        title: urlObj.pathname.split('/').pop() || url,
      });
    }

    const html = await response.text();
    
    // Extract metadata using regex (simple approach)
    const getMetaContent = (name: string) => {
      // Try different meta tag formats
      const patterns = [
        new RegExp(`<meta[^>]*property=["']${name}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i'),
        new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i'),
        new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${name}["'][^>]*>`, 'i'),
        new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${name}["'][^>]*>`, 'i'),
      ];
      
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) return match[1];
      }
      return null;
    };

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = getMetaContent('og:title') || 
                  getMetaContent('twitter:title') || 
                  titleMatch?.[1] || 
                  urlObj.hostname;

    // Extract description
    const description = getMetaContent('og:description') || 
                       getMetaContent('twitter:description') || 
                       getMetaContent('description');

    // Extract image
    const image = getMetaContent('og:image') || 
                  getMetaContent('twitter:image');

    // Extract site name
    const siteName = getMetaContent('og:site_name') || urlObj.hostname;

    return NextResponse.json({
      title: title?.trim(),
      description: description?.trim(),
      image: image,
      domain: siteName,
    });

  } catch (error) {
    console.error('Link preview error:', error);
    
    // Return basic fallback data
    try {
      const urlObj = new URL(url);
      return NextResponse.json({
        domain: urlObj.hostname,
        title: urlObj.pathname.split('/').pop() || url,
      });
    } catch {
      return NextResponse.json({
        domain: 'unknown',
        title: url,
      });
    }
  }
}