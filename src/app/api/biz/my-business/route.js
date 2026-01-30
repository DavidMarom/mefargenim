import { NextResponse } from 'next/server';
import { getBusinessByUserId, createBusiness, updateBusinessByUserId, deleteBusinessByUserId } from '../../../../services/biz';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const business = await getBusinessByUserId(userId);

    return NextResponse.json({
      success: true,
      data: business,
    });
  } catch (error) {
    console.error('Error fetching user business:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { userId, businessData } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Check if business exists
    const existingBusiness = await getBusinessByUserId(userId);

    if (existingBusiness) {
      // Update existing business
      const result = await updateBusinessByUserId(userId, businessData);
      const updatedBusiness = await getBusinessByUserId(userId);
      
      return NextResponse.json({
        success: true,
        updated: true,
        data: updatedBusiness,
      });
    } else {
      // Create new business
      const newBusiness = await createBusiness(userId, businessData);
      
      return NextResponse.json({
        success: true,
        created: true,
        data: newBusiness,
      });
    }
  } catch (error) {
    console.error('Error saving business:', error);
    return NextResponse.json(
      { error: 'Failed to save business', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const result = await deleteBusinessByUserId(userId);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Business deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting business:', error);
    return NextResponse.json(
      { error: 'Failed to delete business', message: error.message },
      { status: 500 }
    );
  }
}
