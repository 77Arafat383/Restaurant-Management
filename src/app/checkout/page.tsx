'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { PaymentMethod } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { 
  MapPin, 
  Phone, 
  CreditCard, 
  Banknote, 
  ArrowLeft, 
  CheckCircle2, 
  ShoppingBag, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  AlertCircle,
  LogIn,
  UserPlus,
  Mail,
  User as UserIcon,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, restaurantId, restaurantName, deliveryFee, subtotal, tax, totalAmount, clearCart } = useCart();
  const { currentUser, login, register, openAuthModal, availableUsers } = useAuth();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BKASH');
  
  // Payment simulation state
  const [mobileNumber, setMobileNumber] = useState('01711223344');
  const [mfsPin, setMfsPin] = useState('••••');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('789');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // In-line Checkout Auth Gate States (for guest visitors)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhoneInput, setAuthPhoneInput] = useState('');
  const [authAddressInput, setAuthAddressInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Auto-fill form values when user logs in or switches account
  useEffect(() => {
    if (currentUser) {
      setCustomerName(currentUser.name || '');
      setCustomerPhone(currentUser.phone || '+880 1711-223344');
      setDeliveryAddress(currentUser.address || 'House 42, Road 11, Dhanmondi, Dhaka');
    }
  }, [currentUser]);

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-orange-100 text-brand-600 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Your Basket is Empty</h1>
        <p className="text-sm text-slate-500 mb-6">
          Add some delicious items from our partner restaurants before proceeding to checkout.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/25 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Browse Restaurants
        </Link>
      </div>
    );
  }

  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setAuthError('Please enter both email and password.');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    const res = await login(authEmail, authPassword);
    setAuthLoading(false);
    if (!res.success) {
      setAuthError(res.error || 'Invalid credentials.');
    }
  };

  const handleInlineRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authName || !authEmail || !authPassword) {
      setAuthError('Name, email, and password are required.');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    const res = await register({
      name: authName.trim(),
      email: authEmail.trim(),
      password: authPassword,
      phone: authPhoneInput.trim() || '+880 1711-223344',
      address: authAddressInput.trim() || 'Dhanmondi, Dhaka',
      role: 'CUSTOMER',
    });
    setAuthLoading(false);
    if (!res.success) {
      setAuthError(res.error || 'Registration failed.');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openAuthModal('login', 'Please sign in or register to place your order.');
      return;
    }

    if (!deliveryAddress || !customerPhone) {
      setErrorMsg('Please provide a delivery address and phone number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const orderData = {
        customerId: currentUser.id,
        customerName: customerName || currentUser.name,
        customerEmail: currentUser.email,
        customerPhone: customerPhone || currentUser.phone || '+880 1711-223344',
        deliveryAddress: deliveryAddress || currentUser.address || 'Dhaka',
        restaurantId: restaurantId || 'rest_1',
        restaurantName: restaurantName || 'Royal Biryani House',
        items: cart.map(item => ({
          foodItemId: item.foodItem.id,
          name: item.foodItem.name,
          price: item.foodItem.price,
          quantity: item.quantity,
          subtotal: item.foodItem.price * item.quantity,
        })),
        subtotal,
        deliveryFee,
        tax,
        discount: 0,
        totalAmount,
        paymentMethod,
        transactionId: paymentMethod === 'COD' ? undefined : `TRX_${paymentMethod}_${Math.floor(100000 + Math.random() * 900000)}`,
        notes: deliveryNotes,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      if (data.success && data.data?.id) {
        clearCart();
        router.push(`/orders/${data.data.id}`);
      } else {
        setErrorMsg(data.error || 'Failed to place order.');
        setIsSubmitting(false);
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dining
        </Link>
        <h1 className="text-3xl font-black text-slate-900">Secure Order Checkout</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Review your items, delivery destination, and select your payment method.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* If Guest User (Not Logged In): Show Auth Gate Card */}
      {!currentUser ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xl space-y-6">
              
              {/* Alert Badge */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold text-sm">Account Required to Place Orders</p>
                  <p className="text-amber-700 font-normal mt-0.5">
                    You can freely browse food items, but please Sign In or Register to confirm your order and track live delivery.
                  </p>
                </div>
              </div>

              {authError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Tabs */}
              <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => { setAuthTab('login'); setAuthError(null); }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                    authTab === 'login'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5 inline mr-1.5" /> Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthTab('register'); setAuthError(null); }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                    authTab === 'register'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 inline mr-1.5" /> Create Account (Register)
                </button>
              </div>

              {/* In-line Login Form */}
              {authTab === 'login' && (
                <form onSubmit={handleInlineLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="e.g. customer@quickbite.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all"
                  >
                    {authLoading ? 'Signing In...' : 'Sign In & Continue to Order'}
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                      Or Quick Demo Sign In
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {availableUsers.slice(0, 4).map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setAuthEmail(u.email);
                            setAuthPassword('password123');
                            login(u.email, 'password123');
                          }}
                          className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 text-left transition-colors"
                        >
                          <p className="text-[11px] font-bold text-slate-800 truncate">{u.name}</p>
                          <p className="text-[9px] text-brand-600 font-semibold">{u.role.replace('_', ' ')}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </form>
              )}

              {/* In-line Register Form */}
              {authTab === 'register' && (
                <form onSubmit={handleInlineRegister} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="e.g. Tanvir Ahmed"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="e.g. tanvir@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPass ? 'text' : 'password'}
                          required
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="Min 4 characters"
                          className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={authPhoneInput}
                          onChange={(e) => setAuthPhoneInput(e.target.value)}
                          placeholder="+880 17..."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Address</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={authAddressInput}
                        onChange={(e) => setAuthAddressInput(e.target.value)}
                        placeholder="House / Flat / Road, Area, Dhaka"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all mt-2"
                  >
                    {authLoading ? 'Creating Account...' : 'Register & Proceed to Place Order'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

            </div>
          </div>

          {/* Right Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xl space-y-5 sticky top-28">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
                Order Summary ({cart.length} items)
              </h3>

              <div className="space-y-3 divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                {cart.map(item => (
                  <div key={item.foodItem.id} className="pt-3 first:pt-0 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{item.foodItem.name}</p>
                      <p className="text-slate-400 font-medium">Qty: {item.quantity} × {formatPrice(item.foodItem.price)}</p>
                    </div>
                    <span className="font-bold text-slate-900">
                      {formatPrice(item.foodItem.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculations */}
              <div className="pt-3 border-t border-slate-200 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Express Delivery Fee</span>
                  <span className="font-semibold text-slate-900">{formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated VAT / Tax (5%)</span>
                  <span className="font-semibold text-slate-900">{formatPrice(tax)}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Total Payable Amount</p>
                    <p className="text-2xl font-black text-slate-900">{formatPrice(totalAmount)}</p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-600 font-semibold">
                🔒 Sign In or Register to complete payment & address confirmation
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* Authenticated Customer Form */
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Form: Delivery & Payment Details */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Delivery Address Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5 text-slate-900 font-black text-base">
                  <MapPin className="w-5 h-5 text-brand-500" />
                  <span>1. Delivery Destination & Contact</span>
                </div>
                <span className="text-xs text-brand-600 font-bold bg-brand-50 px-2.5 py-1 rounded-full">
                  Logged in as {currentUser.name}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Street Address</label>
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="e.g. Flat 4B, House 12, Road 4, Banani, Dhaka"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Drop-off Instructions (Optional)</label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="e.g. Ring doorbell twice, keep food with security guard"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selection Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 text-slate-900 font-black text-base border-b border-slate-100 pb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>2. Payment Method</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* bKash / Nagad MFS */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('BKASH')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    paymentMethod === 'BKASH' || paymentMethod === 'NAGAD'
                      ? 'border-pink-500 bg-pink-50/50 shadow-md shadow-pink-500/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-pink-600 text-white flex items-center justify-center mb-2 font-black text-xs">
                    bK
                  </div>
                  <p className="text-xs font-black text-slate-900">bKash / Nagad</p>
                  <p className="text-[10px] text-slate-500">Instant Mobile Pay</p>
                </button>

                {/* Debit/Credit Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    paymentMethod === 'CARD'
                      ? 'border-brand-500 bg-brand-50/50 shadow-md shadow-brand-500/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-2">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-black text-slate-900">Credit / Debit</p>
                  <p className="text-[10px] text-slate-500">Visa, Master, Amex</p>
                </button>

                {/* Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-black text-slate-900">Cash On Delivery</p>
                  <p className="text-[10px] text-slate-500">Pay upon receipt</p>
                </button>
              </div>

              {/* MFS Simulation Box */}
              {(paymentMethod === 'BKASH' || paymentMethod === 'NAGAD') && (
                <div className="p-4 rounded-2xl bg-pink-50/80 border border-pink-200/80 space-y-3">
                  <div className="flex items-center justify-between text-xs text-pink-900 font-bold">
                    <span>bKash / Nagad Instant Checkout Gateway</span>
                    <Lock className="w-3.5 h-3.5 text-pink-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">MFS Mobile No.</label>
                      <input
                        type="text"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-pink-300 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">PIN / OTP Code</label>
                      <input
                        type="password"
                        value={mfsPin}
                        onChange={(e) => setMfsPin(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-pink-300 text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-pink-700">
                    ⚡ Simulating direct auto-verification via QuickBite payment processor.
                  </p>
                </div>
              )}

              {/* Card Simulation Box */}
              {paymentMethod === 'CARD' && (
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-lg">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold tracking-wider">QuickBite FastPay</span>
                    <span className="text-[10px] bg-brand-500 px-2 py-0.5 rounded font-black">TEST MODE</span>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-semibold">Expiry</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-semibold">CVC / CVV</label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'COD' && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>You can pay with cash directly to the delivery rider once your food arrives.</span>
                </div>
              )}
            </div>

          </div>

          {/* Right Summary Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xl space-y-5 sticky top-28">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
                Order Summary ({cart.length} items)
              </h3>

              <div className="space-y-3 divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                {cart.map(item => (
                  <div key={item.foodItem.id} className="pt-3 first:pt-0 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{item.foodItem.name}</p>
                      <p className="text-slate-400 font-medium">Qty: {item.quantity} × {formatPrice(item.foodItem.price)}</p>
                    </div>
                    <span className="font-bold text-slate-900">
                      {formatPrice(item.foodItem.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculations */}
              <div className="pt-3 border-t border-slate-200 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Express Delivery Fee</span>
                  <span className="font-semibold text-slate-900">{formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated VAT / Tax (5%)</span>
                  <span className="font-semibold text-slate-900">{formatPrice(tax)}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Total Payable Amount</p>
                    <p className="text-2xl font-black text-slate-900">{formatPrice(totalAmount)}</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-base rounded-2xl shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <span>Processing Order in Database...</span>
                ) : (
                  <>
                    <span>Place Order • {formatPrice(totalAmount)}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                100% Encrypted & Safe Food Ordering
              </p>
            </div>
          </div>

        </form>
      )}
    </div>
  );
}
