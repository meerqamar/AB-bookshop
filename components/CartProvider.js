'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ab_cart');
      if (saved) setCart(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem('ab_cart', JSON.stringify(cart));
  }, [cart, loaded]);

  const addToCart = useCallback((productId, qty = 1) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + qty
    }));
  }, []);

  const updateQuantity = useCallback((productId, qty) => {
    setCart(prev => {
      const next = { ...prev };
      if (qty <= 0) delete next[productId];
      else next[productId] = qty;
      return next;
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart(prev => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  }, []);

  const clearCart = useCallback(() => setCart({}), []);

  const cartCount = Object.values(cart).reduce((sum, q) => sum + q, 0);
  const cartItems = cart;

  return (
    <CartContext.Provider value={{
      cartItems, cartCount, addToCart, updateQuantity, removeFromCart, clearCart, loaded
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
