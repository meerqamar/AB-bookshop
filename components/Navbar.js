'use client';
import Link from 'next/link';
import { useCart } from './CartProvider';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Navbar() {
  const { cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [user, setUser] = useState(null);
  const searchInputRef = useRef(null);
  const loginRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Check auth state
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Auto-focus search input when modal opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [searchOpen]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { setSearchOpen(false); setLoginOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Close login modal on outside click
  useEffect(() => {
    if (!loginOpen) return;
    const handler = (e) => {
      if (loginRef.current && !loginRef.current.contains(e.target)) setLoginOpen(false);
    };
    setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => document.removeEventListener('mousedown', handler);
  }, [loginOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setAuthLoading(false);
    if (error) {
      setAuthError(error.message);
    } else {
      setLoginOpen(false);
      setEmail('');
      setPassword('');
      router.refresh();
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <>
      <header className={`w-full sticky top-0 bg-surface border-b border-outline-variant z-50 transition-shadow duration-300 ${scrolled ? 'paper-shadow' : ''}`}>
        <nav className="flex justify-between items-center h-20 px-lg max-w-container-max mx-auto w-full">
          <div className="flex items-center gap-md">
            <Link href="/" className="font-display-lg text-[2rem] md:text-[2.5rem] font-bold text-primary tracking-tight">AB Book Shop</Link>
          </div>
          <div className="hidden md:flex items-center gap-lg">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/shop" className="nav-link">Shop</Link>
            <Link href="/cart" className="nav-link">Cart</Link>
          </div>
          <div className="flex items-center gap-sm">
            {/* Search button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-on-surface-variant hover:text-primary transition-all flex items-center justify-center rounded-full hover:bg-surface-container"
              aria-label="Search"
            >
              <span className="material-symbols-outlined">search</span>
            </button>

            {/* Account icon — opens login modal or goes to dashboard */}
            {user ? (
              <div className="relative group">
                <button className="p-2 text-primary hover:bg-surface-container rounded-full flex items-center justify-center transition-all" aria-label="Account">
                  <span className="material-symbols-outlined">account_circle</span>
                </button>
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[300]">
                  <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[18px]">person</span> My Account
                  </Link>
                  <Link href="/dashboard/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[18px]">receipt_long</span> My Orders
                  </Link>
                  <div className="border-t border-gray-100 my-1" />
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">logout</span> Log out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setLoginOpen(true)}
                className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-full flex items-center justify-center transition-all"
                aria-label="Login"
              >
                <span className="material-symbols-outlined">person</span>
              </button>
            )}

            <Link href="/cart" className="relative bg-primary text-on-primary px-md py-2 font-label-md text-label-md btn-focus hover:opacity-90 transition-soft rounded flex items-center gap-2">
              Cart
              {cartCount > 0 && (
                <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-xs font-bold">{cartCount}</span>
              )}
            </Link>
            <button className="md:hidden p-2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center" onClick={() => setMenuOpen(true)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Login Modal */}
      {loginOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}>
          <div
            ref={loginRef}
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 relative"
            style={{ animation: 'slideDown 0.25s ease-out' }}
          >
            {/* Close button */}
            <button
              onClick={() => setLoginOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Log in</h2>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Email <span className="text-red-400">*</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Password <span className="text-red-400">*</span></label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50"
                />
              </div>

              {authError && (
                <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{authError}</p>
              )}

              <Link href="/login#forgot" className="text-sm text-gray-500 hover:text-primary transition-colors -mt-1" onClick={() => setLoginOpen(false)}>
                Forgot your password?
              </Link>

              <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full sm:w-auto flex-1 bg-gray-900 text-white py-3 px-8 rounded-lg font-semibold text-sm hover:bg-gray-700 transition-colors disabled:opacity-60"
                >
                  {authLoading ? 'Logging in...' : 'Log in'}
                </button>
                <Link
                  href="/signup"
                  onClick={() => setLoginOpen(false)}
                  className="text-sm text-gray-600 hover:text-primary transition-colors whitespace-nowrap flex items-center gap-1"
                >
                  New customer? Create your account
                  <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center pt-24 px-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
            style={{ animation: 'slideDown 0.2s ease-out' }}
          >
            <form onSubmit={handleSearch} className="flex items-center gap-3 px-5 py-4">
              <span className="material-symbols-outlined text-primary text-[24px]">search</span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search for books, authors, categories..."
                className="flex-1 text-lg outline-none bg-transparent text-on-surface placeholder-on-surface-variant"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              )}
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap">
                Search
              </button>
            </form>
            <div className="border-t border-gray-100 px-5 py-3 text-xs text-on-surface-variant">
              Press <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">Enter</kbd> to search · <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">Esc</kbd> to close
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu overlay */}
      <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-scrim/50 backdrop-blur-sm" onClick={() => setMenuOpen(false)}></div>
        <div className={`absolute top-0 right-0 bottom-0 w-[280px] bg-surface shadow-2xl transition-transform duration-300 ease-out flex flex-col ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`} onClick={e => e.stopPropagation()}>
          <button className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full flex items-center justify-center" onClick={() => setMenuOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
          <nav className="flex flex-col gap-6 p-8 pt-20 font-body-lg text-body-lg text-on-surface-variant">
            <Link href="/" className="hover:text-primary transition-colors" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/shop" className="hover:text-primary transition-colors" onClick={() => setMenuOpen(false)}>Shop</Link>
            <Link href="/cart" className="hover:text-primary transition-colors" onClick={() => setMenuOpen(false)}>Cart ({cartCount})</Link>
            <div className="w-full h-px bg-outline-variant my-2" />
            {user ? (
              <>
                <Link href="/dashboard" className="hover:text-primary transition-colors" onClick={() => setMenuOpen(false)}>My Account</Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="text-left text-red-500 hover:text-red-700 transition-colors">Log out</button>
              </>
            ) : (
              <button onClick={() => { setMenuOpen(false); setLoginOpen(true); }} className="text-left hover:text-primary transition-colors">Login / Register</button>
            )}
          </nav>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
