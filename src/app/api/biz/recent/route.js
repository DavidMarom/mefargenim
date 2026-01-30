import { NextResponse } from 'next/server';
import { getRecentBusinesses } from '../../../../services/biz';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '3', 10);
    
    const businesses = await getRecentBusinesses(limit);
    
    return NextResponse.json({
      success: true,
      data: businesses,
    });
  } catch (error) {
    console.error('Error fetching recent businesses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent businesses', message: error.message },
      { status: 500 }
    );
  }
}
