import { NextResponse } from 'next/server';
import { localStore } from '@/lib/db';
import { Order } from '@/lib/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId') || undefined;
    const restaurantId = searchParams.get('restaurantId') || undefined;
    const deliveryPersonId = searchParams.get('deliveryPersonId') || undefined;

    const orders = localStore.getOrders({ customerId, restaurantId, deliveryPersonId });
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderNumber = `QB-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: `order_${Date.now()}`,
      orderNumber,
      customerId: body.customerId || 'user_cust_1',
      customerName: body.customerName || 'Maknoon Sultana',
      customerEmail: body.customerEmail || 'customer@quickbite.com',
      customerPhone: body.customerPhone || '+880 1711-223344',
      deliveryAddress: body.deliveryAddress || 'Dhanmondi, Dhaka',
      restaurantId: body.restaurantId,
      restaurantName: body.restaurantName,
      restaurantAddress: body.restaurantAddress || 'Dhaka',
      items: body.items || [],
      subtotal: Number(body.subtotal) || 0,
      deliveryFee: Number(body.deliveryFee) || 40,
      tax: Number(body.tax) || 0,
      discount: Number(body.discount) || 0,
      totalAmount: Number(body.totalAmount) || 0,
      status: 'PENDING',
      paymentMethod: body.paymentMethod || 'COD',
      paymentStatus: body.paymentMethod === 'COD' ? 'PENDING' : 'COMPLETED',
      transactionId: body.transactionId || `TRX_${Date.now()}`,
      notes: body.notes || '',
      estimatedDeliveryTime: '30-40 mins',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = localStore.createOrder(newOrder);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
  }
}
