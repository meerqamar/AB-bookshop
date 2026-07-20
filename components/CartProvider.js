'use client';
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

const CartContext = createContext();

const GUEST_KEY = 'ab_cart_guest';
const LEGACY_KEY = 'ab_cart';
const FROM_KEY = 'ab_cart_from';

function userKey(userId) {
  return `ab_cart_u_${userId}`;
}

function readCart(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const clean = {};
    Object.entries(parsed).forEach(([k, v]) => {
      if (k !== '[object Object]' && k !== 'NaN' && !isNaN(Number(k))) {
        const qty = Number(v);
        if (qty > 0) clean[k] = qty;
      }
    });
    return clean;
  } catch {
    return {};
  }
}

function writeCart(storageKey, cart) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(cart || {}));
  } catch {
    // ignore quota / private mode
  }
}

function migrateLegacyCart() {
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (!legacy) return;
    if (!localStorage.getItem(GUEST_KEY)) {
      localStorage.setItem(GUEST_KEY, legacy);
    }
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    // ignore
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState({});
  const [loaded, setLoaded] = useState(false);
  const ownerRef = useRef('guest'); // 'guest' | userId
  const cartRef = useRef({});
  const skipNextPersist = useRef(false);

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  const persistOwnerCart = useCallback((ownerId, nextCart) => {
    const key = ownerId === 'guest' ? GUEST_KEY : userKey(ownerId);
    writeCart(key, nextCart);
  }, []);

  const loadOwnerCart = useCallback((ownerId) => {
    const key = ownerId === 'guest' ? GUEST_KEY : userKey(ownerId);
    return readCart(key);
  }, []);

  const switchOwner = useCallback((nextOwnerId) => {
    const prevOwner = ownerRef.current;
    if (prevOwner === nextOwnerId) return;

    // Save the cart belonging to whoever was active
    persistOwnerCart(prevOwner, cartRef.current);

    if (prevOwner !== 'guest' && nextOwnerId === 'guest') {
      // Keep items visible after logout for this browser session
      writeCart(GUEST_KEY, cartRef.current);
      try {
        localStorage.setItem(FROM_KEY, `logout:${prevOwner}`);
      } catch {
        // ignore
      }
      ownerRef.current = 'guest';
      // Same items stay on screen — no flash empty
      return;
    }

    if (prevOwner === 'guest' && nextOwnerId !== 'guest') {
      writeCart(GUEST_KEY, cartRef.current);
      let nextCart = loadOwnerCart(nextOwnerId);
      let from = 'guest';
      try {
        from = localStorage.getItem(FROM_KEY) || 'guest';
      } catch {
        // ignore
      }
      // Only adopt guest items when they were built as a guest, not left by another account
      const guestCart = loadOwnerCart('guest');
      const userCartEmpty = Object.keys(nextCart).length === 0;
      if (userCartEmpty && from === 'guest' && Object.keys(guestCart).length > 0) {
        nextCart = guestCart;
        writeCart(userKey(nextOwnerId), nextCart);
      }
      ownerRef.current = nextOwnerId;
      skipNextPersist.current = true;
      setCart(nextCart);
      return;
    }

    // Switching directly between two users (rare without guest in between)
    const nextCart = loadOwnerCart(nextOwnerId);
    ownerRef.current = nextOwnerId;
    skipNextPersist.current = true;
    setCart(nextCart);
  }, [loadOwnerCart, persistOwnerCart]);

  // Initial load + auth binding
  useEffect(() => {
    migrateLegacyCart();
    const supabase = createClient();
    let cancelled = false;

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      const owner = user?.id || 'guest';
      ownerRef.current = owner;
      skipNextPersist.current = true;
      setCart(loadOwnerCart(owner));
      setLoaded(true);
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.id) {
        switchOwner(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        switchOwner('guest');
      } else if (event === 'INITIAL_SESSION' && session?.user?.id) {
        // init() already handled; ignore to avoid double switch
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [loadOwnerCart, switchOwner]);

  // Persist active cart whenever it changes
  useEffect(() => {
    if (!loaded) return;
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    persistOwnerCart(ownerRef.current, cart);
    if (ownerRef.current === 'guest') {
      try {
        const from = localStorage.getItem(FROM_KEY) || '';
        // Once a guest edits the cart after someone else's logout, treat it as a true guest cart
        if (from.startsWith('logout:')) {
          localStorage.setItem(FROM_KEY, 'guest');
        } else if (!from) {
          localStorage.setItem(FROM_KEY, 'guest');
        }
      } catch {
        // ignore
      }
    }
  }, [cart, loaded, persistOwnerCart]);

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
