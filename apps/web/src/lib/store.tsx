'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1');

export interface CartItem {
  offerId: string;
  title: string;
  sellerName: string;
  priceMinor: number;
  quantity: number;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  fullName: string;
}

interface StoreContextType {
  user: AuthUser | null;
  token: string | null;
  cart: CartItem[];
  loginUser: (user: AuthUser, token: string) => void;
  logoutUser: () => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (offerId: string) => void;
  clearCart: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('mstore_user');
    const savedToken = localStorage.getItem('mstore_token');
    const savedCart = localStorage.getItem('mstore_cart');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const loginUser = (newUser: AuthUser, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('mstore_user', JSON.stringify(newUser));
    localStorage.setItem('mstore_token', newToken);
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('mstore_user');
    localStorage.removeItem('mstore_token');
  };

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.offerId === item.offerId);
      const updated = existing
        ? prev.map((i) =>
            i.offerId === item.offerId ? { ...i, quantity: i.quantity + item.quantity } : i,
          )
        : [...prev, item];
      localStorage.setItem('mstore_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCart = (offerId: string) => {
    setCart((prev) => {
      const updated = prev.filter((i) => i.offerId !== offerId);
      localStorage.setItem('mstore_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('mstore_cart');
  };

  return (
    <StoreContext.Provider
      value={{ user, token, cart, loginUser, logoutUser, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

export function formatPkr(minorUnits: number): string {
  return `Rs. ${(minorUnits / 100).toLocaleString('en-PK')}`;
}
