import { NextResponse } from 'next/server';
import { getAllBizDocuments } from '../../../../services/biz';
import { Parser } from 'json2csv';

export async function GET() {
  try {
    // Fetch all businesses from MongoDB
    const businesses = await getAllBizDocuments();

    if (!businesses || businesses.length === 0) {
      return NextResponse.json(
        { error: 'No businesses found' },
        { status: 404 }
      );
    }

    // Flatten nested objects for CSV export
    const flattenedBusinesses = businesses.map(business => {
      const flatBusiness = {
        _id: business._id?.toString() || '',
        userId: business.userId || '',
        title: business.title || business.name || '',
        type: business.type || '',
        city: business.city || '',
        phone: business.phone || '',
        address: business.address || '',
        description: business.description || '',
        website: business.website || '',
        email: business.email || '',
        createdAt: business.createdAt ? new Date(business.createdAt).toISOString() : '',
        updatedAt: business.updatedAt ? new Date(business.updatedAt).toISOString() : '',
      };

      return flatBusiness;
    });

    // Define CSV fields
    const fields = [
      '_id',
      'userId',
      'title',
      'type',
      'city',
      'phone',
      'address',
      'description',
      'website',
      'email',
      'createdAt',
      'updatedAt',
    ];

    // Convert to CSV
    const parser = new Parser({ fields });
    const csv = parser.parse(flattenedBusinesses);

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="businesses-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting businesses to CSV:', error);
    return NextResponse.json(
      { error: 'Failed to export businesses', message: error.message },
      { status: 500 }
    );
  }
}
