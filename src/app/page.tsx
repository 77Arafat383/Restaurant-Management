'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { FoodItem, Restaurant } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import {
  Search,
  Star,
  Clock,
  Bike,
  Flame,
  Sparkles,
  Plus,
  ArrowRight,
  CheckCircle2,
  Leaf,
  ShieldCheck,
  TrendingUp,
  Award,
  Store,
  UtensilsCrossed
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', name: 'All Dishes', icon: '🍽️' },
  { id: 'biryani', name: 'Biryani & Mughal', icon: '🍚' },
  { id: 'burgers', name: 'Smash Burgers', icon: '🍔' },
  { id: 'pizza', name: 'Artisan Pizzas', icon: '🍕' },
  { id: 'asian', name: 'Ramen & Sushi', icon: '🍜' },
  { id: 'dessert', name: 'Desserts & Cafe', icon: '🍰' },
];

const HERO_OFFERS = [
  {
    id: 1,
    title: "50% OFF Biryani Shahi",
    description: "Get authentic Kacchi Biryani delivered warm and fresh.",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80",
    badge: "Limited Deal 🔥",
    coupon: "SHAHI50",
    link: "/restaurants/rest_1?selectFood=food_101",
  },
  {
    id: 2,
    title: "Buy 1 Get 1 Burger Lab",
    description: "Double patty smash burgers with melted cheddar.",
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=80",
    badge: "BOGO Special 🍔",
    coupon: "SMASHBOGO",
    link: "/restaurants/rest_2",
  },
  {
    id: 3,
    title: "Free Delivery on Pizzas",
    description: "Woodfired Napoletana pizzas direct to your doorstep.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
    badge: "Free Delivery 🍕",
    coupon: "PIZZAFREE",
    link: "/restaurants/rest_3",
  },
  {
    id: 4,
    title: "25% OFF Sweet Cafe",
    description: "Indulge in artisanal chocolate cakes and fresh coffees.",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80",
    badge: "Cafe Delight 🍰",
    coupon: "SWEET25",
    link: "/restaurants/rest_5",
  }
];

