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

  if (loading) return <div className="flex justify-center items-center py-24 min-h-[50vh]"><div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div></div>;

  const statuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <>
      <h2 className="font-display text-3xl font-extrabold text-text-primary mb-8">Orders</h2>
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead><tr><th className="px-6 py-4 border-b border-border bg-primary-light/5 font-bold text-text-primary text-sm uppercase tracking-wider">#</th><th className="px-6 py-4 border-b border-border bg-primary-light/5 font-bold text-text-primary text-sm uppercase tracking-wider">Customer</th><th className="px-6 py-4 border-b border-border bg-primary-light/5 font-bold text-text-primary text-sm uppercase tracking-wider">Address</th><th className="px-6 py-4 border-b border-border bg-primary-light/5 font-bold text-text-primary text-sm uppercase tracking-wider">Total</th><th className="px-6 py-4 border-b border-border bg-primary-light/5 font-bold text-text-primary text-sm uppercase tracking-wider">Status</th><th className="px-6 py-4 border-b border-border bg-primary-light/5 font-bold text-text-primary text-sm uppercase tracking-wider">Update</th><th className="px-6 py-4 border-b border-border bg-primary-light/5 font-bold text-text-primary text-sm uppercase tracking-wider"></th></tr></thead>
            <tbody>
              {orders.map(o => (
                <Fragment key={o.id}>
                  <tr className="hover:bg-background/50 transition-colors border-b border-border last:border-0">
                    <td className="px-6 py-4"><strong className="text-text-primary">#{o.id}</strong></td>
                    <td className="px-6 py-4">
                      <div className="text-text-secondary">{o.profile?.name || '—'}</div>
                    </td>
                    <td className="px-6 py-4 max-w-[200px]">
                      {o.address ? (
                        <div className="text-sm">
                          <div className="text-text-primary">{o.address.city}</div>
                          <div className="text-text-secondary">{o.address.phone}</div>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4"><strong className="text-text-primary">{money(o.total_price)}</strong></td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit ${
                        o.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        o.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                        o.status === 'Shipped' ? 'bg-indigo-100 text-indigo-800' :
                        o.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>{o.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className="w-[130px] px-3 py-2 text-sm rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
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
                      <td colSpan="7" className="bg-primary-light/5 p-6 border-b border-border">
                        {o.address && (
                          <div className="mb-4 text-sm text-text-secondary">
                            <strong className="text-text-primary">Delivery:</strong> {o.address.full_address}, {o.address.city}<br/>
                            <strong className="text-text-primary">Phone:</strong> {o.address.phone} | <strong className="text-text-primary">WhatsApp:</strong> {o.address.whatsapp}
                          </div>
                        )}
                        <div className="text-sm mb-3 text-text-secondary">
                          <strong className="text-text-primary">Date:</strong> {formatDate(o.created_at)}
                        </div>
                        <strong className="text-sm text-text-primary block mb-2">Items:</strong>
                        <ul className="list-disc ml-5 text-sm text-text-secondary space-y-1">
                          {(orderItems[o.id] || []).map(i => (
                            <li key={i.id}>{i.product?.title || 'Unknown'} × {i.quantity} — {money(i.price * i.quantity)}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {orders.length === 0 && <tr><td colSpan="7" className="px-6 py-8 text-text-secondary text-sm text-center italic">No orders</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
