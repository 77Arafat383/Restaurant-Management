import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { User, UserRole } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, phone, address, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = db.getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    const assignedRole: UserRole = (role && ['CUSTOMER', 'RESTAURANT_MANAGER', 'DELIVERY_PERSON', 'ADMIN'].includes(role))
      ? (role as UserRole)
      : 'CUSTOMER';

    const newUser: User = {
      id: `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      phone: phone?.trim() || '+880 1700-000000',
      address: address?.trim() || 'Dhaka, Bangladesh',
      role: assignedRole,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`,
    };

    const savedUser = db.createUser(newUser);

    // Return safe user representation
    const { password: _, ...safeUser } = savedUser;

    return NextResponse.json(
      {
        success: true,
        message: 'Account registered successfully!',
        data: safeUser,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed.' },
      { status: 500 }
    );
  }
}
