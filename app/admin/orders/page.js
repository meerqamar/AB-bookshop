'use client';
import { useState, useEffect, Fragment } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import { money, formatDate } from '@/lib/utils';

export default function AdminOrdersPage() {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [orderItems, setOrderItems] = useState({});

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    const supabase = createClient();
    const { data } = await supabase
      .from('orders')
      .select('*, profile:profiles(name, role), address:addresses(full_address, city, phone, whatsapp)')
      .order('id', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }

  async function updateStatus(orderId, newStatus) {
    const supabase = createClient();
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) addToast('Update failed', 'error');
    else { addToast(`Order #${orderId} → ${newStatus}`); loadOrders(); }
  }

  async function toggleExpand(orderId) {
    if (expandedId === orderId) { setExpandedId(null); return; }
    if (!orderItems[orderId]) {
      const supabase = createClient();
      const { data } = await supabase
        .from('order_items')
        .select('*, product:products(title)')
        .eq('order_id', orderId);
      setOrderItems(prev => ({ ...prev, [orderId]: data || [] }));
    }
    setExpandedId(orderId);
  }

  if (loading) return <div className="flex justify-center items-center py-24 min-h-[50vh]"><div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin"></div></div>;

  const statuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <>
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-primary/80 mb-2">Sales</p>
        <h1 className="font-headline-md text-3xl text-on-surface">Orders</h1>
      </div>
      <div className="bg-white border border-outline-variant rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead><tr><th className="px-6 py-4 border-b border-outline-variant bg-[#f3f7f5] font-bold text-on-surface text-sm uppercase tracking-wider">#</th><th className="px-6 py-4 border-b border-outline-variant bg-[#f3f7f5] font-bold text-on-surface text-sm uppercase tracking-wider">Customer</th><th className="px-6 py-4 border-b border-outline-variant bg-[#f3f7f5] font-bold text-on-surface text-sm uppercase tracking-wider">Address</th><th className="px-6 py-4 border-b border-outline-variant bg-[#f3f7f5] font-bold text-on-surface text-sm uppercase tracking-wider">Total</th><th className="px-6 py-4 border-b border-outline-variant bg-[#f3f7f5] font-bold text-on-surface text-sm uppercase tracking-wider">Status</th><th className="px-6 py-4 border-b border-outline-variant bg-[#f3f7f5] font-bold text-on-surface text-sm uppercase tracking-wider">Update</th><th className="px-6 py-4 border-b border-outline-variant bg-[#f3f7f5] font-bold text-on-surface text-sm uppercase tracking-wider"></th></tr></thead>
            <tbody>
              {orders.map(o => (
                <Fragment key={o.id}>
                  <tr className="hover:bg-[#f3f7f5]/50 transition-colors border-b border-outline-variant last:border-0">
                    <td className="px-6 py-4"><strong className="text-on-surface">#{o.id}</strong></td>
                    <td className="px-6 py-4">
                      <div className="text-on-surface-variant">{o.profile?.name || '—'}</div>
                    </td>
                    <td className="px-6 py-4 max-w-[200px]">
                      {o.address ? (
                        <div className="text-sm">
                          <div className="text-on-surface">{o.address.city}</div>
                          <div className="text-on-surface-variant">{o.address.phone}</div>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4"><strong className="text-on-surface">{money(o.total_price)}</strong></td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit ${
                        o.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        o.status === 'Processing' ? 'bg-teal-100 text-teal-800' :
                        o.status === 'Shipped' ? 'bg-primary/15 text-primary' :
                        o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-surface-container text-on-surface-variant'
                      }`}>{o.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className="w-[130px] px-3 py-2 text-sm rounded-lg border border-outline-variant bg-[#f3f7f5] text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                        value={o.status}
                        onChange={e => updateStatus(o.id, e.target.value)}
                      >
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        className="inline-flex items-center justify-center font-bold transition-all duration-300 rounded-lg px-3 py-1.5 text-xs bg-transparent border-2 border-primary text-primary hover:bg-primary/5"
                        onClick={() => toggleExpand(o.id)}
                      >
                        {expandedId === o.id ? 'Hide' : 'Details'}
                      </button>
                    </td>
                  </tr>
                  {expandedId === o.id && (
                    <tr key={`${o.id}-detail`}>
                      <td colSpan="7" className="bg-[#f3f7f5] p-6 border-b border-outline-variant">
                        {o.address && (
                          <div className="mb-4 text-sm text-on-surface-variant">
                            <strong className="text-on-surface">Delivery:</strong> {o.address.full_address}, {o.address.city}<br/>
                            <strong className="text-on-surface">Phone:</strong> {o.address.phone} | <strong className="text-on-surface">WhatsApp:</strong> {o.address.whatsapp}
                          </div>
                        )}
                        <div className="text-sm mb-3 text-on-surface-variant">
                          <strong className="text-on-surface">Date:</strong> {formatDate(o.created_at)}
                        </div>
                        <strong className="text-sm text-on-surface block mb-2">Items:</strong>
                        <ul className="list-disc ml-5 text-sm text-on-surface-variant space-y-1">
                          {(orderItems[o.id] || []).map(i => (
                            <li key={i.id}>{i.product?.title || 'Unknown'} × {i.quantity} — {money(i.price * i.quantity)}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {orders.length === 0 && <tr><td colSpan="7" className="px-6 py-8 text-on-surface-variant text-sm text-center italic">No orders</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
