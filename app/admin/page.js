'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { money, formatDate } from '@/lib/utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [products, categories, orders, users, delivered, recentOrders] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'user'),
        supabase.from('orders').select('total_price').eq('status', 'Delivered'),
        supabase.from('orders').select('*, profile:profiles(name)').order('id', { ascending: false }).limit(10),
      ]);
      const revenue = (delivered.data || []).reduce((sum, o) => sum + Number(o.total_price), 0);
      setStats({
        products: products.count || 0,
        categories: categories.count || 0,
        orders: orders.count || 0,
        users: users.count || 0,
        revenue,
      });
      setRecent(recentOrders.data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="flex justify-center items-center py-24 min-h-[50vh]"><div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div></div>;

  const statCards = [
    { label: 'Products', value: stats.products, color: 'bg-teal-500', icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 006.5 22h11a2.5 2.5 0 002.5-2.5V6.5A2.5 2.5 0 0017.5 4h-11A2.5 2.5 0 004 6.5v13z"/><path d="M8 8h8"/></svg> },
    { label: 'Categories', value: stats.categories, color: 'bg-blue-500', icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg> },
    { label: 'Orders', value: stats.orders, color: 'bg-amber-500', icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg> },
    { label: 'Users', value: stats.users, color: 'bg-purple-500', icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
    { label: 'Revenue (Delivered)', value: money(stats.revenue), color: 'bg-emerald-500', icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
  ];

  return (
    <>
      <h2 className="font-display text-3xl font-extrabold text-text-primary mb-8">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
        {statCards.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shrink-0 shadow-inner ${s.color}`}>{s.icon}</div>
            <div>
              <div className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-1">{s.label}</div>
              <div className="text-2xl font-bold text-text-primary">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
        <h3 className="font-display text-xl font-bold text-text-primary mb-6 border-b border-border/50 pb-4">Recent Orders</h3>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead><tr><th className="px-6 py-4 border-b border-border bg-primary-light/5 font-bold text-text-primary text-sm uppercase tracking-wider">#</th><th className="px-6 py-4 border-b border-border bg-primary-light/5 font-bold text-text-primary text-sm uppercase tracking-wider">Customer</th><th className="px-6 py-4 border-b border-border bg-primary-light/5 font-bold text-text-primary text-sm uppercase tracking-wider">Total</th><th className="px-6 py-4 border-b border-border bg-primary-light/5 font-bold text-text-primary text-sm uppercase tracking-wider">Status</th><th className="px-6 py-4 border-b border-border bg-primary-light/5 font-bold text-text-primary text-sm uppercase tracking-wider">Date</th></tr></thead>
            <tbody>
              {recent.map(o => (
                <tr key={o.id} className="hover:bg-background/50 transition-colors">
                  <td className="px-6 py-4 border-b border-border text-text-secondary text-sm font-medium text-text-primary">#{o.id}</td>
                  <td className="px-6 py-4 border-b border-border text-text-secondary text-sm">{o.profile?.name || '—'}</td>
                  <td className="px-6 py-4 border-b border-border text-text-secondary text-sm font-bold text-text-primary">{money(o.total_price)}</td>
                  <td className="px-6 py-4 border-b border-border text-text-secondary text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit ${
                      o.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      o.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                      o.status === 'Shipped' ? 'bg-indigo-100 text-indigo-800' :
                      o.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>{o.status}</span>
                  </td>
                  <td className="px-6 py-4 border-b border-border text-text-secondary text-sm">{formatDate(o.created_at)}</td>
                </tr>
              ))}
              {recent.length === 0 && <tr><td colSpan="5" className="px-6 py-8 border-b border-border text-text-secondary text-sm text-center italic">No orders yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
