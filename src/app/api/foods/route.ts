import { NextResponse } from 'next/server';
import { localStore } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId') || undefined;
    const items = localStore.getFoodItems(restaurantId);
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch food items' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newItem = localStore.createFoodItem({
      id: `food_${Date.now()}`,
      restaurantId: body.restaurantId,
      name: body.name,
      description: body.description || '',
      price: Number(body.price) || 0,
      category: body.category || 'Main Course',
      isAvailable: body.isAvailable !== undefined ? body.isAvailable : true,
      image: body.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
      isVeg: Boolean(body.isVeg),
      isSpicy: Boolean(body.isSpicy),
      rating: 5.0,
      preparationTime: body.preparationTime || '15 min',
    });

    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to add food item' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Item ID required' }, { status: 400 });
    }

    const updated = localStore.updateFoodItem(body.id, {
      name: body.name,
      description: body.description,
      price: body.price !== undefined ? Number(body.price) : undefined,
      category: body.category,
      isAvailable: body.isAvailable,
      image: body.image,
      isVeg: body.isVeg,
      isSpicy: body.isSpicy,
      preparationTime: body.preparationTime,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Item ID required' }, { status: 400 });
    }

    const deleted = localStore.deleteFoodItem(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: deleted });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete item' }, { status: 500 });
  }
}
