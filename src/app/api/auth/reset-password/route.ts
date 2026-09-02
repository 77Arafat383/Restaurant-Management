import { NextResponse } from 'next/server';
import { localStore } from '@/lib/db';
import { verifyOTP, clearOTP } from '@/lib/otp-store';

export async function POST(req: Request) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Email, verification code, and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const isValid = verifyOTP(email, code);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired 6-digit verification code.' },
        { status: 400 }
      );
    }

    const updatedUser = await localStore.updateUserPassword(email, newPassword);
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'Failed to update user password. Please try again.' },
        { status: 500 }
      );
    }

    clearOTP(email);

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully reset! You can now sign in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred during password reset.' },
      { status: 500 }
    );
  }
}
