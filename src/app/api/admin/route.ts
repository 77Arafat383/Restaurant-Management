import { NextResponse } from 'next/server';
import { localStore } from '@/lib/db';

export async function GET() {
  try {
    const [users, restaurants, orders, feedbacks] = await Promise.all([
      localStore.getUsers(),
      localStore.getRestaurants(),
      localStore.getOrders(),
      localStore.getFeedbacks(),
    ]);

    const totalGMV = orders.reduce((sum, o) => (o.status !== 'CANCELLED' && o.status !== 'REJECTED' ? sum + o.totalAmount : sum), 0);
    const completedOrders = orders.filter(o => o.status === 'DELIVERED').length;
    const activeOrders = orders.filter(o => !['DELIVERED', 'CANCELLED', 'REJECTED'].includes(o.status)).length;

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers: users.length,
          totalRestaurants: restaurants.length,
          totalOrders: orders.length,
          activeOrders,
          completedOrders,
          totalGMV,
          totalFeedbacks: feedbacks.length,
        },
        users,
        restaurants,
        recentOrders: orders.slice(0, 10),
        feedbacks: feedbacks.slice(0, 10),
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
