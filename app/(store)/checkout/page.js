'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/components/CartProvider';
import { useToast } from '@/components/Toast';
import { createClient } from '@/lib/supabase/client';
import { money, codFee, orderTotalWithCod } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cartItems, clearCart, cartCount } = useCart();
  const { addToast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  const [selectedAddr, setSelectedAddr] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { router.push('/login'); return; }
      setUser(u);

      // Fetch addresses
      const { data: addrs } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', u.id)
        .order('id', { ascending: false });
      setAddresses(addrs || []);

      // Fetch products
      const ids = Object.keys(cartItems).map(Number);
      if (ids.length > 0) {
        const { data: prods } = await supabase
          .from('products')
          .select('*')
          .in('id', ids);
        setProducts(prods || []);
      }
      setLoading(false);
    }
    init();
  }, [cartItems, router]);

  useEffect(() => {
    if (!loading && cartCount === 0) {
      router.push('/cart');
    }
  }, [loading, cartCount, router]);

  if (loading) return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"><div className="flex justify-center items-center py-24"><div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div></div></div>;
  if (cartCount === 0) return null;

  const productsMap = {};
  products.forEach(p => { productsMap[p.id] = p; });
  let subtotal = 0;
  const items = Object.entries(cartItems).map(([pid, qty]) => {
    const p = productsMap[parseInt(pid)];
    if (!p) return null;
    subtotal += p.price * qty;
    return { ...p, qty };
  }).filter(Boolean);

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setPlacing(true);
    try {
      const supabase = createClient();

      let addressId = selectedAddr ? parseInt(selectedAddr) : null;

      // Create new address if needed
      if (!addressId) {
        if (!fullAddress || !city || !phone || !whatsapp) {
          addToast('Please fill all address fields', 'error');
          setPlacing(false);
          return;
        }
        const { data: newAddr, error: addrErr } = await supabase
          .from('addresses')
          .insert({ user_id: user.id, full_address: fullAddress, city, phone, whatsapp })
          .select()
          .single();
        if (addrErr) { 
          console.error('Address Save Error:', addrErr);
          addToast(`Address Error: ${addrErr.message || 'Failed to save address'}`, 'error'); 
          setPlacing(false); 
          return; 
        }
        addressId = newAddr.id;
      }

      const total = orderTotalWithCod(subtotal);

      // Create order
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({ user_id: user.id, address_id: addressId, total_price: total, status: 'Pending' })
        .select()
        .single();

      if (orderErr) { 
        console.error('Order Save Error:', orderErr);
        addToast(`Order Error: ${orderErr.message || 'Failed to place order'}`, 'error'); 
        setPlacing(false); 
        return; 
      }

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.qty,
        price: item.price
      }));
      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
      if (itemsErr) { 
        console.error('Order Items Save Error:', itemsErr);
        addToast(`Items Error: ${itemsErr.message || 'Failed to save order items'}`, 'error'); 
        setPlacing(false); 
        return; 
      }

      clearCart();
      addToast(`Order #${order.id} placed successfully!`, 'success');
      
      // Slight delay to allow user to see the success toast before navigating
      setTimeout(() => {
        router.push('/dashboard?tab=orders');
      }, 1500);
    } catch (err) {
      console.error('Unhandled Exception in handlePlaceOrder:', err);
      addToast(`Unexpected Error: ${err.message}`, 'error');
      setPlacing(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14">
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-text-primary">Checkout</h2>
        <Link href="/cart" className="text-text-secondary hover:text-primary transition-colors font-medium">← Back to cart</Link>
      </div>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 className="font-display text-2xl font-bold text-text-primary mb-6 border-b border-border/50 pb-4">Delivery Address</h3>

            {addresses.length > 0 && (
              <div className="flex flex-col gap-2 mb-5">
                <label className="font-medium text-text-primary text-sm">Use a saved address</label>
                <select className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer" value={selectedAddr} onChange={e => setSelectedAddr(e.target.value)}>
                  <option value="">— Add new address —</option>
                  {addresses.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.full_address}, {a.city} ({a.phone})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {!selectedAddr && (
              <>
                <div className="flex flex-col gap-2 mb-5"><label className="font-medium text-text-primary text-sm">Full Address</label><textarea className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" value={fullAddress} onChange={e => setFullAddress(e.target.value)} rows="2" required /></div>
                <div className="flex flex-col gap-2 mb-5"><label className="font-medium text-text-primary text-sm">City</label><input className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" value={city} onChange={e => setCity(e.target.value)} required /></div>
                <div className="flex flex-col gap-2 mb-5"><label className="font-medium text-text-primary text-sm">Phone</label><input className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" value={phone} onChange={e => setPhone(e.target.value)} required /></div>
                <div className="flex flex-col gap-2 mb-5"><label className="font-medium text-text-primary text-sm">WhatsApp</label><input className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} required /></div>
              </>
            )}

            <p className="text-text-secondary text-sm mt-8">
              Payment method: <strong className="text-text-primary">Cash on Delivery</strong>
            </p>

            <button className="w-full inline-flex items-center justify-center font-bold transition-all duration-300 rounded-xl px-8 py-4 text-lg bg-primary text-white hover:bg-primary-dark shadow-md mt-8 disabled:opacity-50 disabled:cursor-not-allowed" disabled={placing}>
              {placing ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm lg:sticky lg:top-24">
            <h3 className="font-display text-2xl font-bold text-text-primary mb-6 border-b border-border/50 pb-4">Order Summary</h3>
            <div className="flex flex-col gap-4 border-b border-border/50 pb-4 mb-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-text-secondary">
                  <span className="truncate pr-4">{item.title} × {item.qty}</span>
                  <span className="shrink-0 font-medium text-text-primary">{money(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-text-secondary mb-4"><span>Shipping (COD)</span><span className="font-medium text-text-primary">{money(codFee())}</span></div>
            <div className="flex justify-between py-4 text-xl font-bold text-text-primary mt-2 border-t border-border/50"><span>Total</span><span className="text-primary">{money(orderTotalWithCod(subtotal))}</span></div>
          </div>
        </div>
      </form>
    </div>
  );
}
