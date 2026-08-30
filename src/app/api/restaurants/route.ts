import { NextResponse } from 'next/server';
import { localStore } from '@/lib/db';

export async function GET() {
  try {
    const restaurants = localStore.getRestaurants();
    return NextResponse.json({ success: true, data: restaurants });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch restaurants' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newRestaurant = localStore.createRestaurant({
      id: `rest_${Date.now()}`,
      name: body.name,
      description: body.description || '',
      email: body.email,
      phone: body.phone,
      address: body.address,
      cuisine: body.cuisine || 'Fast Food',
      rating: 5.0,
      ratingCount: 1,
      deliveryTime: body.deliveryTime || '25-35 min',
      deliveryFee: Number(body.deliveryFee) || 40,
      minOrder: Number(body.minOrder) || 200,
      bannerImage: body.bannerImage || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
      logoImage: body.logoImage || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80',
      isApproved: true,
      isOpen: true,
      ownerId: body.ownerId || 'user_rest_1',
    });

    return NextResponse.json({ success: true, data: newRestaurant }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create restaurant' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Restaurant ID is required.' }, { status: 400 });
    }

    const deleted = localStore.deleteRestaurant(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Restaurant not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: deleted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete restaurant.' }, { status: 500 });
  }
}
