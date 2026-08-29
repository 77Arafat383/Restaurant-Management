'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import {
  UtensilsCrossed,
  ShoppingBag,
  MapPin,
  Clock,
  User as UserIcon,
  Store,
  Bike,
  ShieldCheck,
  ChevronDown,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react';

export default function Navbar() {
  const { currentUser, logout, openAuthModal } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="sticky top-[37px] z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">

          {/* Logo & Location */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-500/30 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-slate-900 flex items-center">
                  Quick<span className="text-brand-500">Bite</span>
                </span>
                <span className="block text-[10px] font-semibold text-slate-400 -mt-1 tracking-wider uppercase">
                  Fast Feast Express
                </span>
              </div>
            </Link>


          </div>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center gap-3 text-xs font-bold">
            <Link href="/" className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-slate-700 transition-all">
              Restaurants
            </Link>

            <Link href="/about" className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-slate-700 transition-all">
              About Us
            </Link>

            <Link href="/contact" className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-slate-700 transition-all">
              Contact
            </Link>

            {currentUser && (
              <>
                <Link href="/orders" className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-slate-700 transition-all">
                  My Orders
                </Link>
                <Link href="/orders/order_1001" className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/50 transition-all flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Tracking
                </Link>
              </>
            )}

            {currentUser?.role === 'RESTAURANT_MANAGER' && (
              <Link href="/restaurant" className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/50 transition-all flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5" /> Kitchen Portal
              </Link>
            )}
            {currentUser?.role === 'DELIVERY_PERSON' && (
              <Link href="/delivery" className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/50 transition-all flex items-center gap-1.5">
                <Bike className="w-3.5 h-3.5" /> Rider Portal
              </Link>
            )}
            {currentUser?.role === 'ADMIN' && (
              <Link href="/admin" className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/50 transition-all flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Admin Console
              </Link>
            )}
          </nav>

          {/* Action Buttons: Cart & User Auth */}
          <div className="flex items-center gap-3">


            {/* Auth State: User Menu or Login/Register Card Buttons */}
            {currentUser ? (
              <div className="relative pl-2 border-l border-slate-200">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-100 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full ring-2 ring-brand-500/30 overflow-hidden bg-slate-100 flex items-center justify-center text-slate-600">
                    {currentUser.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="hidden xl:block text-left">
                    <p className="text-xs font-bold text-slate-800 leading-none">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">{currentUser.role.replace('_', ' ')}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {/* Dropdown menu */}
                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-40 animate-fade-in">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-brand-50 text-brand-600 rounded text-[10px] font-black uppercase">
                          {currentUser.role.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="py-1 text-xs text-slate-700 font-semibold">
                        <button
                          onClick={() => {
                            setIsCartOpen(true);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-50 hover:text-brand-600 transition-colors text-left font-semibold"
                        >
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="w-3.5 h-3.5 text-brand-500" />
                            <span>My Basket</span>
                          </div>
                          {totalItems > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-black">
                              {totalItems}
                            </span>
                          )}
                        </button>

                        <Link
                          href="/orders"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> My Orders
                        </Link>
                        {currentUser.role === 'RESTAURANT_MANAGER' && (
                          <Link
                            href="/restaurant"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-amber-600 transition-colors"
                          >
                            <Store className="w-3.5 h-3.5" /> Kitchen Portal
                          </Link>
                        )}
                        {currentUser.role === 'DELIVERY_PERSON' && (
                          <Link
                            href="/delivery"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-blue-600 transition-colors"
                          >
                            <Bike className="w-3.5 h-3.5" /> Rider Portal
                          </Link>
                        )}
                        {currentUser.role === 'ADMIN' && (
                          <Link
                            href="/admin"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-purple-600 transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" /> Admin Console
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setIsDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <button
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-brand-600 hover:bg-slate-50 transition-all border border-slate-200"
                >
                  <LogIn className="w-3.5 h-3.5 text-brand-500" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Register</span>
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
