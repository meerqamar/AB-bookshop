'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminLayout({ children }) {
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
    return <div className="min-h-screen flex flex-col items-center justify-center"><div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div></div>;
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
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative">
      {/* Mobile overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setMenuOpen(false)}></div>
      )}

      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-primary text-white shadow-md z-20 sticky top-0">
        <span className="font-display font-bold text-xl tracking-wider">AB Admin</span>
        <button className="p-2 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg text-white" onClick={() => setMenuOpen(!menuOpen)}>
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 transform ${menuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} md:relative md:translate-x-0 w-64 bg-card border-r border-border z-30 transition-transform duration-300 ease-in-out flex flex-col`}>
        <div className="flex items-center gap-3 p-6 border-b border-border/50 font-display font-extrabold text-xl text-text-primary uppercase tracking-wider">
          <span className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-sm shadow-md">AB</span>
          Admin Panel
        </div>
        <nav className="flex flex-col gap-2 p-4 flex-grow overflow-y-auto">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${pathname === item.href ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'text-text-secondary hover:bg-primary-light/10 hover:text-primary'}`}
              onClick={() => setMenuOpen(false)}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          <div className="h-px bg-border/50 my-2" />
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-text-secondary hover:bg-primary-light/10 hover:text-primary transition-all" onClick={() => setMenuOpen(false)}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            View Store
          </Link>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left w-full text-red-500 hover:bg-red-50 hover:text-red-600 mt-2" onClick={handleLogout}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        </nav>
      </aside>

      <div className="flex-grow p-6 sm:p-10 w-full overflow-x-hidden md:w-[calc(100%-16rem)]">
        {children}
      </div>
    </div>
  );
}
