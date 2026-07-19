'use client';
import { useCart } from '@/components/CartProvider';
import { useToast } from '@/components/Toast';
import { money, codFee } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, cartCount } = useCart();
  const { addToast } = useToast();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showOrderNote, setShowOrderNote] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      const ids = Object.keys(cartItems).map(Number).filter((n) => !isNaN(n) && n > 0);
      if (ids.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      const supabase = createClient();
      const { data } = await supabase.from('products').select('*').in('id', ids);
      setProducts(data || []);
      setLoading(false);
    }
    fetchProducts();
  }, [cartItems]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data?.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex justify-center items-center bg-[#f3f7f5]">
        <div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (cartCount === 0) {
    return (
      <main className="min-h-screen bg-[#f3f7f5]">
        <div className="max-w-container-max mx-auto px-4 md:px-lg py-16 md:py-24">
          <div className="flex flex-col items-center justify-center p-10 md:p-16 bg-white border border-dashed border-outline-variant rounded-2xl text-center max-w-lg mx-auto shadow-sm">
            <span className="material-symbols-outlined text-[64px] text-primary/40 mb-4">shopping_cart</span>
            <h1 className="font-headline-md text-2xl text-on-surface mb-2">Your cart is empty</h1>
            <p className="text-on-surface-variant mb-6">Find your next great read in the shop.</p>
            <Link href="/shop" className="bg-primary text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-[0_8px_20px_rgba(4,120,87,0.25)]">
              Browse Books
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const productsMap = {};
  products.forEach((p) => { productsMap[p.id] = p; });

  let subtotal = 0;
  const items = Object.entries(cartItems)
    .map(([pid, qty]) => {
      const product = productsMap[parseInt(pid)];
      if (!product) return null;
      const lineTotal = product.price * qty;
      subtotal += lineTotal;
      return { ...product, qty, lineTotal };
    })
    .filter(Boolean);

  const handleCheckout = () => {
    if (!agreedToTerms) {
      addToast('Please agree to the terms and conditions to proceed.', 'error');
      return;
    }
    if (orderNote.trim()) sessionStorage.setItem('ab_order_note', orderNote.trim());
    // Cart stays in the browser after logout; placing an order still needs an account
    if (!isLoggedIn) {
      router.push('/login?redirect=/checkout');
      return;
    }
    router.push('/checkout');
  };

  return (
    <main className="min-h-screen bg-[#f3f7f5]">
      <div className="max-w-container-max mx-auto px-4 md:px-lg py-10 md:py-14">
        <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-primary/80 mb-2">Checkout prep</p>
        <h1 className="font-display-lg text-[1.75rem] sm:text-3xl md:text-4xl text-on-surface mb-8">Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-2/3 bg-white border border-outline-variant/70 rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="hidden sm:grid grid-cols-12 gap-4 pb-3 border-b border-outline-variant/60 text-xs uppercase tracking-wider font-semibold text-on-surface-variant">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            <div className="divide-y divide-outline-variant/50">
              {items.map((item) => (
                <div key={item.id} className="py-5 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center">
                  <div className="col-span-6 flex items-start gap-4 w-full">
                    <Link href={`/product/${item.id}`} className="w-20 h-28 bg-[#f3f7f5] rounded-xl overflow-hidden border border-outline-variant/60 shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary/40">
                          <span className="material-symbols-outlined text-3xl">menu_book</span>
                        </div>
                      )}
                    </Link>
                    <div className="py-1 min-w-0">
                      <Link href={`/product/${item.id}`} className="font-semibold text-on-surface hover:text-primary transition-colors text-sm sm:text-base line-clamp-2">
                        {item.title}
                      </Link>
                      {item.format && <span className="text-xs text-on-surface-variant mt-0.5 block">{item.format}</span>}
                      <button
                        onClick={() => { removeFromCart(item.id); addToast('Item removed from cart'); }}
                        className="text-xs text-on-surface-variant hover:text-error underline font-medium w-fit mt-2 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="col-span-2 text-center text-sm text-on-surface hidden sm:block">{money(item.price)}</div>

                  <div className="col-span-2 flex justify-center w-full sm:w-auto">
                    <div className="flex items-center gap-1 bg-[#f3f7f5] border border-outline-variant/60 rounded-full px-1 py-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.qty - 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface hover:bg-white hover:text-primary transition-colors font-bold"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-semibold text-sm">{item.qty}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.qty + 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface hover:bg-white hover:text-primary transition-colors font-bold"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="col-span-2 text-right font-bold text-sm text-primary hidden sm:block">{money(item.lineTotal)}</div>

                  <div className="flex justify-between items-center w-full sm:hidden pt-2 border-t border-outline-variant/40 text-sm">
                    <span className="text-on-surface-variant">{money(item.price)} each</span>
                    <span className="font-bold text-primary">{money(item.lineTotal)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-outline-variant/60">
              <button
                onClick={() => setShowOrderNote(!showOrderNote)}
                className="flex items-center gap-2 font-semibold text-sm text-on-surface hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-lg">{showOrderNote ? 'expand_less' : 'expand_more'}</span>
                Add order note
              </button>
              {showOrderNote && (
                <textarea
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Special instructions for delivery or packaging..."
                  rows="3"
                  className="mt-3 w-full px-4 py-3 border border-outline-variant rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-[#f3f7f5]"
                />
              )}
            </div>
          </div>

            <div className="w-full lg:w-1/3 bg-white border border-outline-variant/70 rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="font-headline-sm text-lg text-on-surface mb-5">Order summary</h2>

            <div className="flex justify-between text-sm text-on-surface-variant mb-2">
              <span>Subtotal</span>
              <span className="font-semibold text-on-surface">{money(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-on-surface-variant mb-4">
              <span>COD shipping (est.)</span>
              <span className="font-semibold text-on-surface">{money(codFee())}</span>
            </div>
            <p className="text-xs text-on-surface-variant mb-5">Final shipping is confirmed at checkout based on your city.</p>

            <div className="flex items-start gap-2.5 mb-5">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-on-surface-variant cursor-pointer leading-relaxed">
                I agree with the{' '}
                <Link href="/terms" className="font-semibold text-primary underline">terms and conditions</Link>
              </label>
            </div>

            <button
              onClick={handleCheckout}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                agreedToTerms
                  ? 'bg-primary text-white hover:bg-primary/90 shadow-[0_8px_20px_rgba(4,120,87,0.25)]'
                  : 'bg-surface-container text-on-surface-variant cursor-not-allowed'
              }`}
            >
              {isLoggedIn === false ? 'Sign in to checkout' : 'Proceed to checkout'}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            {isLoggedIn === false && (
              <p className="mt-2 text-center text-xs text-on-surface-variant">
                Your cart is saved on this device. Sign in to place your COD order.
              </p>
            )}

            <Link href="/shop" className="mt-4 block text-center text-sm font-semibold text-primary hover:underline">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
