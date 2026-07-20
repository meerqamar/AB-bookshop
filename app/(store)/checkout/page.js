'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/components/CartProvider';
import { useToast } from '@/components/Toast';
import { createClient } from '@/lib/supabase/client';
import { money, codFee } from '@/lib/utils';
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

  // Form fields matching screenshot exactly
  const [selectedAddr, setSelectedAddr] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [emailNews, setEmailNews] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [saveInfo, setSaveInfo] = useState(true);
  const [billingSame, setBillingSame] = useState(true);

  // Billing fields
  const [billingFirstName, setBillingFirstName] = useState('');
  const [billingLastName, setBillingLastName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingPostalCode, setBillingPostalCode] = useState('');
  const [billingPhone, setBillingPhone] = useState('');


  // Discount code
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(0);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) {
        router.replace('/login?redirect=/checkout');
        return;
      }
      setUser(u);
      setEmailOrPhone(u.email || '');
      // Fetch saved addresses
      const { data: addrs } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', u.id)
        .order('id', { ascending: false });
      setAddresses(addrs || []);
      if (addrs && addrs.length > 0) {
        const latest = addrs[0];
        setSelectedAddr(latest.id.toString());
        setAddress(latest.full_address || '');
        setCity(latest.city || '');
        setPhone(latest.phone || '');
      }

      // Fetch cart products
      const ids = Object.keys(cartItems).map(Number).filter(n => !isNaN(n) && n > 0);
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

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }
  if (cartCount === 0) return null;

  const productsMap = {};
  products.forEach(p => { productsMap[p.id] = p; });
  let subtotal = 0;
  const items = Object.entries(cartItems).map(([pid, qty]) => {
    const p = productsMap[parseInt(pid)];
    if (!p) return null;
    const total = p.price * qty;
    subtotal += total;
    return { ...p, qty, total };
  }).filter(Boolean);

  const shippingCost = codFee();
  const finalTotal = Math.max(0, subtotal + shippingCost - discountApplied);

  async function userHasPriorOrders(supabase, userId) {
    const { count, error } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .neq('status', 'Cancelled');
    if (error) {
      console.error('Order history check failed:', error);
      return true; // fail closed — don't allow discount if we can't verify
    }
    return (count || 0) > 0;
  }

  const handleApplyDiscount = async (e) => {
    e.preventDefault();
    const code = discountCode.trim().toUpperCase();
    if (code !== 'WELCOME10') {
      setDiscountApplied(0);
      addToast('Invalid discount code. Try WELCOME10', 'error');
      return;
    }

    if (!user?.id) {
      setDiscountApplied(0);
      addToast('Please sign in to use WELCOME10 on your first order.', 'error');
      return;
    }

    if (subtotal <= 0) {
      addToast('Add items to your cart first.', 'error');
      return;
    }

    const supabase = createClient();
    const usedBefore = await userHasPriorOrders(supabase, user.id);
    if (usedBefore) {
      setDiscountApplied(0);
      addToast('WELCOME10 is for your first order only — you have already placed an order.', 'error');
      return;
    }

    const disc = Math.round(subtotal * 0.1);
    setDiscountApplied(disc);
    addToast(`10% first-order discount applied (-${money(disc)})!`, 'success');
  };

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setPlacing(true);
    try {
      const supabase = createClient();
      let userId = user ? user.id : null;

      // If user not logged in, ask or allow guest order if auth rules allow, otherwise redirect
      if (!userId) {
        addToast('Please log in or create an account to track your order.', 'error');
        router.push('/login?redirect=/checkout');
        setPlacing(false);
        return;
      }

      // Re-check first-order discount at submit so it can’t be reused
      let appliedDiscount = discountApplied;
      if (appliedDiscount > 0) {
        const code = discountCode.trim().toUpperCase();
        if (code !== 'WELCOME10' || await userHasPriorOrders(supabase, userId)) {
          appliedDiscount = 0;
          setDiscountApplied(0);
          addToast('WELCOME10 is only valid once, on your first order.', 'error');
          setPlacing(false);
          return;
        }
      }
      const orderTotal = Math.max(0, subtotal + shippingCost - appliedDiscount);

      // Self-heal profile: Ensure this user exists inside profiles table to prevent foreign key violation (fk_user_profile)
      await supabase
        .from('profiles')
        .upsert(
          {
            id: userId,
            name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'Customer',
            role: 'user'
          },
          { onConflict: 'id', ignoreDuplicates: true }
        );

      let addressId = selectedAddr && selectedAddr !== 'new' ? selectedAddr : null;

      const fullAddrText = address || (selectedAddr ? 'Saved Address' : '');

      if (!addressId) {
        if (!fullAddrText || !city || !phone) {
          addToast('Please fill out all delivery address fields', 'error');
          setPlacing(false);
          return;
        }
        const { data: newAddrList, error: addrErr } = await supabase
          .from('addresses')
          .insert({
            user_id: userId,
            full_address: fullAddrText,
            city,
            phone,
            whatsapp: phone
          })
          .select();

        if (addrErr) {
          const errMsg = addrErr?.message || addrErr?.details || addrErr?.code || JSON.stringify(addrErr);
          console.error('Address Save Error:', errMsg, addrErr);
          addToast(`Address Error: ${errMsg}`, 'error');
          setPlacing(false);
          return;
        }
        const newAddr = newAddrList && newAddrList.length > 0 ? newAddrList[0] : null;
        if (!newAddr) {
          addToast('Failed to save address. Please try again.', 'error');
          setPlacing(false);
          return;
        }
        addressId = newAddr.id;
      }

      // Create order
      const { data: orderList, error: orderErr } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          address_id: addressId,
          total_price: orderTotal,
          status: 'Pending'
        })
        .select();

      if (orderErr) {
        const errMsg = orderErr?.message || orderErr?.details || orderErr?.code || JSON.stringify(orderErr, Object.getOwnPropertyNames(orderErr));
        console.error('Order Save Error Details:', errMsg, orderErr);
        addToast(`Order Error: ${errMsg}`, 'error');
        setPlacing(false);
        return;
      }

      const order = orderList && orderList.length > 0 ? orderList[0] : { id: 'New' };

      // Create order items
      const orderItemsList = items.map(item => ({
        order_id: order.id !== 'New' ? order.id : null,
        product_id: item.id,
        quantity: item.qty,
        price: item.price
      }));

      const { error: itemsErr } = await supabase.from('order_items').insert(orderItemsList);
      if (itemsErr) {
        const errMsg = itemsErr?.message || itemsErr?.details || itemsErr?.code || JSON.stringify(itemsErr);
        console.error('Order Items Save Error:', errMsg, itemsErr);
        addToast(`Items Error: ${errMsg}`, 'error');
        setPlacing(false);
        return;
      }


      clearCart();
      addToast(`Order #${order.id} placed successfully! 🎉`, 'success');
      setTimeout(() => {
        router.push('/dashboard?tab=orders');
      }, 1500);
    } catch (err) {
      console.error('Unhandled Exception:', err);
      addToast(`Error: ${err.message}`, 'error');
      setPlacing(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white text-gray-800">
      {/* LEFT PANE: Form sections */}
      <div className="w-full lg:w-3/5 px-4 sm:px-12 lg:px-20 py-8 sm:py-10 order-2 lg:order-1">
        {/* Mobile Header / Brand */}
        <div className="mb-8">
          <Link href="/" className="text-2xl font-extrabold text-primary tracking-tight">AB Book Shop</Link>
        </div>

        <form onSubmit={handlePlaceOrder} className="space-y-8 max-w-2xl">
          {/* Contact Section */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-gray-900">Contact</h2>
              {!user ? (
                <Link href="/login?redirect=/checkout" className="text-sm font-semibold text-primary hover:underline">
                  Sign in
                </Link>
              ) : (
                <span className="text-xs text-gray-500">Logged in as {user.email}</span>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                required
                placeholder="Email or mobile phone number"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[18px] pointer-events-none">
                help
              </span>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <input
                type="checkbox"
                id="news"
                checked={emailNews}
                onChange={(e) => setEmailNews(e.target.checked)}
                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
              />
              <label htmlFor="news" className="text-xs text-gray-600 cursor-pointer">
                Email me with news and offers
              </label>
            </div>
          </section>

          {/* Delivery Section */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-gray-900">Delivery</h2>
            </div>

            {/* Saved addresses selector if user has any */}
            {addresses.length > 0 && (
              <div className="mb-4">
                <select
                  value={selectedAddr}
                  onChange={(e) => {
                    setSelectedAddr(e.target.value);
                    if (e.target.value !== 'new') {
                      const found = addresses.find(a => a.id.toString() === e.target.value);
                      if (found) {
                        setAddress(found.full_address || '');
                        setCity(found.city || '');
                        setPhone(found.phone || '');
                      }
                    } else {
                      setAddress('');
                      setCity('');
                      setPhone('');
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-gray-50 cursor-pointer"
                >
                  {addresses.map(a => (
                    <option key={a.id} value={a.id}>
                      Saved: {a.full_address}, {a.city} ({a.phone})
                    </option>
                  ))}
                  <option value="new">+ Enter a new address</option>
                </select>
              </div>
            )}

            <div className="space-y-3">
              {/* Country */}
              <div>
                <select
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700 outline-none cursor-not-allowed"
                >
                  <option>Pakistan</option>
                </select>
              </div>

              {/* Name (2 cols) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
                <input
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              {/* Address */}
              <input
                type="text"
                required
                placeholder="Address (House No, Street, Sector / Area)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />

              {/* City + Postal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
                <input
                  type="text"
                  placeholder="Postal code (optional)"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              {/* Phone */}
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[18px] pointer-events-none">
                  help
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <input
                type="checkbox"
                id="save"
                checked={saveInfo}
                onChange={(e) => setSaveInfo(e.target.checked)}
                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
              />
              <label htmlFor="save" className="text-xs text-gray-600 cursor-pointer">
                Save this information for next time
              </label>
            </div>
          </section>

          {/* Shipping Method Section */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Shipping method</h2>
            <div className="border border-primary bg-primary/5 rounded-lg p-4 flex justify-between items-center text-sm font-medium">
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full border-4 border-primary bg-white flex-shrink-0"></span>
                <span className="text-gray-900 font-semibold">Standard Delivery Charges</span>
              </div>
              <span className="font-bold text-gray-900">{money(codFee())}</span>
            </div>
          </section>

          {/* Payment Section */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Payment</h2>
            <p className="text-xs text-gray-500 mb-3">All transactions are secure and encrypted.</p>

            <div className="border border-primary rounded-lg overflow-hidden">
              {/* Radio Header */}
              <div className="bg-primary/5 p-4 flex items-center gap-3 border-b border-gray-200">
                <span className="w-4 h-4 rounded-full border-4 border-primary bg-white flex-shrink-0"></span>
                <span className="text-sm font-bold text-gray-900">Cash on Delivery (COD)</span>
              </div>
              {/* Box Content */}
              <div className="bg-gray-50 p-6 text-center text-sm text-gray-600 border-t border-gray-200/50">
                Cash on Delivery
              </div>
            </div>
          </section>

          {/* Billing Address Section */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Billing address</h2>
            <div className="border border-gray-300 rounded-lg divide-y divide-gray-200 overflow-hidden text-sm">
              <label className="p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="billing"
                  checked={billingSame}
                  onChange={() => setBillingSame(true)}
                  className="w-4 h-4 text-primary border-gray-300 focus:ring-primary cursor-pointer"
                />
                <span className="font-medium text-gray-800">Same as shipping address</span>
              </label>
              
              <div>
                <label className="p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="billing"
                    checked={!billingSame}
                    onChange={() => setBillingSame(false)}
                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary cursor-pointer"
                  />
                  <span className="font-medium text-gray-800">Use a different billing address</span>
                </label>

                {!billingSame && (
                  <div className="bg-gray-50 p-4 sm:p-5 border-t border-gray-200 space-y-3 animate-fadeIn">
                    {/* Country */}
                    <div>
                      <select
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-100 text-gray-700 outline-none cursor-not-allowed"
                      >
                        <option>Pakistan</option>
                      </select>
                    </div>

                    {/* Name (2 cols) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required={!billingSame}
                        placeholder="First name"
                        value={billingFirstName}
                        onChange={(e) => setBillingFirstName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                      <input
                        type="text"
                        required={!billingSame}
                        placeholder="Last name"
                        value={billingLastName}
                        onChange={(e) => setBillingLastName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>

                    {/* Address */}
                    <input
                      type="text"
                      required={!billingSame}
                      placeholder="Address (House No, Street, Sector / Area)"
                      value={billingAddress}
                      onChange={(e) => setBillingAddress(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />

                    {/* City + Postal */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required={!billingSame}
                        placeholder="City"
                        value={billingCity}
                        onChange={(e) => setBillingCity(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Postal code (optional)"
                        value={billingPostalCode}
                        onChange={(e) => setBillingPostalCode(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>

                    {/* Phone */}
                    <div className="relative">
                      <input
                        type="tel"
                        required={!billingSame}
                        placeholder="Phone"
                        value={billingPhone}
                        onChange={(e) => setBillingPhone(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[18px] pointer-events-none">
                        help
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>


          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={placing}
              className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold text-base rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {placing ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Processing Order...
                </>
              ) : (
                'Complete order'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT PANE: Emerald Green Order Summary (exact match to screenshot) */}
      <div
        className="w-full lg:w-2/5 px-4 sm:px-12 lg:px-14 py-8 sm:py-10 text-white order-1 lg:order-2"
        style={{ background: '#047857' }}
      >
        <div className="max-w-md mx-auto lg:max-w-none sticky top-10">
          {/* Product Items List */}
          <div className="divide-y divide-white/10 mb-6">
            {items.map((item) => (
              <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Thumbnail with Badge */}
                  <div className="relative w-14 h-16 bg-white rounded-lg p-1 flex items-center justify-center border border-white/20 flex-shrink-0 shadow-sm">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded" />
                    ) : (
                      <span className="material-symbols-outlined text-gray-400 text-2xl">menu_book</span>
                    )}
                    <span className="absolute -top-2 -right-2 bg-gray-600 text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center border border-white shadow">
                      {item.qty}
                    </span>
                  </div>
                  {/* Title */}
                  <div className="text-sm font-medium leading-snug line-clamp-2">
                    {item.title}
                  </div>
                </div>
                {/* Price */}
                <div className="text-sm font-semibold whitespace-nowrap">
                  {money(item.total)}
                </div>
              </div>
            ))}
          </div>

          {/* Discount code input + button */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="Discount code"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-400 text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              onClick={handleApplyDiscount}
              type="button"
              className="px-6 py-3 rounded-lg bg-white/20 hover:bg-white/30 text-white font-semibold text-sm transition-all border border-white/30"
            >
              Apply
            </button>
          </div>

          {/* Cost breakdown */}
          <div className="space-y-2 border-t border-white/10 pt-4 text-sm">
            <div className="flex justify-between text-white/90">
              <span>Subtotal · {cartCount} items</span>
              <span>{money(subtotal)}</span>
            </div>
            {discountApplied > 0 && (
              <div className="flex justify-between text-green-200 font-medium">
                <span>Discount applied</span>
                <span>-{money(discountApplied)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-white/90">
              <span className="flex items-center gap-1">
                Shipping
                <span className="material-symbols-outlined text-[16px] text-white/60">help</span>
              </span>
              <span>{money(shippingCost)}</span>
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-white/20 mt-4 pt-4 flex justify-between items-baseline">
            <span className="text-lg font-bold">Total</span>
            <div className="text-right">
              <span className="text-xs text-white/70 mr-1.5">PKR</span>
              <span className="text-2xl font-extrabold">{money(finalTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
