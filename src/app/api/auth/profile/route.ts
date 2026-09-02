import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(req: Request) {
  try {
    const { id, name, phone, address, avatar } = await req.json();

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const updatedUser = await db.updateUserProfile(id, { name, phone, address, avatar });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'User account not found or update failed.' },
        { status: 404 }
      );
    }

    // Omit sensitive password hash
    const { password: _, ...safeUser } = updatedUser;

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully!',
      data: safeUser,
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
