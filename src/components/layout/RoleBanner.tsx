'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/types';
import Link from 'next/link';
import { User, Store, Bike, ShieldCheck, ArrowRight, LogIn } from 'lucide-react';

export default function RoleBanner() {
  const { currentUser, switchRole, openAuthModal } = useAuth();

  const roles: { role: UserRole; label: string; icon: React.ElementType; link: string; color: string }[] = [
    { role: 'CUSTOMER', label: 'Customer', icon: User, link: '/', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
    { role: 'RESTAURANT_MANAGER', label: 'Restaurant Manager', icon: Store, link: '/restaurant', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
    { role: 'DELIVERY_PERSON', label: 'Delivery Rider', icon: Bike, link: '/delivery', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
    { role: 'ADMIN', label: 'Admin (NSTU)', icon: ShieldCheck, link: '/admin', color: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
  ];

  return (
    <div className="bg-slate-900 text-slate-200 text-xs border-b border-slate-800 px-4 py-2 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-500 text-white uppercase tracking-wider">
            Demo Switcher
          </span>
          <span className="hidden sm:inline text-slate-400">
            {currentUser ? (
              <>Active: <strong className="text-white">{currentUser.name}</strong> ({currentUser.role.replace('_', ' ')})</>
            ) : (
              <span className="text-amber-400 font-medium">
                Guest Visitor (Browsing mode • Sign In or switch persona to order)
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {roles.map(r => {
            const Icon = r.icon;
            const isActive = currentUser?.role === r.role;
            return (
              <button
                key={r.role}
                onClick={() => switchRole(r.role)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${
                  isActive
                    ? 'bg-brand-500 border-brand-500 text-white font-medium shadow-sm shadow-brand-500/20'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600 hover:text-white'
                }`}
                title={`Switch active persona to ${r.label}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{r.label}</span>
                {isActive && (
                  <Link
                    href={r.link}
                    className="ml-1 pl-1 border-l border-white/30 text-[10px] underline flex items-center hover:text-brand-100"
                  >
                    Open View <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
                  </Link>
                )}
              </button>
            );
          })}

          {!currentUser && (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-[11px] ml-1"
            >
              <LogIn className="w-3 h-3" /> Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
