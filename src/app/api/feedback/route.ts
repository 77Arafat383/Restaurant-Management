import { NextResponse } from 'next/server';
import { localStore } from '@/lib/db';
import { Feedback } from '@/lib/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId') || undefined;
    const feedbacks = localStore.getFeedbacks(restaurantId);
    return NextResponse.json({ success: true, data: feedbacks });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch feedbacks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newFeedback: Feedback = {
      id: `fb_${Date.now()}`,
      orderId: body.orderId,
      customerId: body.customerId || 'user_cust_1',
      customerName: body.customerName || 'Maknoon Sultana',
      customerAvatar: body.customerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      restaurantId: body.restaurantId,
      restaurantName: body.restaurantName || 'Restaurant',
      rating: Number(body.rating) || 5,
      comment: body.comment || '',
      createdAt: new Date().toISOString(),
    };

    const saved = localStore.createFeedback(newFeedback);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to submit review' }, { status: 500 });
  }
}
