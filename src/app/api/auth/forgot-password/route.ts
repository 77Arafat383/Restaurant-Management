import { NextResponse } from 'next/server';
import { localStore } from '@/lib/db';
import { generateOTP } from '@/lib/otp-store';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const user = await localStore.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No account found with this email address. Please check and try again.' },
        { status: 404 }
      );
    }

    const code = generateOTP(email);

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${email}`,
      demoCode: code, // Returned for instant local development demo testing
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
