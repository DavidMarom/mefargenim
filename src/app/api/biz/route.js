import { NextResponse } from 'next/server';
import { getAllBizDocuments } from '../../../services/biz';

export async function GET() {
  try {
    const documents = await getAllBizDocuments();
    
    return NextResponse.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error('Error fetching Biz documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents', message: error.message },
      { status: 500 }
    );
  }
}
