'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FoodItem, Order, OrderStatus } from '@/lib/types';
import { INITIAL_RESTAURANTS, INITIAL_FOOD_ITEMS } from '@/lib/seed-data';
import { formatPrice, formatDate } from '@/lib/utils';
import { 
  Store, 
  ChefHat, 
  UtensilsCrossed, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Edit3, 
  Trash2, 
  Flame, 
  Leaf, 
  TrendingUp, 
  DollarSign, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import Image from 'next/image';

export default function RestaurantManagerPortal() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'MENU' | 'ANALYTICS'>('ORDERS');
  
  // Menu items state
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // New Item Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('350');
  const [newItemCategory, setNewItemCategory] = useState('Special Combos');
  const [newItemVeg, setNewItemVeg] = useState(false);
  const [newItemSpicy, setNewItemSpicy] = useState(false);
  const [newItemImage, setNewItemImage] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80');

  const restaurantId = currentUser?.restaurantId || 'rest_1';
  const restaurant = INITIAL_RESTAURANTS.find(r => r.id === restaurantId) || INITIAL_RESTAURANTS[0];

  const loadData = async () => {
    try {
      setLoading(true);
      const [foodsRes, ordersRes] = await Promise.all([
        fetch(`/api/foods?restaurantId=${restaurantId}`),
        fetch(`/api/orders?restaurantId=${restaurantId}`),
      ]);
      const foodsData = await foodsRes.json();
      const ordersData = await ordersRes.json();

      if (foodsData.success) setFoodItems(foodsData.data);
      if (ordersData.success) setOrders(ordersData.data);
    } catch (e) {
      console.error('Failed to load restaurant data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [restaurantId]);

  // Update order status action
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.map(o => (o.id === orderId ? data.data : o)));
      }
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  // Toggle food availability
  const handleToggleAvailability = async (item: FoodItem) => {
    try {
      const res = await fetch('/api/foods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, isAvailable: !item.isAvailable }),
      });
      const data = await res.json();
      if (data.success) {
        setFoodItems(foodItems.map(f => (f.id === item.id ? data.data : f)));
      }
    } catch (e) {
      console.error('Failed to toggle availability', e);
    }
  };

  // Delete food item
  const handleDeleteFood = async (id: string) => {
    if (!confirm('Are you sure you want to remove this dish from the menu?')) return;
    try {
      const res = await fetch(`/api/foods?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setFoodItems(foodItems.filter(f => f.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete item', e);
    }
  };

  // Create new food item
  const handleCreateFood = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          name: newItemName,
          description: newItemDesc,
          price: parseFloat(newItemPrice),
          category: newItemCategory,
          isVeg: newItemVeg,
          isSpicy: newItemSpicy,
          image: newItemImage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFoodItems([...foodItems, data.data]);
        setIsModalOpen(false);
        setNewItemName('');
        setNewItemDesc('');
      }
    } catch (e) {
      console.error('Failed to add dish', e);
    }
  };

  const totalRevenue = orders
    .filter(o => o.status !== 'CANCELLED' && o.status !== 'REJECTED')
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  const activeOrdersCount = orders.filter(o => !['DELIVERED', 'CANCELLED', 'REJECTED'].includes(o.status)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      
      {/* Restaurant Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-lg shadow-amber-500/20 shrink-0">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Kitchen Manager Portal
              </span>
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Live Orders Connected
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">{restaurant.name}</h1>
            <p className="text-xs text-slate-500">{restaurant.address} • Manager: {currentUser.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" /> Add New Dish
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Active Kitchen Tickets</p>
            <p className="text-2xl font-black text-slate-900">{activeOrdersCount} Pending</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Total Revenue (Gross)</p>
            <p className="text-2xl font-black text-emerald-600">{formatPrice(totalRevenue)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Active Menu Dishes</p>
            <p className="text-2xl font-black text-purple-600">{foodItems.length} Items</p>
          </div>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('ORDERS')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ORDERS'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Live Orders Board ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('MENU')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'MENU'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Menu Management ({foodItems.length})
        </button>
      </div>

      {/* TAB 1: Live Orders Management Board */}
      {activeTab === 'ORDERS' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
              <p className="text-sm font-bold text-slate-600">No incoming orders at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orders.map(order => (
                <div
                  key={order.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg">
                          #{order.orderNumber}
                        </span>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          Customer: <strong className="text-slate-800">{order.customerName}</strong> ({order.customerPhone})
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-brand-50 text-brand-700 border border-brand-200">
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="py-3 space-y-2 text-xs">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between items-center">
                          <span className="font-semibold text-slate-800">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="font-mono text-slate-600">{formatPrice(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <p className="text-[11px] bg-amber-50 text-amber-800 p-2.5 rounded-xl border border-amber-200">
                        <strong>Kitchen Note:</strong> {order.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions according to proposal state diagram */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-black text-slate-900">
                      Total: {formatPrice(order.totalAmount)}
                    </span>

                    <div className="flex items-center gap-2">
                      {order.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'ACCEPTED')}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Accept Order
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'REJECTED')}
                            className="px-3.5 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}

                      {order.status === 'ACCEPTED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING')}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1"
                        >
                          <UtensilsCrossed className="w-3.5 h-3.5" /> Start Cooking
                        </button>
                      )}

                      {order.status === 'PREPARING' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'OUT_FOR_DELIVERY')}
                          className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready & Handover to Rider
                        </button>
                      )}

                      {order.status === 'OUT_FOR_DELIVERY' && (
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                          🛵 Rider in transit
                        </span>
                      )}

                      {order.status === 'DELIVERED' && (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                          ✓ Fulfilled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Menu Management (CRUD) */}
      {activeTab === 'MENU' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foodItems.map(food => (
              <div
                key={food.id}
                className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-40 w-full rounded-2xl overflow-hidden mb-3 bg-slate-100">
                    <Image src={food.image} alt={food.name} fill className="object-cover" />
                    <div className="absolute top-2 right-2">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          food.isAvailable ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                        }`}
                      >
                        {food.isAvailable ? 'In Stock' : 'Sold Out'}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">
                    {food.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">{food.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{food.description}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-base font-black text-slate-900">{formatPrice(food.price)}</span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleAvailability(food)}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700"
                    >
                      {food.isAvailable ? 'Mark Sold Out' : 'Mark Available'}
                    </button>
                    <button
                      onClick={() => handleDeleteFood(food.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete dish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Dish Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">Add New Dish to Menu</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFood} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  placeholder="e.g. Garlic Butter Naan with Paneer Butter Masala"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (BDT)</label>
                  <input
                    type="number"
                    required
                    value={newItemPrice}
                    onChange={e => setNewItemPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={newItemCategory}
                    onChange={e => setNewItemCategory(e.target.value)}
                    placeholder="e.g. Biryani Specials"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newItemDesc}
                  onChange={e => setNewItemDesc(e.target.value)}
                  placeholder="Appetizing description of ingredients, marinade, and spices..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Photo Image URL</label>
                <input
                  type="url"
                  value={newItemImage}
                  onChange={e => setNewItemImage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newItemVeg}
                    onChange={e => setNewItemVeg(e.target.checked)}
                    className="rounded text-brand-500"
                  />
                  <span>Vegetarian Dish</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newItemSpicy}
                    onChange={e => setNewItemSpicy(e.target.checked)}
                    className="rounded text-brand-500"
                  />
                  <span>Spicy Flavor</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20"
                >
                  Save Dish to Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
