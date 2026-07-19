'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { money, formatDate } from '@/lib/utils';

function statusClass(status) {
  if (status === 'Pending') return 'bg-amber-100 text-amber-800';
  if (status === 'Processing') return 'bg-teal-100 text-teal-800';
  if (status === 'Shipped') return 'bg-primary/15 text-primary';
  if (status === 'Delivered') return 'bg-emerald-100 text-emerald-800';
  return 'bg-surface-container text-on-surface-variant';
}

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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Products', value: stats.products, href: '/admin/products', icon: 'menu_book' },
    { label: 'Categories', value: stats.categories, href: '/admin/categories', icon: 'folder' },
    { label: 'Orders', value: stats.orders, href: '/admin/orders', icon: 'receipt_long' },
    { label: 'Customers', value: stats.users, href: '/admin/users', icon: 'group' },
    { label: 'Revenue', value: money(stats.revenue), href: '/admin/orders', icon: 'payments' },
  ];

  return (
    <>
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-primary/80 mb-2">Overview</p>
        <h1 className="font-headline-md text-3xl text-on-surface">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {statCards.map(s => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white border border-outline-variant/70 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-[0_10px_28px_rgba(4,120,87,0.1)] hover:border-primary/30 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">{s.icon}</span>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-0.5">{s.label}</div>
              <div className="text-xl font-bold text-on-surface truncate">{s.value}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white border border-outline-variant/70 rounded-2xl p-5 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-outline-variant/60">
          <h2 className="font-headline-md text-xl text-on-surface">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-semibold text-primary hover:underline">View all</Link>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr>
                {['#', 'Customer', 'Total', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-4 py-3 border-b border-outline-variant/60 bg-[#f3f7f5] text-xs font-semibold uppercase tracking-wider text-on-surface-variant first:rounded-tl-xl last:rounded-tr-xl">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map(o => (
                <tr key={o.id} className="hover:bg-[#f3f7f5]/60 transition-colors">
                  <td className="px-4 py-3.5 border-b border-outline-variant/40 text-sm font-semibold text-on-surface">#{o.id}</td>
                  <td className="px-4 py-3.5 border-b border-outline-variant/40 text-sm text-on-surface-variant">{o.profile?.name || '—'}</td>
                  <td className="px-4 py-3.5 border-b border-outline-variant/40 text-sm font-bold text-primary">{money(o.total_price)}</td>
                  <td className="px-4 py-3.5 border-b border-outline-variant/40 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass(o.status)}`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3.5 border-b border-outline-variant/40 text-sm text-on-surface-variant">{formatDate(o.created_at)}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-10 text-sm text-center text-on-surface-variant italic">No orders yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
