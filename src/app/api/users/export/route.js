import { NextResponse } from 'next/server';
import { getAllUsers } from '../../../../services/users';
import { Parser } from 'json2csv';

export async function GET() {
  try {
    // Fetch all users from MongoDB
    const users = await getAllUsers();

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'No users found' },
        { status: 404 }
      );
    }

    // Flatten nested objects for CSV export
    const flattenedUsers = users.map(user => {
      const flatUser = {
        _id: user._id?.toString() || '',
        uid: user.uid || '',
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        emailVerified: user.emailVerified ? 'true' : 'false',
        phoneNumber: user.phoneNumber || '',
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : '',
        updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : '',
        creationTime: user.metadata?.creationTime || '',
        lastSignInTime: user.metadata?.lastSignInTime || '',
      };

      // Handle providerData array
      if (user.providerData && Array.isArray(user.providerData) && user.providerData.length > 0) {
        flatUser.providerId = user.providerData[0].providerId || '';
        flatUser.providerUid = user.providerData[0].uid || '';
      } else {
        flatUser.providerId = '';
        flatUser.providerUid = '';
      }

      return flatUser;
    });

    // Define CSV fields
    const fields = [
      '_id',
      'uid',
      'email',
      'displayName',
      'photoURL',
      'emailVerified',
      'phoneNumber',
      'providerId',
      'providerUid',
      'creationTime',
      'lastSignInTime',
      'createdAt',
      'updatedAt',
    ];

    // Convert to CSV
    const parser = new Parser({ fields });
    const csv = parser.parse(flattenedUsers);

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting users to CSV:', error);
    return NextResponse.json(
      { error: 'Failed to export users', message: error.message },
      { status: 500 }
    );
  }
}
