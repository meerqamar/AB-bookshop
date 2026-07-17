'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { money, formatDate, formatDateTime } from '@/lib/utils';
import { useToast } from '@/components/Toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage({ searchParams }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('orders');
  const [loading, setLoading] = useState(true);

  // Data
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [addresses, setAddresses] = useState([]);

  // Address form
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

      let { data: prof } = await supabase.from('profiles').select('*').eq('id', u.id).single();
      if (!prof) {
        await supabase.from('profiles').upsert({
          id: u.id,
          name: u?.user_metadata?.name || u?.email?.split('@')[0] || 'Customer',
          role: 'user'
        }, { onConflict: 'id', ignoreDuplicates: true });
        const { data: newProf } = await supabase.from('profiles').select('*').eq('id', u.id).single();
        prof = newProf;
      }
      setProfile(prof);
      setLoading(false);
    }

    init();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    if (tab === 'orders') loadOrders();
    if (tab === 'addresses') loadAddresses();
  }, [tab, user]);

  async function loadOrders() {
    const supabase = createClient();
    const { data } = await supabase
      .from('orders')
      .select('*, address:addresses(full_address, city, phone, whatsapp)')
      .eq('user_id', user.id)
      .order('id', { ascending: false });
    setOrders(data || []);
  }

  async function loadOrderDetail(orderId) {
    const supabase = createClient();
    const { data: order } = await supabase
      .from('orders')
      .select('*, address:addresses(full_address, city, phone, whatsapp)')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();
    const { data: items } = await supabase
      .from('order_items')
      .select('*, product:products(title)')
      .eq('order_id', orderId);
    setSelectedOrder(order);
    setOrderItems(items || []);
    setTab('order-detail');
  }

  async function loadAddresses() {
    const supabase = createClient();
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('id', { ascending: false });
    setAddresses(data || []);
  }

  async function addAddress(e) {
    e.preventDefault();
    if (!fullAddress || !city || !phone || !whatsapp) { addToast('Fill all fields', 'error'); return; }
    const supabase = createClient();
    await supabase.from('addresses').insert({ user_id: user.id, full_address: fullAddress, city, phone, whatsapp });
    setFullAddress(''); setCity(''); setPhone(''); setWhatsapp('');
    addToast('Address added');
    loadAddresses();
  }

  async function deleteAddress(id) {
    const supabase = createClient();
    await supabase.from('addresses').delete().eq('id', id).eq('user_id', user.id);
    addToast('Address deleted');
    loadAddresses();
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"><div className="flex justify-center items-center py-24"><div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin"></div></div></div>;

  const navItems = [
    { key: 'orders', label: 'My Orders', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg> },
    { key: 'addresses', label: 'Addresses', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> },
    { key: 'profile', label: 'Profile', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ];

  return (
    <div className="min-h-screen bg-[#f3f7f5]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2 md:sticky md:top-24">
          {profile && (
            <div className="flex items-center gap-4 p-4 mb-4 bg-white rounded-2xl border border-outline-variant/70 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl">{(profile.name || 'U')[0].toUpperCase()}</div>
              <div>
                <div className="font-bold text-on-surface">{profile.name}</div>
                <div className="text-xs text-on-surface-variant truncate w-32">{user.email}</div>
              </div>
            </div>
          )}
          {navItems.map(n => (
            <button key={n.key} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left w-full ${tab === n.key || (n.key === 'orders' && tab === 'order-detail') ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'text-on-surface-variant hover:bg-white hover:text-primary'}`} onClick={() => { setTab(n.key); setSelectedOrder(null); }}>
              {n.icon} {n.label}
            </button>
          ))}
          {profile?.role === 'admin' && (
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left w-full bg-primary text-white hover:bg-primary/90 shadow-sm mt-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              Admin Portal
            </Link>
          )}
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left w-full text-red-500 hover:bg-red-50 hover:text-red-600 mt-4" onClick={handleLogout}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        </aside>

        <div className="flex-grow bg-white border border-outline-variant/70 rounded-2xl p-6 sm:p-10 shadow-sm w-full">
          {/* Orders tab */}
          {tab === 'orders' && (
            <>
              <h2 className="font-headline-md text-2xl sm:text-3xl font-bold text-on-surface mb-8 border-b border-outline-variant/50 pb-4">Order History</h2>
              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 bg-[#f3f7f5] border border-outline-variant border-dashed rounded-3xl text-center my-8">
                  <svg viewBox="0 0 24 24" className="w-16 h-16 text-on-surface-variant/50 mb-6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
                  <h3 className="font-headline-md text-2xl font-bold text-on-surface mb-2">No orders yet</h3>
                  <p className="text-on-surface-variant mb-8">Start shopping to see your orders here.</p>
                  <Link href="/shop" className="inline-flex items-center justify-center font-bold transition-all duration-300 rounded-xl px-8 py-4 bg-primary text-white hover:bg-primary shadow-md">Browse Books</Link>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {orders.map(o => (
                    <div key={o.id} className="bg-[#f3f7f5] border border-outline-variant rounded-2xl p-6 transition-all hover:border-primary/50 hover:shadow-md">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-outline-variant/50">
                        <div className="text-sm text-on-surface-variant">
                          <strong className="text-on-surface">Order #{o.id}</strong> · {formatDate(o.created_at)}
                          {o.address && <span> · {o.address.city}</span>}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit ${
                          o.status === 'Pending' ? 'bg-amber-100 text-amber-800' : o.status === 'Processing' ? 'bg-teal-100 text-teal-800' : o.status === 'Shipped' ? 'bg-primary/15 text-primary' : o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-surface-container text-on-surface-variant'
                        }`}>{o.status}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
                        <span className="font-bold text-lg text-on-surface">{money(o.total_price)}</span>
                        <button className="inline-flex items-center justify-center font-bold transition-all duration-300 rounded-lg px-4 py-2 text-sm bg-transparent border-2 border-primary text-primary hover:bg-primary/5 w-fit" onClick={() => loadOrderDetail(o.id)}>
                          View details →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Order detail */}
          {tab === 'order-detail' && selectedOrder && (
            <>
              <button className="inline-flex items-center justify-center font-bold transition-all duration-300 rounded-lg px-4 py-2 text-sm bg-transparent border-2 border-outline-variant text-on-surface-variant hover:bg-border mb-6" onClick={() => setTab('orders')}>← Back to orders</button>
              <h2 className="font-headline-md text-2xl sm:text-3xl font-bold text-on-surface mb-2 flex items-center gap-4">
                Order #{selectedOrder.id} 
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit ${
                          selectedOrder.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          selectedOrder.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                          selectedOrder.status === 'Shipped' ? 'bg-indigo-100 text-indigo-800' :
                          selectedOrder.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>{selectedOrder.status}</span>
              </h2>
              <p className="text-on-surface-variant text-sm mb-8">{formatDateTime(selectedOrder.created_at)}</p>

              {selectedOrder.address && (
                <div className="bg-[#f3f7f5] border border-outline-variant rounded-2xl p-6 mb-8">
                  <div className="flex justify-between py-3 text-on-surface-variant border-b border-outline-variant/50"><span>Address</span><span className="font-medium text-on-surface text-right">{selectedOrder.address.full_address}, {selectedOrder.address.city}</span></div>
                  <div className="flex justify-between py-3 text-on-surface-variant border-b border-outline-variant/50"><span>Phone</span><span className="font-medium text-on-surface">{selectedOrder.address.phone}</span></div>
                  <div className="flex justify-between py-3 text-on-surface-variant"><span>WhatsApp</span><span className="font-medium text-on-surface">{selectedOrder.address.whatsapp}</span></div>
                </div>
              )}

              <div className="w-full overflow-x-auto bg-[#f3f7f5] rounded-2xl border border-outline-variant mt-8">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead><tr><th className="px-6 py-4 border-b border-outline-variant bg-primary/5 font-bold text-on-surface text-sm uppercase tracking-wider">Book</th><th className="px-6 py-4 border-b border-outline-variant bg-primary/5 font-bold text-on-surface text-sm uppercase tracking-wider">Qty</th><th className="px-6 py-4 border-b border-outline-variant bg-primary/5 font-bold text-on-surface text-sm uppercase tracking-wider">Price</th><th className="px-6 py-4 border-b border-outline-variant bg-primary/5 font-bold text-on-surface text-sm uppercase tracking-wider">Subtotal</th></tr></thead>
                  <tbody>
                    {orderItems.map(i => (
                      <tr key={i.id} className="hover:bg-white/50 transition-colors">
                        <td className="px-6 py-4 border-b border-outline-variant text-on-surface-variant text-sm font-medium text-on-surface">{i.product?.title || 'Unknown'}</td>
                        <td className="px-6 py-4 border-b border-outline-variant text-on-surface-variant text-sm">{i.quantity}</td>
                        <td className="px-6 py-4 border-b border-outline-variant text-on-surface-variant text-sm">{money(i.price)}</td>
                        <td className="px-6 py-4 border-b border-outline-variant text-on-surface-variant text-sm font-bold text-on-surface">{money(i.price * i.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="font-bold text-xl text-on-surface mt-6 text-right">
                Total: <span className="text-primary">{money(selectedOrder.total_price)}</span>
              </p>
            </>
          )}

          {/* Addresses tab */}
          {tab === 'addresses' && (
            <>
              <h2 className="font-headline-md text-2xl sm:text-3xl font-bold text-on-surface mb-8 border-b border-outline-variant/50 pb-4">Saved Addresses</h2>
              {addresses.map(a => (
                <div key={a.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[#f3f7f5] border border-outline-variant rounded-2xl mb-4">
                  <div className="flex items-start gap-4">
                    <svg className="text-primary mt-1 shrink-0" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <div>
                      <div className="font-bold text-on-surface text-lg">{a.full_address}, {a.city}</div>
                      <div className="text-sm text-on-surface-variant mt-1">{a.phone} · WA: {a.whatsapp}</div>
                    </div>
                  </div>
                  <button className="inline-flex items-center justify-center font-bold transition-all duration-300 rounded-lg px-4 py-2 text-sm bg-transparent border-2 border-red-500 text-red-500 hover:bg-red-50 w-fit" onClick={() => deleteAddress(a.id)}>
                    Delete
                  </button>
                </div>
              ))}

              <h3 className="font-headline-md text-xl font-bold text-on-surface mt-12 mb-6">Add New Address</h3>
              <form onSubmit={addAddress} className="flex flex-col gap-5 max-w-xl">
                <div className="flex flex-col gap-2"><label className="font-medium text-on-surface text-sm">Full Address</label><textarea className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-[#f3f7f5] text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" value={fullAddress} onChange={e => setFullAddress(e.target.value)} rows="2" required /></div>
                <div className="flex flex-col gap-2"><label className="font-medium text-on-surface text-sm">City</label><input className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-[#f3f7f5] text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" value={city} onChange={e => setCity(e.target.value)} required /></div>
                <div className="flex flex-col gap-2"><label className="font-medium text-on-surface text-sm">Phone</label><input className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-[#f3f7f5] text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" value={phone} onChange={e => setPhone(e.target.value)} required /></div>
                <div className="flex flex-col gap-2"><label className="font-medium text-on-surface text-sm">WhatsApp</label><input className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-[#f3f7f5] text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} required /></div>
                <button className="w-fit inline-flex items-center justify-center font-bold transition-all duration-300 rounded-xl px-8 py-4 bg-primary text-white hover:bg-primary shadow-md mt-4">Add Address</button>
              </form>
            </>
          )}

          {/* Profile tab */}
          {tab === 'profile' && profile && (
            <>
              <h2 className="font-headline-md text-2xl sm:text-3xl font-bold text-on-surface mb-8 border-b border-outline-variant/50 pb-4">Profile</h2>
              <div className="bg-[#f3f7f5] border border-outline-variant rounded-2xl p-6 max-w-xl">
                <div className="flex justify-between py-3 text-on-surface-variant border-b border-outline-variant/50"><span>Name</span><span className="font-medium text-on-surface">{profile.name}</span></div>
                <div className="flex justify-between py-3 text-on-surface-variant border-b border-outline-variant/50"><span>Email</span><span className="font-medium text-on-surface">{user.email}</span></div>
                <div className="flex justify-between py-3 text-on-surface-variant"><span>Member since</span><span className="font-medium text-on-surface">{formatDate(profile.created_at)}</span></div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
