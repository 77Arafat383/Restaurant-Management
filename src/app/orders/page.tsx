'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { 
  ShoppingBag, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Utensils, 
  Bike, 
  AlertCircle,
  Eye
} from 'lucide-react';

export default function OrdersHistoryPage() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (data.success) {
          setOrders(data.data);
        }
      } catch (e) {
        console.error('Failed to load orders', e);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Your Orders & History</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Track real-time deliveries, view itemized receipts, and order again.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-500">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-orange-100 text-brand-600 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No orders placed yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When you order food from our partner kitchens, you can track them right here.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20"
          >
            Explore Restaurants
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                    #{order.orderNumber}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === 'DELIVERED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : order.status === 'CANCELLED' || order.status === 'REJECTED'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-brand-50 text-brand-700 border border-brand-200 animate-pulse'
                    }`}
                  >
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{order.restaurantName}</h3>
                
                <p className="text-xs text-slate-500">
                  {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                </p>

                <p className="text-[11px] text-slate-400">
                  Ordered on {formatDate(order.createdAt)} • {order.paymentMethod}
                </p>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-left md:text-right">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Amount</p>
                  <p className="text-lg font-black text-slate-900">{formatPrice(order.totalAmount)}</p>
                </div>

                <Link
                  href={`/orders/${order.id}`}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all hover:scale-105"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Track & Details</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
