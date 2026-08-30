'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Order, OrderStatus } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { 
  Bike, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Navigation, 
  Package, 
  Clock, 
  RefreshCw, 
  ShieldCheck, 
  DollarSign 
} from 'lucide-react';
import Link from 'next/link';

export default function DeliveryPartnerPortal() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deliveryTab, setDeliveryTab] = useState<'MY_RUNS' | 'AVAILABLE_JOBS'>('MY_RUNS');

  const handleRequestDelivery = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestedDeliveryPersonId: currentUser?.id,
          requestedDeliveryPersonName: currentUser?.name,
          requestedDeliveryPersonPhone: currentUser?.phone,
          deliveryRequestStatus: 'PENDING'
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.map(o => (o.id === orderId ? data.data : o)));
      }
    } catch (e) {
      console.error('Failed to request delivery assignment', e);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch delivery orders', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateDelivery = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          deliveryPersonId: currentUser?.id || 'user_deliv_1',
          deliveryPersonName: currentUser?.name || 'Rakibul Hasan',
          deliveryPersonPhone: currentUser?.phone || '+880 1912-334455',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.map(o => (o.id === orderId ? data.data : o)));
      }
    } catch (e) {
      console.error('Failed to update delivery status', e);
    }
  };

  if (!currentUser || (currentUser.role !== 'DELIVERY_PERSON' && currentUser.role !== 'ADMIN')) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <Bike className="w-16 h-16 text-blue-500 mx-auto animate-bounce" />
        <h2 className="text-xl font-black text-slate-900">Rider Portal Access Restricted</h2>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Please sign in with a registered Rider account to access the delivery dispatch console and manage orders.
        </p>
      </div>
    );
  }

  const myRuns = orders.filter(
    o => o.deliveryPersonId === currentUser.id && ['ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'].includes(o.status)
  );

  const availableJobs = orders.filter(
    o => !o.deliveryPersonId && ['ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP'].includes(o.status)
  );

  const completedCount = orders.filter(o => o.deliveryPersonId === currentUser.id && o.status === 'DELIVERED').length;
  const estimatedEarnings = completedCount * 50; // 50 BDT per delivery payout

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-500 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/25 shrink-0">
            <Bike className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Delivery Dispatch Console
              </span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> GPS Online
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">Rider {currentUser.name}</h1>
            <p className="text-xs text-slate-400">Coverage: Dhanmondi, Gulshan & Banani Zone</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            title="Refresh Deliveries"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Active Dispatch Tasks</p>
            <p className="text-2xl font-black text-slate-900">{myRuns.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Completed Orders</p>
            <p className="text-2xl font-black text-emerald-600">{completedCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Estimated Rider Payout</p>
            <p className="text-2xl font-black text-amber-600">{formatPrice(estimatedEarnings)}</p>
          </div>
        </div>
      </div>

      {/* Deliveries List */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <h2 className="text-xl font-black text-slate-900">Delivery Dispatch Board</h2>
          
          <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setDeliveryTab('MY_RUNS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                deliveryTab === 'MY_RUNS'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Runs ({myRuns.length})
            </button>
            <button
              onClick={() => setDeliveryTab('AVAILABLE_JOBS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                deliveryTab === 'AVAILABLE_JOBS'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Available Jobs ({availableJobs.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-bold">Checking dispatch queue...</p>
          </div>
        ) : (deliveryTab === 'MY_RUNS' ? myRuns : availableJobs).length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
            <p className="text-sm font-bold text-slate-600">
              {deliveryTab === 'MY_RUNS' 
                ? 'You have no active runs. Request jobs in the "Available Jobs" tab!'
                : 'No available delivery jobs at the moment.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(deliveryTab === 'MY_RUNS' ? myRuns : availableJobs).map(order => (
              <div
                key={order.id}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg">
                      #{order.orderNumber}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Pickup & Dropoff Routing */}
                  <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-2xl">
                    <div className="flex items-start gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 mt-1" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Pickup Restaurant</p>
                        <p className="font-bold text-slate-900">{order.restaurantName}</p>
                        <p className="text-slate-500">{order.restaurantAddress || 'Dhaka Central'}</p>
                      </div>
                    </div>

                    <div className="border-l border-dashed border-slate-300 ml-1 pl-4 my-1 py-1" />

                    <div className="flex items-start gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Drop-off Destination</p>
                        <p className="font-bold text-slate-900">{order.customerName}</p>
                        <p className="text-slate-600">{order.deliveryAddress}</p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Phone & Notes */}
                  <div className="flex items-center justify-between pt-1">
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call Customer ({order.customerPhone})
                    </a>

                    <span className="text-xs font-black text-slate-900">
                      Collect: {order.paymentMethod === 'COD' ? formatPrice(order.totalAmount) : 'Paid Online (৳0)'}
                    </span>
                  </div>
                </div>

                {/* Workflow Progression Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    View Map Details
                  </Link>

                  <div className="flex items-center gap-2">
                    {deliveryTab === 'MY_RUNS' ? (
                      <>
                        {order.status === 'ACCEPTED' && (
                          <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-lg">
                            ⏱ Preparing in Kitchen
                          </span>
                        )}

                        {(order.status === 'PREPARING' || order.status === 'READY_FOR_PICKUP') && (
                          <button
                            onClick={() => handleUpdateDelivery(order.id, 'OUT_FOR_DELIVERY')}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                          >
                            <Bike className="w-3.5 h-3.5" /> Pick Up & Start Transit
                          </button>
                        )}

                        {order.status === 'OUT_FOR_DELIVERY' && (
                          <button
                            onClick={() => handleUpdateDelivery(order.id, 'DELIVERED')}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Delivery Handover
                          </button>
                        )}

                        {order.status === 'DELIVERED' && (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
                            ✓ Delivery Handover Complete
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        {order.requestedDeliveryPersonId === currentUser.id && order.deliveryRequestStatus === 'PENDING' ? (
                          <span className="text-xs font-black text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1.5 rounded-lg animate-pulse">
                            ⏱ Pending Approval
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRequestDelivery(order.id)}
                            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all hover:scale-105 active:scale-95"
                          >
                            Request Assignment
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
