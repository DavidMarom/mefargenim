import { NextResponse } from 'next/server';
import { createBusinessAdmin } from '../../../../services/biz';

export async function POST(request) {
  try {
    const { businessData } = await request.json();

    if (!businessData || !businessData.title) {
      return NextResponse.json(
        { error: 'Business data with title is required' },
        { status: 400 }
      );
    }

    // Create new business without userId (MongoDB will auto-generate _id)
    const newBusiness = await createBusinessAdmin(businessData);
    
    return NextResponse.json({
      success: true,
      data: newBusiness,
    });
  } catch (error) {
    console.error('Error creating business:', error);
    return NextResponse.json(
      { error: 'Failed to create business', message: error.message },
      { status: 500 }
    );
  }
}
