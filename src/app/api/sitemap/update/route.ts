import { NextResponse } from 'next/server';
import { getAllBizDocuments } from '../../../../services/biz';

export async function POST() {
  try {
    // Fetch all businesses from the database to verify they exist
    const businesses = await getAllBizDocuments();
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mefargenim.com';
    const sitemapUrl = `${baseUrl}/sitemap.xml`;
    
    // Ping Google to request re-indexing of the sitemap
    // This tells Google to crawl the sitemap and index all the business pages
    const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    
    let googlePingSuccess = false;
    try {
      const googleResponse = await fetch(googlePingUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SitemapPing)',
        },
      });
      
      googlePingSuccess = googleResponse.ok;
      
      if (!googleResponse.ok) {
        console.warn('Google ping returned non-OK status:', googleResponse.status);
      }
    } catch (googleError) {
      console.warn('Could not ping Google:', googleError);
      // This is optional, so we don't fail the whole operation
    }
    
    // Also ping Bing (optional, but helpful for broader indexing)
    const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    let bingPingSuccess = false;
    try {
      const bingResponse = await fetch(bingPingUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SitemapPing)',
        },
      });
      
      bingPingSuccess = bingResponse.ok;
    } catch (bingError) {
      console.warn('Could not ping Bing:', bingError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Sitemap update request sent successfully',
      businessesCount: businesses.length,
      sitemapUrl: sitemapUrl,
      googlePinged: googlePingSuccess,
      bingPinged: bingPingSuccess,
    });
  } catch (error) {
    console.error('Error updating sitemap:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update sitemap', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
