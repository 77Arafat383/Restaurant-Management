'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Order, OrderStatus } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Bike, 
  Utensils, 
  Star, 
  ArrowLeft, 
  AlertCircle, 
  Flame, 
  ShieldCheck, 
  ShieldAlert,
  Send,
  RefreshCw,
  LogIn
} from 'lucide-react';

const STATUS_STEPS: { status: OrderStatus; label: string; description: string; icon: React.ElementType }[] = [
  { status: 'PENDING', label: 'Order Placed', description: 'Received by system', icon: Clock },
  { status: 'ACCEPTED', label: 'Accepted by Kitchen', description: 'Restaurant confirmed order', icon: CheckCircle2 },
  { status: 'PREPARING', label: 'Cooking in Progress', description: 'Freshly preparing your meal', icon: Utensils },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', description: 'Rider is on the way to you', icon: Bike },
  { status: 'DELIVERED', label: 'Delivered', description: 'Enjoy your hot meal!', icon: CheckCircle2 },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { currentUser, openAuthModal } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Fetch order data
  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
      } else {
        setError(data.error || 'Order not found');
      }
    } catch (e) {
      setError('Failed to fetch order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // Submit Feedback
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setIsSubmittingReview(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          customerId: order.customerId,
          customerName: order.customerName,
          restaurantId: order.restaurantId,
          restaurantName: order.restaurantName,
          rating,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviewSubmitted(true);
      }
    } catch (e) {
      console.error('Failed to submit review', e);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-bold text-slate-600">Loading live tracking details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Order Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">{error || 'Could not locate order with ID ' + orderId}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-500 text-white rounded-xl text-xs font-bold shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900">Sign In to View Order Details</h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Please log in to your QuickBite account to access live tracking and receipt details for this order.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => openAuthModal('login', 'Please sign in to access your order tracking.')}
            className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-500/25 transition-all hover:scale-105"
          >
            <LogIn className="w-4 h-4" /> Sign In
          </button>
          <Link
            href="/orders"
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const isAuthorized =
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'RESTAURANT_MANAGER' ||
    currentUser.role === 'DELIVERY_PERSON' ||
    order.customerId === currentUser.id;

  if (!isAuthorized) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900">Access Restricted</h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            This order belongs to another customer. You do not have permission to view its tracking details.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/orders"
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" /> View My Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.status === order.status);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Order #{order.orderNumber}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-brand-50 text-brand-700 border border-brand-200">
              {order.status.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Placed on {formatDate(order.createdAt)} from <strong className="text-slate-700">{order.restaurantName}</strong>
          </p>
        </div>

        {/* Live Simulator Advance Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrder}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh Status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Status Stepper + Map / Driver info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Real-time Timeline Stepper */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Visual Progress Stepper Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Live Delivery Progress</h3>
                <p className="text-xs text-slate-500">Real-time status updates from kitchen & rider</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Estimated Arrival</p>
                <p className="text-sm font-black text-emerald-600">{order.estimatedDeliveryTime}</p>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;
                const Icon = step.icon;

                return (
                  <div key={step.status} className="relative flex items-start gap-4">
                    {/* Circle Node */}
                    <div
                      className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                        isPassed
                          ? 'bg-brand-500 text-white ring-4 ring-brand-100 shadow-md shadow-brand-500/20'
                          : 'bg-white border-2 border-slate-300 text-slate-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-sm font-bold ${
                            isCurrent ? 'text-brand-600' : isPassed ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </h4>
                        {isCurrent && (
                          <span className="animate-pulse flex h-2 w-2 rounded-full bg-brand-500" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Rider Contact Card (if assigned or out for delivery) */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center ring-2 ring-brand-500/40">
                <Bike className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold text-brand-400 tracking-wider">
                  Assigned Rider
                </span>
                <h4 className="text-base font-black text-white">{order.deliveryPersonName || 'Rakibul Hasan'}</h4>
                <p className="text-xs text-slate-400">QuickBite Express Delivery Partner</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a
                href={`tel:${order.deliveryPersonPhone || '+8801912334455'}`}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-500/25"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Rider</span>
              </a>
            </div>
          </div>

          {/* Post-Delivery Feedback & Review Section */}
          {order.status === 'DELIVERED' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-amber-500 font-bold text-base">
                <Star className="w-5 h-5 fill-amber-500" />
                <span className="text-slate-900">How was your dining experience?</span>
              </div>
              <p className="text-xs text-slate-500">
                Help <strong className="text-slate-700">{order.restaurantName}</strong> improve their taste and service!
              </p>

              {reviewSubmitted ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Thank you! Your rating and review have been published.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4 pt-2">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-125 transition-transform"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= rating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-bold text-slate-700">{rating} of 5 Stars</span>
                  </div>

                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Write a comment about food quality, packaging, delivery speed..."
                    className="w-full p-3.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-brand-500"
                    required
                  />

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingReview ? 'Publishing...' : 'Submit Review'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Order Items Receipt & Delivery Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
              Order Receipt Breakdown
            </h3>

            {/* Delivery address */}
            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800">Delivering To:</p>
                  <p className="text-slate-600">{order.deliveryAddress}</p>
                  <p className="text-slate-500 font-medium mt-0.5">Phone: {order.customerPhone}</p>
                </div>
              </div>
              {order.notes && (
                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                  <strong>Notes:</strong> {order.notes}
                </div>
              )}
            </div>

            {/* Item list */}
            <div className="space-y-2.5 divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {order.items.map((it) => (
                <div key={it.id} className="pt-2.5 first:pt-0 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{it.name}</span>
                    <span className="text-slate-400 font-medium ml-2">× {it.quantity}</span>
                  </div>
                  <span className="font-bold text-slate-900">{formatPrice(it.subtotal)}</span>
                </div>
              ))}
            </div>

            {/* Summary calculations */}
            <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-slate-900">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-medium text-slate-900">{formatPrice(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Govt. Tax (5%)</span>
                <span className="font-medium text-slate-900">{formatPrice(order.tax)}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="font-black text-slate-900">Total Paid</span>
                <span className="text-xl font-black text-brand-600">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>

            {/* Payment Badge */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500">Payment: {order.paymentMethod}</span>
              <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
