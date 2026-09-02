import { NextResponse } from 'next/server';
import { localStore } from '@/lib/db';

export async function GET() {
  try {
    const config = await localStore.getConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch configuration.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vatRate, deliveryCharge } = body;

    if (vatRate !== undefined && (typeof vatRate !== 'number' || vatRate < 0 || vatRate > 1)) {
      return NextResponse.json({ success: false, error: 'VAT rate must be a number between 0 and 1.' }, { status: 400 });
    }

    if (deliveryCharge !== undefined && (typeof deliveryCharge !== 'number' || deliveryCharge < 0)) {
      return NextResponse.json({ success: false, error: 'Delivery charge must be a non-negative number.' }, { status: 400 });
    }

    const updated = await localStore.updateConfig({
      vatRate: vatRate !== undefined ? Number(vatRate) : undefined,
      deliveryCharge: deliveryCharge !== undefined ? Number(deliveryCharge) : undefined,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to update configuration.' }, { status: 500 });
  }
}
