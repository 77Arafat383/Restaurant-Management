import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No user found with this email address.' },
        { status: 404 }
      );
    }

    // Check approval status for partners
    if (user.isApproved === false) {
      return NextResponse.json(
        { success: false, error: 'Your partner account registration is pending admin approval.' },
        { status: 403 }
      );
    }

    // Check password
    if (user.password && user.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Invalid password. Please check and try again.' },
        { status: 401 }
      );
    }

    // Return safe user object
    const { password: _, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      message: 'Logged in successfully!',
      data: safeUser,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