export default function HomePage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [vegOnly, setVegOnly] = useState(false);
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);

  React.useEffect(() => {
    fetch('/api/restaurants')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setRestaurants(data.data);
        }
      })
      .catch(() => { });

    fetch('/api/foods')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setFoods(data.data);
        }
      })
      .catch(() => { });
  }, []);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentOfferIndex((prevIndex) => (prevIndex + 1) % HERO_OFFERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Filter matching restaurants for the dropdown suggestions
  const suggestedRestaurantsAll = searchTerm.trim() ? restaurants.filter(r => {
    const matchQuery = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(searchTerm.toLowerCase());
    const matchVeg = vegOnly ? foods.some(f => f.restaurantId === r.id && f.isVeg) : true;
    return matchQuery && matchVeg;
  }) : [];

  // Filter matching dishes for the dropdown suggestions
  const suggestedFoodsAll = searchTerm.trim() ? foods.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchVeg = vegOnly ? f.isVeg : true;
    return matchSearch && matchVeg;
  }) : [];

  // Limit suggestions total to at most 5 items
  const suggestedRestaurants = suggestedRestaurantsAll.slice(0, 5);
  const suggestedFoods = suggestedFoodsAll.slice(0, 5 - suggestedRestaurants.length);

  const hasSuggestions = suggestedRestaurants.length > 0 || suggestedFoods.length > 0;

  // Filter Restaurants
  const filteredRestaurants = restaurants.filter(r => {
    const matchQuery = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(searchTerm.toLowerCase());
    const matchVeg = vegOnly ? foods.some(f => f.restaurantId === r.id && f.isVeg) : true;
    
    let matchCat = true;
    if (selectedCategory !== 'all') {
      matchCat = foods.some(f => {
        if (f.restaurantId !== r.id) return false;
        let foodMatchesCategory = false;
        if (selectedCategory === 'biryani') foodMatchesCategory = f.category.toLowerCase().includes('biryani') || f.restaurantId === 'rest_1';
        if (selectedCategory === 'burgers') foodMatchesCategory = f.category.toLowerCase().includes('burger') || f.restaurantId === 'rest_2';
        if (selectedCategory === 'pizza') foodMatchesCategory = f.category.toLowerCase().includes('pizza') || f.category.toLowerCase().includes('pasta') || f.restaurantId === 'rest_3';
        if (selectedCategory === 'asian') foodMatchesCategory = f.category.toLowerCase().includes('ramen') || f.category.toLowerCase().includes('sushi') || f.restaurantId === 'rest_4';
        if (selectedCategory === 'dessert') foodMatchesCategory = f.category.toLowerCase().includes('dessert') || f.category.toLowerCase().includes('beverage') || f.restaurantId === 'rest_5';
        return foodMatchesCategory;
      });
    }
    
    return matchQuery && matchVeg && matchCat;
  });

  // Filter Food Items
  const filteredFoods = foods.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchVeg = vegOnly ? f.isVeg : true;
    let matchCat = true;
    if (selectedCategory === 'biryani') matchCat = f.category.toLowerCase().includes('biryani') || f.restaurantId === 'rest_1';
    if (selectedCategory === 'burgers') matchCat = f.category.toLowerCase().includes('burger') || f.restaurantId === 'rest_2';
    if (selectedCategory === 'pizza') matchCat = f.category.toLowerCase().includes('pizza') || f.category.toLowerCase().includes('pasta') || f.restaurantId === 'rest_3';
    if (selectedCategory === 'asian') matchCat = f.category.toLowerCase().includes('ramen') || f.category.toLowerCase().includes('sushi') || f.restaurantId === 'rest_4';
    if (selectedCategory === 'dessert') matchCat = f.category.toLowerCase().includes('dessert') || f.category.toLowerCase().includes('beverage') || f.restaurantId === 'rest_5';

    return matchSearch && matchVeg && matchCat;
  });

  const handleQuickAdd = (food: typeof foods[0]) => {
    const rest = restaurants.find(r => r.id === food.restaurantId);
    const added = addToCart(food, rest ? rest.name : 'QuickBite Partner');
    if (added) {
      setAddedItemNotice(food.name);
      setTimeout(() => setAddedItemNotice(null), 2500);
    }
  };

  return (
    <div className="space-y-16 pb-20">

      {/* Toast Notice */}
      {addedItemNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slide-up">
          <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-400">Added to Basket</p>
            <p className="text-sm font-bold truncate max-w-[200px]">{addedItemNotice}</p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-brand-50/80 via-white to-slate-50 pt-10 pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-brand-700 text-xs font-bold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-brand-500 animate-spin" />
                <span>QuickBite Express • 20-35 min Guaranteed Delivery</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Crave it? <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-coral-500 to-amber-500">Tap it.</span> We Deliver it Hot & Fast.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl font-normal leading-relaxed">
                Order sizzling biryani, gourmet smash burgers, artisan pizzas, and handcrafted ramen from the finest certified kitchens in town.
              </p>

              {/* Search Bar Container */}
              <div ref={searchContainerRef} className="relative max-w-2xl w-full z-50">
                <div className="bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex items-center px-3 gap-3">
                    <Search className="w-5 h-5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setShowDropdown(false);
                        }
                      }}
                      placeholder="Search restaurant or dish (e.g. Kacchi, Smash Burger, Pizza)..."
                      className="w-full bg-transparent text-sm focus:outline-none text-slate-800 placeholder-slate-400 font-medium py-2"
                    />
                  </div>
                  <button 
                    onClick={() => {
                      if (suggestedRestaurants.length > 0) {
                        router.push(`/restaurants/${suggestedRestaurants[0].id}`);
                        setShowDropdown(false);
                      } else if (suggestedFoods.length > 0) {
                        router.push(`/restaurants/${suggestedFoods[0].restaurantId}?selectFood=${suggestedFoods[0].id}`);
                        setShowDropdown(false);
                      } else {
                        const element = document.getElementById('explore-cuisines');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }
                    }}
                    className="px-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 shrink-0"
                  >
                    Find Food <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Autocomplete Dropdown */}
                {showDropdown && searchTerm.trim().length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-slide-up-short z-[999]">
                    {hasSuggestions ? (
                      <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50 no-scrollbar">
                        {/* Restaurants Section */}
                        {suggestedRestaurants.length > 0 && (
                          <div className="p-3">
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center gap-1.5">
                              <Store className="w-3.5 h-3.5" /> Restaurants
                            </h5>
                            <div className="space-y-1">
                              {suggestedRestaurants.map(rest => (
                                <button
                                  key={rest.id}
                                  onClick={() => {
                                    router.push(`/restaurants/${rest.id}`);
                                    setShowDropdown(false);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-slate-50 active:bg-slate-100 rounded-xl flex items-center justify-between transition-colors group"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                      <Image
                                        src={rest.bannerImage}
                                        alt={rest.name}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-slate-800 group-hover:text-brand-500 transition-colors">
                                        {rest.name}
                                      </p>
                                      <p className="text-xs text-slate-400 font-medium">
                                        {rest.cuisine}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-right">
                                    <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg">
                                      <Star className="w-3 h-3 fill-amber-500" />
                                      <span>{rest.rating}</span>
                                    </span>
                                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg">
                                      {rest.deliveryTime}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Dishes Section */}
                        {suggestedFoods.length > 0 && (
                          <div className="p-3">
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center gap-1.5">
                              <UtensilsCrossed className="w-3.5 h-3.5" /> Dishes
                            </h5>
                            <div className="space-y-1">
                              {suggestedFoods.map(food => {
                                const rest = restaurants.find(r => r.id === food.restaurantId);
                                return (
                                  <button
                                    key={food.id}
                                    onClick={() => {
                                      router.push(`/restaurants/${food.restaurantId}?selectFood=${food.id}`);
                                      setShowDropdown(false);
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-slate-50 active:bg-slate-100 rounded-xl flex items-center justify-between transition-colors group"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                        <Image
                                          src={food.image}
                                          alt={food.name}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold text-slate-800 group-hover:text-brand-500 transition-colors">
                                          {food.name}
                                        </p>
                                        <p className="text-xs text-slate-400 font-medium truncate max-w-[280px]">
                                          from <span className="font-semibold text-slate-500">{rest?.name || 'Partner Kitchen'}</span>
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-black text-slate-900">
                                        {formatPrice(food.price)}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                          <Search className="w-5 h-5 text-slate-400" />
                        </div>
                        <p className="text-sm font-bold text-slate-700">No matches found</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                          We couldn&apos;t find any restaurant or dish matching &ldquo;{searchTerm}&rdquo;. Try another keyword!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-6 pt-2 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>500+ Verified Dishes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>4.8/5 Avg Rating</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Live GPS Tracking</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual (Animated circular carousel - Horizontal Slider) */}
            <div className="lg:col-span-5 relative group">
              <div className="relative mx-auto max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl ring-8 ring-white bg-slate-900">
                {/* Horizontal slider wrapper */}
                <div 
                  className="flex w-full h-full transition-transform duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
                  style={{ transform: `translateX(-${currentOfferIndex * 100}%)` }}
                >
                  {HERO_OFFERS.map((offer, index) => {
                    const isActive = index === currentOfferIndex;
                    return (
                      <div key={offer.id} className="relative w-full h-full flex-shrink-0">
                        <Image
                          src={offer.image}
                          alt={offer.title}
                          fill
                          className={`object-cover transition-transform duration-[4500ms] ease-out ${
                            isActive ? 'scale-105' : 'scale-100'
                          }`}
                          priority={index === 0}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                      </div>
                    );
                  })}
                </div>

                {/* Floating active offer badge (Top Right) */}
                <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-100 animate-bounce">
                  <Flame className="w-5 h-5 text-coral-500 fill-coral-500" />
                  <div>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Featured Deal</p>
                    <p className="text-xs font-extrabold text-slate-900">{HERO_OFFERS[currentOfferIndex].badge}</p>
                  </div>
                </div>

                {/* Active Offer Promo Banner (Bottom Overlay) */}
                <div className="absolute bottom-4 left-4 right-4 z-20 bg-slate-950/90 backdrop-blur-md p-4 rounded-2xl text-white border border-slate-800 transition-all duration-500">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1 overflow-hidden">
                      <div className="inline-block px-2 py-0.5 rounded bg-brand-500 text-[10px] font-black uppercase tracking-wider">
                        Use Code: {HERO_OFFERS[currentOfferIndex].coupon}
                      </div>
                      <h4 className="text-sm font-bold text-white leading-tight truncate">
                        {HERO_OFFERS[currentOfferIndex].title}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-snug truncate">
                        {HERO_OFFERS[currentOfferIndex].description}
                      </p>
                    </div>
                    <Link
                      href={HERO_OFFERS[currentOfferIndex].link}
                      className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0 hover:scale-105 active:scale-95 flex items-center gap-1"
                    >
                      Claim <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Bullet Slide Indicators */}
                <div className="absolute top-1/2 -translate-y-1/2 left-4 z-20 flex flex-col gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                  {HERO_OFFERS.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentOfferIndex(index)}
                      className={`w-2 transition-all duration-300 rounded-full ${
                        index === currentOfferIndex 
                          ? 'h-6 bg-brand-500' 
                          : 'h-2 bg-white/60 hover:bg-white'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Category Pills & Filters */}
      <section id="explore-cuisines" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Explore Cuisines & Menus</h2>
            <p className="text-xs text-slate-500 font-medium">Select a category or filter by dietary preference</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${vegOnly
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
            >
              <Leaf className={`w-3.5 h-3.5 ${vegOnly ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Pure Veg Only</span>
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-3 overflow-x-auto py-4 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat.id
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25 scale-[1.02]'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 shadow-sm'
                }`}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Restaurants Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h2 className="text-2xl font-black text-slate-900">Featured Partner Restaurants</h2>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Top-rated kitchens verified by QuickBite Quality Team</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map(rest => (
            <Link
              key={rest.id}
              href={`/restaurants/${rest.id}`}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-brand-300 transition-all duration-300 flex flex-col"
            >
              {/* Banner image */}
              <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                <Image
                  src={rest.bannerImage}
                  alt={rest.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Rating badge */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1 text-xs font-extrabold text-slate-900">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{rest.rating}</span>
                  <span className="text-slate-400 text-[10px]">({rest.ratingCount})</span>
                </div>

                {/* Cuisine badge */}
                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-lg">
                  {rest.cuisine}
                </div>
              </div>

              {/* Card body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {rest.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                    {rest.description}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-semibold">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-brand-500" />
                    <span>{rest.deliveryTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Bike className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{formatPrice(rest.deliveryFee)} Delivery</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Food Items Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-500" />
              <h2 className="text-2xl font-black text-slate-900">Trending Dishes Near You</h2>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Hand-picked bestsellers ready for express delivery</p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            Showing {filteredFoods.length} dishes
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredFoods.map(food => {
            const rest = restaurants.find(r => r.id === food.restaurantId);
            return (
              <div
                key={food.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <Image
                      src={food.image}
                      alt={food.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                      {food.isVeg && (
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                          Veg
                        </span>
                      )}
                      {food.isSpicy && (
                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                          Spicy 🌶️
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-[11px] font-semibold text-brand-600 uppercase tracking-wide truncate">
                      {rest?.name || 'Top Kitchen'}
                    </p>
                    <h4 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1 group-hover:text-brand-600 transition-colors">
                      {food.name}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                      {food.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Price</p>
                      <p className="text-base font-black text-slate-900">{formatPrice(food.price)}</p>
                    </div>

                    <button
                      onClick={() => handleQuickAdd(food)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all hover:scale-105 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>



    </div>
  );
}
