'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { INITIAL_RESTAURANTS, INITIAL_FOOD_ITEMS, INITIAL_FEEDBACKS } from '@/lib/seed-data';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { 
  Star, 
  Clock, 
  Bike, 
  MapPin, 
  Phone, 
  Mail, 
  Search, 
  Plus, 
  Minus, 
  ArrowLeft, 
  CheckCircle2, 
  Leaf, 
  Flame, 
  ShieldCheck, 
  MessageSquare
} from 'lucide-react';

export default function RestaurantDetailPage() {
  const params = useParams();
  const restaurantId = params.id as string;
  const { addToCart, cart, updateQuantity } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [filterVegOnly, setFilterVegOnly] = useState(false);
  const [toastMessage, setToMessage] = useState<string | null>(null);

  const [restaurant, setRestaurant] = useState(
    INITIAL_RESTAURANTS.find(r => r.id === restaurantId) || INITIAL_RESTAURANTS[0]
  );
  const [allFoods, setAllFoods] = useState(
    INITIAL_FOOD_ITEMS.filter(f => f.restaurantId === (restaurantId || 'rest_1'))
  );
  const [feedbacks, setFeedbacks] = useState(
    INITIAL_FEEDBACKS.filter(f => f.restaurantId === (restaurantId || 'rest_1'))
  );

  React.useEffect(() => {
    if (restaurantId) {
      fetch(`/api/restaurants/${restaurantId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setRestaurant(data.data);
            if (Array.isArray(data.data.foodItems) && data.data.foodItems.length > 0) {
              setAllFoods(data.data.foodItems);
            }
          }
        })
        .catch(() => {});

      fetch(`/api/feedback?restaurantId=${restaurantId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            setFeedbacks(data.data);
          }
        })
        .catch(() => {});
    }
  }, [restaurantId]);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && allFoods.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const selectFood = urlParams.get('selectFood');
      if (selectFood) {
        const foundItem = allFoods.find(f => f.id === selectFood);
        if (foundItem) {
          // Reset filters that could hide the food item
          setSelectedCategory('ALL');
          setFilterVegOnly(false);

          // Allow the state update to render the food item first
          const timer = setTimeout(() => {
            const element = document.getElementById(`food-${selectFood}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              
              // Apply glowing border and scale animation
              element.classList.add(
                'ring-4', 
                'ring-brand-500/50', 
                'border-brand-500', 
                'bg-brand-50/50', 
                'scale-[1.02]'
              );
              
              // Clean up the classes after animation duration
              setTimeout(() => {
                element.classList.remove(
                  'ring-4', 
                  'ring-brand-500/50', 
                  'border-brand-500', 
                  'bg-brand-50/50', 
                  'scale-[1.02]'
                );
              }, 4000);
            }
          }, 300);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [allFoods]);

  // Extract unique categories
  const categories = ['ALL', ...Array.from(new Set(allFoods.flatMap(f => 
    f.category ? f.category.split(',').map(c => c.trim()) : []
  )))];

  // Filter foods
  const filteredFoods = allFoods.filter(food => {
    const matchSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        food.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === 'ALL' || 
      (food.category && food.category.split(',').map(c => c.trim().toLowerCase()).includes(selectedCategory.toLowerCase()));
    const matchVeg = filterVegOnly ? food.isVeg : true;
    return matchSearch && matchCat && matchVeg;
  });

  const handleAdd = (food: typeof allFoods[0]) => {
    const success = addToCart(food, restaurant.name);
    if (success) {
      setToMessage(`Added ${food.name} to basket`);
      setTimeout(() => setToMessage(null), 2500);
    }
  };

  const getItemQuantityInCart = (foodId: string) => {
    const found = cart.find(ci => ci.foodItem.id === foodId);
    return found ? found.quantity : 0;
  };

  return (
    <div className="pb-24">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slide-up">
          <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-white">{toastMessage}</p>
        </div>
      )}

      {/* Back Link & Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Restaurants
        </Link>
      </div>

      {/* Restaurant Hero Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-white">
          {/* Banner Image */}
          <div className="relative h-64 sm:h-80 w-full bg-slate-900">
            <Image
              src={restaurant.bannerImage}
              alt={restaurant.name}
              fill
              className="object-cover opacity-85"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-lg bg-brand-500 text-white text-xs font-black uppercase tracking-wider mb-2">
                  {restaurant.cuisine}
                </span>
                <h1 className="text-2xl sm:text-4xl font-black">{restaurant.name}</h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1 leading-relaxed">
                  {restaurant.description}
                </p>
              </div>

              <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md p-3 rounded-2xl border border-white/10 shrink-0">
                <div className="text-center px-3 border-r border-white/20">
                  <div className="flex items-center justify-center gap-1 text-amber-400 font-extrabold text-base">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{restaurant.rating}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{restaurant.ratingCount}+ reviews</p>
                </div>
                <div className="text-center px-3 border-r border-white/20">
                  <div className="flex items-center justify-center gap-1 text-white font-extrabold text-base">
                    <Clock className="w-4 h-4 text-brand-400" />
                    <span>{restaurant.deliveryTime}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Delivery Time</p>
                </div>
                <div className="text-center px-3">
                  <div className="flex items-center justify-center gap-1 text-emerald-400 font-extrabold text-base">
                    <Bike className="w-4 h-4" />
                    <span>{formatPrice(restaurant.deliveryFee)}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Fee</p>
                </div>
              </div>
            </div>
          </div>

          {/* Restaurant details bar */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 font-semibold">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-500" />
              <span>{restaurant.address}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{restaurant.phone}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{restaurant.email}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Navigation & Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'All Items' : cat}
              </button>
            ))}
          </div>

          {/* Filters & Search */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setFilterVegOnly(!filterVegOnly)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                filterVegOnly
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <Leaf className={`w-3.5 h-3.5 ${filterVegOnly ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Veg Only</span>
            </button>

            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in menu..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-900">
              {selectedCategory === 'ALL' ? 'Full Menu' : selectedCategory} ({filteredFoods.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredFoods.map(food => {
              const qtyInCart = getItemQuantityInCart(food.id);
              return (
                <div
                  key={food.id}
                  id={`food-${food.id}`}
                  className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-500 flex gap-4"
                >
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {food.isVeg ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            <Leaf className="w-2.5 h-2.5" /> Veg
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                            Non-Veg
                          </span>
                        )}
                        {food.isSpicy && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded">
                            <Flame className="w-2.5 h-2.5" /> Spicy
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900">{food.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {food.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-black text-slate-900">
                        {formatPrice(food.price)}
                      </span>

                      {qtyInCart > 0 ? (
                        <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-xl p-1">
                          <button
                            onClick={() => updateQuantity(food.id, -1)}
                            className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-brand-700 hover:bg-brand-500 hover:text-white transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-black text-brand-900 px-2">{qtyInCart}</span>
                          <button
                            onClick={() => updateQuantity(food.id, 1)}
                            className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-brand-700 hover:bg-brand-500 hover:text-white transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAdd(food)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all hover:scale-105 active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Basket</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                    <Image
                      src={food.image}
                      alt={food.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer Reviews Section for this Restaurant */}
        {feedbacks.length > 0 && (
          <div className="mt-16 pt-10 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-brand-500" />
              <h3 className="text-xl font-black text-slate-900">Customer Reviews & Ratings</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedbacks.map(fb => (
                <div key={fb.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100">
                        {fb.customerAvatar && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={fb.customerAvatar} alt={fb.customerName} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-900">{fb.customerName}</span>
                    </div>
                    <div className="flex text-amber-500">
                      {[...Array(fb.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 italic">&ldquo;{fb.comment}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
