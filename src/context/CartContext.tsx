'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { FoodItem, CartItem } from '@/lib/types';

interface CartContextType {
  cart: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  deliveryFee: number;
  addToCart: (item: FoodItem, restaurantName: string, customNotes?: string) => boolean;
  removeFromCart: (foodItemId: string) => void;
  updateQuantity: (foodItemId: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  tax: number;
  totalAmount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [deliveryFee, setDeliveryFee] = useState<number>(40);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('quickbite_cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (parsed.items && Array.isArray(parsed.items)) {
          setCart(parsed.items);
          setRestaurantId(parsed.restaurantId || null);
          setRestaurantName(parsed.restaurantName || null);
          setDeliveryFee(parsed.deliveryFee || 40);
        }
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
  }, []);

  const saveCartToStorage = (
    items: CartItem[], 
    rId: string | null, 
    rName: string | null, 
    fee: number
  ) => {
    localStorage.setItem(
      'quickbite_cart',
      JSON.stringify({ items, restaurantId: rId, restaurantName: rName, deliveryFee: fee })
    );
  };

  const addToCart = (item: FoodItem, restName: string, customNotes?: string) => {
    // If cart has items from another restaurant, confirm reset
    if (cart.length > 0 && restaurantId && restaurantId !== item.restaurantId) {
      const confirmChange = window.confirm(
        `Your cart already contains items from "${restaurantName}". Would you like to clear your cart and add items from "${restName}" instead?`
      );
      if (!confirmChange) return false;

      const newItems: CartItem[] = [
        {
          foodItem: item,
          restaurantId: item.restaurantId,
          restaurantName: restName,
          quantity: 1,
          specialInstructions: customNotes,
        },
      ];
      setCart(newItems);
      setRestaurantId(item.restaurantId);
      setRestaurantName(restName);
      setDeliveryFee(40);
      saveCartToStorage(newItems, item.restaurantId, restName, 40);
      setIsCartOpen(true);
      return true;
    }

    const existingIndex = cart.findIndex(ci => ci.foodItem.id === item.id);
    let updatedCart: CartItem[] = [];

    if (existingIndex > -1) {
      updatedCart = cart.map((ci, idx) =>
        idx === existingIndex ? { ...ci, quantity: ci.quantity + 1 } : ci
      );
    } else {
      updatedCart = [
        ...cart,
        {
          foodItem: item,
          restaurantId: item.restaurantId,
          restaurantName: restName,
          quantity: 1,
          specialInstructions: customNotes,
        },
      ];
    }

    setCart(updatedCart);
    setRestaurantId(item.restaurantId);
    setRestaurantName(restName);
    saveCartToStorage(updatedCart, item.restaurantId, restName, deliveryFee);
    setIsCartOpen(true);
    return true;
  };

  const removeFromCart = (foodItemId: string) => {
    const updated = cart.filter(ci => ci.foodItem.id !== foodItemId);
    setCart(updated);
    if (updated.length === 0) {
      setRestaurantId(null);
      setRestaurantName(null);
      saveCartToStorage([], null, null, 40);
    } else {
      saveCartToStorage(updated, restaurantId, restaurantName, deliveryFee);
    }
  };

  const updateQuantity = (foodItemId: string, delta: number) => {
    const updated = cart
      .map(ci => {
        if (ci.foodItem.id === foodItemId) {
          const newQty = ci.quantity + delta;
          return newQty > 0 ? { ...ci, quantity: newQty } : null;
        }
        return ci;
      })
      .filter((ci): ci is CartItem => ci !== null);

    setCart(updated);
    if (updated.length === 0) {
      setRestaurantId(null);
      setRestaurantName(null);
      saveCartToStorage([], null, null, 40);
    } else {
      saveCartToStorage(updated, restaurantId, restaurantName, deliveryFee);
    }
  };

  const clearCart = () => {
    setCart([]);
    setRestaurantId(null);
    setRestaurantName(null);
    saveCartToStorage([], null, null, 40);
  };

  const totalItems = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const subtotal = cart.reduce((acc, curr) => acc + curr.foodItem.price * curr.quantity, 0);
  const tax = Math.round(subtotal * 0.05); // 5% VAT
  const totalAmount = totalItems > 0 ? subtotal + deliveryFee + tax : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        restaurantId,
        restaurantName,
        deliveryFee,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        tax,
        totalAmount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
