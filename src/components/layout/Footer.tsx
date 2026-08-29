import React from 'react';
import Link from 'next/link';
import { UtensilsCrossed, Heart, Shield, Award, Sparkles, Database, Server, Smartphone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 text-sm border-t border-slate-800">
      {/* Top Value Banner */}
      <div className="border-b border-slate-800/80 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Super Fast Delivery</h4>
              <p className="text-xs text-slate-400">Average 25-35 mins delivery in Dhaka</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Secure Transactions</h4>
              <p className="text-xs text-slate-400">Encrypted bKash, Nagad & Card payments</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">PostgreSQL Backed</h4>
              <p className="text-xs text-slate-400">ACID compliant & optimized indexing</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Vercel Edge Ready</h4>
              <p className="text-xs text-slate-400">Ultra-low latency serverless architecture</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white">Quick<span className="text-brand-500">Bite</span></span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              A modern, hyper-fast online food ordering and delivery system engineered for high availability, real-time tracking, and multi-tenant management.
            </p>
            <div className="pt-2 text-xs text-slate-400">
              <p className="font-semibold text-slate-300">Software Engineering Lab Project</p>
              <p>Course: CSTE3310 | NSTU</p>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/" className="hover:text-white transition-colors">Browse Restaurants</Link></li>
              <li><Link href="/orders" className="hover:text-white transition-colors">Order History</Link></li>
              <li><Link href="/orders/order_1001" className="hover:text-white transition-colors">Live Tracking Simulator</Link></li>
              <li><Link href="/checkout" className="hover:text-white transition-colors">My Basket & Checkout</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Portals</h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/restaurant" className="hover:text-white transition-colors">Restaurant Manager Dashboard</Link></li>
              <li><Link href="/delivery" className="hover:text-white transition-colors">Delivery Rider Portal</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">System Admin Console</Link></li>
              <li><span className="text-slate-400">PostgreSQL + Prisma Studio Ready</span></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Project Authors</h3>
            <p className="text-xs text-slate-300 font-semibold mb-1">Supervised by:</p>
            <p className="text-xs text-slate-400 mb-3">Dr. Nazia Majadi (Professor, Dept. of CSTE, NSTU)</p>
            <p className="text-xs text-slate-300 font-semibold mb-1">Submitted by:</p>
            <p className="text-xs text-slate-400">Maknoon Sultana (NFH2201007F)</p>
            <p className="text-xs text-slate-400">Umme Nur Sadia (BKH2201020F)</p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 QuickBite Food Express. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            Built with Next.js, TypeScript, Tailwind & PostgreSQL
          </div>
        </div>
      </div>
    </footer>
  );
}
