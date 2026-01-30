import { NextResponse } from 'next/server';
import { hasUserLiked, toggleLike, getLikeCount } from '../../../services/likes';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const businessId = searchParams.get('businessId');

    if (!userId || !businessId) {
      return NextResponse.json(
        { error: 'userId and businessId are required' },
        { status: 400 }
      );
    }

    const liked = await hasUserLiked(userId, businessId);
    const count = await getLikeCount(businessId);

    return NextResponse.json({
      success: true,
      liked: liked,
      count: count,
    });
  } catch (error) {
    console.error('Error fetching like status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch like status', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { userId, businessId } = await request.json();

    if (!userId || !businessId) {
      return NextResponse.json(
        { error: 'userId and businessId are required' },
        { status: 400 }
      );
    }

    const result = await toggleLike(userId, businessId);
    const count = await getLikeCount(businessId);

    return NextResponse.json({
      success: true,
      liked: result.liked,
      count: count,
      action: result.action,
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like', message: error.message },
      { status: 500 }
    );
  }
}
