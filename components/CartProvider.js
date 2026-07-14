'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ab_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clean out any corrupted keys like "[object Object]" or NaN
        const clean = {};
        Object.entries(parsed).forEach(([k, v]) => {
          if (k !== '[object Object]' && k !== 'NaN' && !isNaN(Number(k))) {
            clean[k] = v;
          }
        });
        setCart(clean);
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem('ab_cart', JSON.stringify(cart));
  }, [cart, loaded]);

  const addToCart = useCallback((productId, qty = 1) => {
    const id = typeof productId === 'object' && productId !== null ? productId.id : productId;
    if (!id || id === '[object Object]') return;
    setCart(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + qty
    }));
  }, []);

  const updateQuantity = useCallback((productId, qty) => {
    const id = typeof productId === 'object' && productId !== null ? productId.id : productId;
    setCart(prev => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    const id = typeof productId === 'object' && productId !== null ? productId.id : productId;
    setCart(prev => {
      const next = { ...prev };
      delete next[id];
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
