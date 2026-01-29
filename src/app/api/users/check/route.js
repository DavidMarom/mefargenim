import { NextResponse } from 'next/server';
import { findUserByEmail, createUser } from '../../../../services/users';

export async function POST(request) {
  try {
    const { email, userData } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    let user = await findUserByEmail(email);

    // If user doesn't exist and userData is provided, create the user
    if (!user && userData) {
      const newUser = {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName || null,
        photoURL: userData.photoURL || null,
        emailVerified: userData.emailVerified || false,
        phoneNumber: userData.phoneNumber || null,
        providerData: userData.providerData || [],
        metadata: {
          creationTime: userData.metadata?.creationTime || new Date().toISOString(),
          lastSignInTime: userData.metadata?.lastSignInTime || new Date().toISOString(),
        },
      };

      const result = await createUser(newUser);
      
      // Fetch the newly created user
      user = await findUserByEmail(email);
      
      return NextResponse.json({
        exists: true,
        created: true,
        user: user,
      });
    }

    // If user exists, update lastSignInTime
    if (user && userData?.metadata?.lastSignInTime) {
      // You could update lastSignInTime here if needed
    }

    return NextResponse.json({
      exists: !!user,
      created: false,
      user: user || null,
    });
  } catch (error) {
    console.error('Error checking/creating user:', error);
    return NextResponse.json(
      { error: 'Failed to process user', message: error.message },
      { status: 500 }
    );
  }
}
