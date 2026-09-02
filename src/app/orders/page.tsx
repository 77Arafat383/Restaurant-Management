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
  Eye,
  Search,
  Trash2,
  LogIn
} from 'lucide-react';

export default function OrdersHistoryPage() {
  const { currentUser, openAuthModal } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel and delete this order? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
      } else {
        alert(data.error || 'Failed to delete order');
      }
    } catch (e) {
      console.error('Error deleting order:', e);
      alert('Failed to delete order. Please try again.');
    }
  };

  const filteredOrders = orders.filter(order => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const matchesRestaurant = order.restaurantName.toLowerCase().includes(query);
    const matchesFood = order.items.some(item => item.name.toLowerCase().includes(query));
    return matchesRestaurant || matchesFood;
  });

  useEffect(() => {
    async function loadOrders() {
      if (!currentUser) {
        setOrders([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        let url = '/api/orders';
        if (currentUser.role === 'CUSTOMER') {
          url += `?customerId=${currentUser.id}`;
        } else if (currentUser.role === 'RESTAURANT_MANAGER' && currentUser.restaurantId) {
          url += `?restaurantId=${currentUser.restaurantId}`;
        } else if (currentUser.role === 'DELIVERY_PERSON') {
          url += `?deliveryPersonId=${currentUser.id}`;
        }

        const res = await fetch(url);
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
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900">Sign In to View Orders</h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Please log in to your QuickBite account to view your purchase history, track live deliveries, and reorder.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => openAuthModal('login', 'Please sign in to view your orders.')}
            className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-500/25 transition-all hover:scale-105"
          >
            <LogIn className="w-4 h-4" /> Sign In
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all"
          >
            <ArrowRight className="w-4 h-4" /> Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Your Orders & History</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Track real-time deliveries, view itemized receipts, and order again.
          </p>
        </div>
        
        {orders.length > 0 && (
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by food or restaurant..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800 shadow-sm transition-all"
            />
          </div>
        )}
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
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No matching orders found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We couldn&apos;t find any orders matching &ldquo;{searchQuery}&rdquo;. Try another search term!
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
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

                <div className="flex items-center gap-2">
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 text-xs font-bold transition-all hover:scale-105 active:scale-95 shrink-0"
                      title="Cancel and delete this order"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel Order</span>
                    </button>
                  )}

                  <Link
                    href={`/orders/${order.id}`}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all hover:scale-105 shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live Track & Details</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
