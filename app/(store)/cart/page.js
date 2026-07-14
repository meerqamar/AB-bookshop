'use client';
import { useCart } from '@/components/CartProvider';
import { useToast } from '@/components/Toast';
import { money, codFee, orderTotalWithCod } from '@/lib/utils';
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

  // Countdown timer state (15 minutes default)
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  // Terms and conditions & Order Note
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showOrderNote, setShowOrderNote] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const [showShippingEstimate, setShowShippingEstimate] = useState(false);

  // Countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m : ${s < 10 ? '0' : ''}${s}s`;
  };

  useEffect(() => {
    async function fetchProducts() {
      const ids = Object.keys(cartItems)
        .map(Number)
        .filter((n) => !isNaN(n) && n > 0);

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


  if (loading) {
    return (
      <div className="max-w-container-max mx-auto px-gutter py-24 flex justify-center items-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (cartCount === 0) {
    return (
      <div className="max-w-container-max mx-auto px-gutter py-xl">
        <div className="flex flex-col items-center justify-center p-xl bg-surface-container-low border border-outline border-dashed rounded-2xl text-center my-xl">
          <span className="material-symbols-outlined text-[64px] text-on-surface-variant/50 mb-md">shopping_cart</span>
          <h3 className="font-headline-md text-2xl font-bold text-primary mb-2">Your cart is empty</h3>
          <p className="font-body-md text-on-surface-variant mb-6">Find your next great read in the shop.</p>
          <Link href="/shop" className="bg-primary text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-sm">
            Browse Books
          </Link>
        </div>
      </div>
    );
  }

  const productsMap = {};
  products.forEach((p) => {
    productsMap[p.id] = p;
  });

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
    // Save order note if provided
    if (orderNote.trim()) {
      sessionStorage.setItem('ab_order_note', orderNote.trim());
    }
    router.push('/checkout');
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 min-h-screen">
      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-6">Shopping Cart</h1>

      {/* Limited Stock Countdown Banner */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-50 border border-gray-200 text-sm font-medium text-gray-700 shadow-sm">
          <span className="text-emerald-600 text-lg">🔥</span>
          <span>These products are limited, checkout within</span>
          <span className="bg-emerald-700 text-white font-mono font-bold px-3 py-1 rounded-full text-xs tracking-wide">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Cart Table + Summary Layout */}
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Left Column: Cart Table */}
        <div className="w-full lg:w-2/3">
          {/* Table Headers */}
          <div className="hidden sm:grid grid-cols-12 gap-4 pb-3 border-b border-gray-200 font-bold text-xs uppercase tracking-wider text-gray-700">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          {/* Items */}
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="py-6 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center">
                {/* Product Col (Image + Title + Remove link) */}
                <div className="col-span-6 flex items-start gap-4 w-full sm:w-auto">
                  <div className="w-20 h-24 sm:w-22 sm:h-28 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-gray-400 text-3xl">menu_book</span>
                    )}
                  </div>
                  <div className="flex flex-col justify-center py-1">
                    <Link
                      href={`/product/${item.id}`}
                      className="font-bold text-gray-900 hover:text-primary transition-colors text-sm sm:text-base line-clamp-2"
                    >
                      {item.title}
                    </Link>
                    {item.format && <span className="text-xs text-gray-500 mt-0.5">{item.format}</span>}
                    {/* Underlined Remove Link directly under product title exactly like screenshot */}
                    <button
                      onClick={() => {
                        removeFromCart(item.id);
                        addToast('Item removed from cart');
                      }}
                      className="text-xs text-gray-500 hover:text-red-600 underline font-medium w-fit mt-1.5 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Price Col */}
                <div className="col-span-2 text-center font-medium text-sm text-gray-800 hidden sm:block">
                  {money(item.price)}
                </div>

                {/* Quantity Col */}
                <div className="col-span-2 flex justify-center w-full sm:w-auto mt-2 sm:mt-0">
                  <div className="flex items-center gap-3 bg-gray-50 sm:bg-transparent border sm:border-0 border-gray-200 rounded-lg px-3 sm:px-0 py-1 sm:py-0">
                    <button
                      onClick={() => updateQuantity(item.id, item.qty - 1)}
                      className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-primary transition-colors font-bold text-lg"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold text-sm text-gray-900">{item.qty}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.qty + 1)}
                      className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-primary transition-colors font-bold text-lg"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Total Col */}
                <div className="col-span-2 text-right font-bold text-sm text-gray-900 hidden sm:block">
                  {money(item.lineTotal)}
                </div>

                {/* Mobile price summary */}
                <div className="flex justify-between items-center w-full sm:hidden pt-2 border-t border-gray-100 text-sm">
                  <span className="text-gray-500">Price: {money(item.price)}</span>
                  <span className="font-bold text-gray-900">Total: {money(item.lineTotal)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Left: Add Order Note Collapsible */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowOrderNote(!showOrderNote)}
              className="flex items-center gap-2 font-bold text-sm text-gray-900 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-lg">
                {showOrderNote ? 'expand_less' : 'expand_more'}
              </span>
              Add Order Note
            </button>

            {showOrderNote && (
              <div className="mt-3 animate-fadeIn">
                <textarea
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Special instructions for delivery or packaging..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50"
                ></textarea>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout Box */}
        <div className="w-full lg:w-1/3 bg-gray-50/80 sm:bg-transparent p-6 sm:p-0 rounded-2xl border sm:border-0 border-gray-200">
          {/* Estimate Shipping Accordion */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <button
              onClick={() => setShowShippingEstimate(!showShippingEstimate)}
              className="w-full flex justify-between items-center font-bold text-sm text-gray-900 hover:text-primary transition-colors"
            >
              <span>Estimate Shipping</span>
              <span className="text-lg font-normal">{showShippingEstimate ? '−' : '+'}</span>
            </button>

            {showShippingEstimate && (
              <div className="mt-4 text-xs text-gray-600 space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-100 animate-fadeIn">
                <div className="flex justify-between">
                  <span>Standard Shipping (COD)</span>
                  <span className="font-semibold text-gray-900">{money(codFee())}</span>
                </div>
                <p className="text-gray-400">Exact delivery fee will be confirmed at checkout based on your city.</p>
              </div>
            )}
          </div>

          {/* Subtotal */}
          <div className="flex justify-between items-baseline mb-2">
            <span className="font-semibold text-gray-800 text-base">Subtotal</span>
            <span className="font-extrabold text-gray-900 text-lg">{money(subtotal)} PKR</span>
          </div>

          {/* Note */}
          <p className="text-xs text-gray-500 mb-6">Taxes and shipping calculated at checkout</p>

          {/* Terms Checkbox */}
          <div className="flex items-center gap-2.5 mb-6">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-gray-700 select-none cursor-pointer">
              I agree with the{' '}
              <Link href="/terms" className="font-bold underline hover:text-primary transition-colors">
                terms and conditions
              </Link>
            </label>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            className={`w-full py-4 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center ${
              agreedToTerms
                ? 'bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.99] cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Check out
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </main>
  );
}
