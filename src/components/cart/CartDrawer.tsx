'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Utensils } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CartDrawer() {
  const { currentUser, openAuthModal } = useAuth();
  const {
    cart,
    restaurantName,
    deliveryFee,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
    tax,
    totalAmount,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Your Basket</h2>
                <p className="text-xs text-slate-500">
                  {restaurantName ? `Ordering from ${restaurantName}` : 'No items yet'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Content */}
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 mb-4">
                <Utensils className="w-10 h-10" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-1">Your cart is empty</h3>
              <p className="text-sm text-slate-500 max-w-xs mb-6">
                Explore popular dishes from top restaurants and treat yourself today.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-full text-sm font-semibold shadow-md shadow-brand-500/25 transition-all"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-slate-100">
                {cart.map(item => (
                  <div key={item.foodItem.id} className="pt-4 first:pt-0 flex gap-3">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      {item.foodItem.image ? (
                        <Image
                          src={item.foodItem.image}
                          alt={item.foodItem.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                          <Utensils className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-sm text-slate-800 truncate pr-2">
                          {item.foodItem.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.foodItem.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs font-semibold text-brand-600 mt-0.5">
                        {formatPrice(item.foodItem.price)}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.foodItem.id, -1)}
                            className="p-1 px-2 text-slate-600 hover:bg-slate-200 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-700">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.foodItem.id, 1)}
                            className="p-1 px-2 text-slate-600 hover:bg-slate-200 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-slate-800">
                          {formatPrice(item.foodItem.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-3">
                  <button
                    onClick={clearCart}
                    className="text-xs text-red-500 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Clear Cart
                  </button>
                </div>
              </div>

              {/* Price Breakdown Footer */}
              <div className="p-5 border-t border-slate-100 bg-slate-50/80 space-y-2.5">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="font-medium text-slate-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-medium text-slate-900">{formatPrice(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Govt. VAT / Taxes (5%)</span>
                    <span className="font-medium text-slate-900">{formatPrice(tax)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Estimated Total</p>
                    <p className="text-xl font-black text-slate-900">{formatPrice(totalAmount)}</p>
                  </div>
                  {currentUser ? (
                    <Link
                      href="/checkout"
                      onClick={() => setIsCartOpen(false)}
                      className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/25 flex items-center gap-2 transition-all hover:translate-x-0.5"
                    >
                      Checkout <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        openAuthModal('login', 'Please sign in or create an account to proceed to checkout.');
                      }}
                      className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/25 flex items-center gap-2 transition-all hover:translate-x-0.5"
                    >
                      Sign In to Order <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
