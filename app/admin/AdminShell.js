'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { logoutAndRedirect } from '@/lib/auth';

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      if (pathname === '/admin/login') {
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/admin/login'); return; }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (!profile || profile.role !== 'admin') {
        router.push('/');
        return;
      }
      setAuthorized(true);
      setLoading(false);
    }
    checkAdmin();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f3f7f5]">
        <div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!authorized) return null;

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
    { href: '/admin/products', label: 'Products', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 006.5 22h11a2.5 2.5 0 002.5-2.5V6.5A2.5 2.5 0 0017.5 4h-11A2.5 2.5 0 004 6.5v13z"/><path d="M8 8h8"/></svg> },
    { href: '/admin/categories', label: 'Categories', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg> },
    { href: '/admin/orders', label: 'Orders', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg> },
    { href: '/admin/users', label: 'Users', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
    { href: '/admin/settings', label: 'Settings', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> },
  ];

  async function handleLogout() {
    await logoutAndRedirect('/');
  }

  return (
    <div className="min-h-screen bg-[#f3f7f5] flex flex-col md:flex-row relative">
      {menuOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setMenuOpen(false)} />
      )}

      <div className="md:hidden flex items-center justify-between p-4 bg-[#064e3b] text-white shadow-md z-20 sticky top-0">
        <span className="font-display-lg font-bold text-xl tracking-tight">AB Admin</span>
        <button className="p-2 rounded-lg hover:bg-white/10" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        </button>
      </div>

      <aside className={`fixed inset-y-0 left-0 transform ${menuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} md:relative md:translate-x-0 w-64 bg-white border-r border-outline-variant/70 z-30 transition-transform duration-300 ease-in-out flex flex-col`}>
        <div className="flex items-center gap-3 p-6 border-b border-outline-variant/60">
          <span className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-sm font-bold shadow-[0_6px_16px_rgba(4,120,87,0.3)]">AB</span>
          <div>
            <div className="font-display-lg font-bold text-lg text-on-surface leading-tight">AB Book Shop</div>
            <div className="text-[11px] uppercase tracking-wider text-primary font-semibold">Admin</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1.5 p-4 flex-grow overflow-y-auto">
          {navItems.map(item => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${active ? 'bg-primary/10 text-primary font-semibold' : 'text-on-surface-variant hover:bg-[#f3f7f5] hover:text-primary'}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
          <div className="h-px bg-outline-variant/60 my-3" />
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-on-surface-variant hover:bg-[#f3f7f5] hover:text-primary transition-all" onClick={() => setMenuOpen(false)}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            View Store
          </Link>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left w-full text-red-500 hover:bg-red-50 hover:text-red-600 mt-1" onClick={handleLogout}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        </nav>
      </aside>

      <div className="flex-grow p-5 sm:p-8 lg:p-10 w-full overflow-x-hidden md:w-[calc(100%-16rem)]">
        {children}
      </div>
    </div>
  );
}
