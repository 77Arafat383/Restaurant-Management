'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Restaurant, Order, Feedback } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  ShieldCheck,
  Users,
  Store,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Star,
  RefreshCw,
  FileText,
  Search,
  Activity,
  Trash2
} from 'lucide-react';

export default function AdminConsolePage() {
  const { currentUser } = useAuth();
  const [activeSection, setActiveSection] = useState<'OVERVIEW' | 'USERS' | 'RESTAURANTS' | 'ORDERS' | 'FEEDBACK'>('OVERVIEW');

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRestaurants: 0,
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalGMV: 0,
    totalFeedbacks: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  // Search States
  const [searchTransactions, setSearchTransactions] = useState('');
  const [searchUsers, setSearchUsers] = useState('');
  const [searchRestaurants, setSearchRestaurants] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin');
      const data = await res.json();
      if (data.success) {
        setStats(data.data.stats);
        setUsers(data.data.users);
        setRestaurants(data.data.restaurants);
        setRecentOrders(data.data.recentOrders);
        setFeedbacks(data.data.feedbacks);
      }
    } catch (e) {
      console.error('Failed to load admin stats', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleApproval = (restId: string) => {
    setRestaurants(restaurants.map(r => (r.id === restId ? { ...r, isApproved: !r.isApproved } : r)));
  };

  const handleApproveUser = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, isApproved: true }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => (u.id === userId ? { ...u, isApproved: true } : u)));
        // Refresh KPI metrics count
        fetchAdminData();
      }
    } catch (e) {
      console.error('Failed to approve user', e);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user account? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/auth/users?id=${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        fetchAdminData();
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch (e) {
      console.error('Error deleting user:', e);
      alert('Failed to delete user');
    }
  };

  const handleDeleteRestaurant = async (restId: string) => {
    if (!confirm('Are you sure you want to delete this restaurant and all its menu items? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/restaurants?id=${restId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setRestaurants(prev => prev.filter(r => r.id !== restId));
        fetchAdminData();
      } else {
        alert(data.error || 'Failed to delete restaurant');
      }
    } catch (e) {
      console.error('Error deleting restaurant:', e);
      alert('Failed to delete restaurant');
    }
  };

  const handleDeleteFeedback = async (fbId: string) => {
    if (!confirm('Are you sure you want to delete this customer feedback? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/feedback?id=${fbId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setFeedbacks(prev => prev.filter(f => f.id !== fbId));
        fetchAdminData();
      } else {
        alert(data.error || 'Failed to delete feedback');
      }
    } catch (e) {
      console.error('Error deleting feedback:', e);
      alert('Failed to delete feedback');
    }
  };

  const filteredOrders = recentOrders.filter(o => {
    const query = searchTransactions.toLowerCase().trim();
    if (!query) return true;
    return (
      o.orderNumber.toLowerCase().includes(query) ||
      o.customerName.toLowerCase().includes(query) ||
      o.restaurantName.toLowerCase().includes(query)
    );
  });

  const filteredUsers = users.filter(u => {
    const query = searchUsers.toLowerCase().trim();
    if (!query) return true;
    return (
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.role.toLowerCase().includes(query)
    );
  });

  const filteredRestaurantsList = restaurants.filter(r => {
    const query = searchRestaurants.toLowerCase().trim();
    if (!query) return true;
    return (
      r.name.toLowerCase().includes(query) ||
      r.cuisine.toLowerCase().includes(query) ||
      r.address.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">

      {/* Admin Title Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-lg shadow-purple-500/30 shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                System Administration Console
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">QuickBite Control Center</h1>
            <p className="text-xs text-slate-400">Logged in as: {currentUser?.name || 'Administrator'} ({currentUser?.email || 'admin@quickbite.com'})</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminData}
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Gross Merchandise Value</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{formatPrice(stats.totalGMV)}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">↑ 18.4% from last week</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total System Orders</span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{stats.totalOrders} Orders</p>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">{stats.completedOrders} Delivered • {stats.activeOrders} Active</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Restaurants</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{stats.totalRestaurants} Kitchens</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">100% Operational</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Registered Users</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{stats.totalUsers} Accounts</p>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">Multi-role hierarchy</p>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'OVERVIEW', label: 'Recent Transactions' },
          { id: 'USERS', label: `User Directory (${users.length})` },
          { id: 'RESTAURANTS', label: `Restaurant Approvals (${restaurants.length})` },
          { id: 'FEEDBACK', label: `Customer Feedback (${feedbacks.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as typeof activeSection)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeSection === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: Transactions Overview */}
      {activeSection === 'OVERVIEW' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Recent Payment Transactions & Orders</h3>
              <p className="text-xs text-slate-500">Live order audit log from PostgreSQL</p>
            </div>

            <div className="relative w-full sm:w-72 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTransactions}
                onChange={(e) => setSearchTransactions(e.target.value)}
                placeholder="Search orders, customers, kitchens..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Restaurant</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4 pr-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredOrders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50/80">
                    <td className="p-4 pl-6 font-mono font-bold text-slate-900">#{o.orderNumber}</td>
                    <td className="p-4 font-bold">{o.customerName}</td>
                    <td className="p-4 text-brand-600">{o.restaurantName}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono font-bold">
                        {o.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full font-bold bg-brand-50 text-brand-700">
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 font-black text-slate-900">{formatPrice(o.totalAmount)}</td>
                    <td className="p-4 pr-6 text-slate-400">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}        {/* SECTION 2: User Directory */}
      {activeSection === 'USERS' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Platform Users & Roles</h3>
              <p className="text-xs text-slate-500">Access control according to system design specifications</p>
            </div>

            <div className="relative w-full sm:w-72 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchUsers}
                onChange={(e) => setSearchUsers(e.target.value)}
                placeholder="Search users by name, email, role..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="p-4 pl-6 font-bold text-slate-900">{u.name}</td>
                    <td className="p-4 font-mono text-slate-600">{u.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-700'
                            : u.role === 'RESTAURANT_MANAGER'
                              ? 'bg-amber-100 text-amber-700'
                              : u.role === 'DELIVERY_PERSON'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-emerald-100 text-emerald-700'
                          }`}
                      >
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">{u.phone || 'N/A'}</td>
                    <td className="p-4 text-center">
                      {u.isApproved === false ? (
                        <div className="flex items-center justify-center gap-2.5">
                          <span className="inline-flex items-center gap-1 text-amber-600 font-bold bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded text-[10px]">
                            Pending
                          </span>
                          <button
                            onClick={() => handleApproveUser(u.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm shadow-emerald-500/10"
                          >
                            Approve
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full animate-fadeIn">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                        </span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {currentUser?.id !== u.id && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}        {/* SECTION 3: Restaurant Approvals */}
      {activeSection === 'RESTAURANTS' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Partner Kitchen Verification</h3>
              <p className="text-xs text-slate-500">Approve or suspend merchant restaurant accounts</p>
            </div>

            <div className="relative w-full sm:w-72 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchRestaurants}
                onChange={(e) => setSearchRestaurants(e.target.value)}
                placeholder="Search restaurants by name, cuisine, address..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6">Restaurant</th>
                  <th className="p-4">Cuisine</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4 text-center">Approval Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredRestaurantsList.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/80">
                    <td className="p-4 pl-6">
                      <p className="font-bold text-slate-900">{r.name}</p>
                      <p className="text-[11px] text-slate-400">{r.address}</p>
                    </td>
                    <td className="p-4">{r.cuisine}</td>
                    <td className="p-4 font-bold text-amber-600">★ {r.rating} ({r.ratingCount})</td>
                    <td className="p-4">{r.phone}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleApproval(r.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${r.isApproved
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                      >
                        {r.isApproved ? 'Approved ✓' : 'Suspended ✗'}
                      </button>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => handleDeleteRestaurant(r.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete restaurant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: Feedback */}
      {activeSection === 'FEEDBACK' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900">Customer Reviews & Complaints Audit</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedbacks.map(fb => (
              <div key={fb.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 relative group">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">{fb.customerName}</span>
                  <div className="flex text-amber-500 mr-8">
                    {[...Array(fb.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 italic">&ldquo;{fb.comment}&rdquo;</p>
                <p className="text-[10px] text-brand-600 font-semibold">{fb.restaurantName} • {formatDate(fb.createdAt)}</p>

                <button
                  onClick={() => handleDeleteFeedback(fb.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                  title="Delete feedback"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
