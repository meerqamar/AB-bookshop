'use client';
import { useCart } from '@/components/CartProvider';
import { useToast } from '@/components/Toast';
import { money, codFee, orderTotalWithCod } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, cartCount } = useCart();
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const ids = Object.keys(cartItems).map(Number);
      if (ids.length === 0) { setProducts([]); setLoading(false); return; }

      const supabase = createClient();
      const { data } = await supabase
        .from('products')
        .select('*')
        .in('id', ids);
      setProducts(data || []);
      setLoading(false);
    }
    fetchProducts();
  }, [cartItems]);

  if (loading) {
    return <div className="max-w-container-max mx-auto px-gutter py-xl flex justify-center py-24"><div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin"></div></div>;
  }

  if (cartCount === 0) {
    return (
      <div className="max-w-container-max mx-auto px-gutter py-xl">
        <div className="flex flex-col items-center justify-center p-xl bg-surface-container-low border border-outline border-dashed rounded text-center my-xl">
          <span className="material-symbols-outlined text-[64px] text-on-surface-variant/50 mb-md">shopping_cart</span>
          <h3 className="font-headline-md text-headline-md text-primary mb-xs">Your cart is empty</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-lg">Find your next great read in the shop.</p>
          <Link href="/shop" className="bg-primary text-on-primary px-lg py-4 font-label-md text-label-md btn-focus hover:bg-primary-container transition-soft rounded inline-flex items-center">
            Browse Books
          </Link>
        </div>
      </div>
    );
  }

  const productsMap = {};
  products.forEach(p => { productsMap[p.id] = p; });

  let subtotal = 0;
  const items = Object.entries(cartItems).map(([pid, qty]) => {
    const product = productsMap[parseInt(pid)];
    if (!product) return null;
    const lineTotal = product.price * qty;
    subtotal += lineTotal;
    return { ...product, qty, lineTotal };
  }).filter(Boolean);

  return (
    <main className="max-w-container-max mx-auto px-gutter py-xl min-h-screen">
      <div className="mb-lg">
        <h2 className="font-headline-md text-[2rem] md:text-headline-md text-on-background">Your Reading List</h2>
        <p className="text-on-surface-variant font-body-lg mt-1">Review your selections before completing your purchase.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-lg">
        {/* Cart Items List */}
        <div className="flex-grow space-y-md">
          {items.map(item => (
            <div key={item.id} className="bg-surface-container-lowest p-md border border-outline-variant flex gap-md items-start group hover:shadow-lg hover:shadow-black/5 transition-all duration-300 rounded">
              <div className="w-24 sm:w-32 h-36 sm:h-44 flex-shrink-0 bg-surface-container-high overflow-hidden border border-outline-variant flex items-center justify-center rounded-sm">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-on-surface-variant/50">menu_book</span>
                )}
              </div>
              <div className="flex-grow flex flex-col h-full justify-between py-xs">
                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                    <Link href={`/product/${item.id}`} className="font-headline-sm text-[1.1rem] md:text-headline-sm text-primary hover:text-secondary transition-colors line-clamp-2">{item.title}</Link>
                    <span className="font-headline-sm text-[1.1rem] md:text-headline-sm text-on-surface">{money(item.price)}</span>
                  </div>
                  {item.format && <p className="font-label-md text-on-surface-variant mb-xs">{item.format}</p>}
                  <p className="font-caption text-caption text-outline">In Stock &amp; Ready to Ship</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-auto pt-md gap-4">
                  <div className="flex items-center border border-outline-variant rounded-lg overflow-hidden h-10 w-fit">
                    <button className="px-3 hover:bg-surface-container-low transition-colors text-on-surface" onClick={() => updateQuantity(item.id, item.qty - 1)}>
                      <span className="material-symbols-outlined text-sm">remove</span>
                    </button>
                    <input
                      className="w-10 text-center border-none focus:ring-0 font-label-md bg-transparent text-on-surface"
                      type="number"
                      value={item.qty}
                      onChange={e => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                      min="0"
                    />
                    <button className="px-3 hover:bg-surface-container-low transition-colors text-on-surface" onClick={() => updateQuantity(item.id, item.qty + 1)}>
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                  <button
                    className="flex items-center gap-xs font-label-md text-error hover:underline transition-all w-fit"
                    onClick={() => { removeFromCart(item.id); addToast('Removed from cart'); }}
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Continue Shopping */}
          <Link className="inline-flex items-center gap-xs text-primary font-label-md hover:underline pt-base w-fit" href="/shop">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Catalog
          </Link>
        </div>

        {/* Order Summary */}
        <aside className="w-full lg:w-[400px] flex-shrink-0">
          <div className="bg-surface-container p-md border border-outline-variant rounded-lg sticky top-24">
            <h3 className="font-headline-sm text-headline-sm text-primary border-b border-outline-variant pb-md mb-md">Order Summary</h3>
            
            <div className="space-y-sm mb-lg text-on-surface">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Subtotal ({cartCount} items)</span>
                <span className="font-label-md">{money(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Standard Shipping</span>
                <span className="font-label-md">{money(codFee())}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-end border-t border-outline-variant pt-md mb-lg">
              <span className="font-headline-sm text-[1.25rem] text-on-surface">Total</span>
              <span className="font-headline-md text-[1.5rem] md:text-headline-md text-primary">{money(orderTotalWithCod(subtotal))}</span>
            </div>
            
            <Link href="/checkout" className="w-full bg-primary text-on-primary py-4 rounded font-label-md flex items-center justify-center gap-sm hover:bg-primary-container transition-all group active:scale-[0.98]">
              Proceed to Checkout
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
