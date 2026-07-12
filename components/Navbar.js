'use client';
import Link from 'next/link';
import { useCart } from './CartProvider';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className={`w-full sticky top-0 bg-surface border-b border-outline-variant z-50 transition-shadow duration-300 ${scrolled ? 'paper-shadow' : ''}`}>
        <nav className="flex justify-between items-center h-20 px-lg max-w-container-max mx-auto w-full">
          <div className="flex items-center gap-md">
            <Link href="/" className="font-display-lg text-[2rem] md:text-[2.5rem] font-bold text-primary tracking-tight">AB Book Shop</Link>
          </div>
          <div className="hidden md:flex items-center gap-lg">
            <Link href="/" className="font-body-lg text-body-lg text-primary hover:border-b-2 hover:border-secondary-container pb-1 transition-colors">Home</Link>
            <Link href="/shop" className="font-body-lg text-body-lg text-on-surface-variant hover:text-primary transition-colors">Shop</Link>
            <Link href="/cart" className="font-body-lg text-body-lg text-on-surface-variant hover:text-primary transition-colors">Cart</Link>
          </div>
          <div className="flex items-center gap-sm">
            <Link href="/shop" className="p-2 text-on-surface-variant hover:text-primary transition-all flex items-center justify-center">
              <span className="material-symbols-outlined">search</span>
            </Link>
            <Link href="/dashboard" className="hidden sm:inline-block font-label-md text-label-md text-primary px-sm py-2 hover:bg-surface-container transition-colors rounded">Account</Link>
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
            <Link href="/dashboard" className="hover:text-primary transition-colors" onClick={() => setMenuOpen(false)}>My Account</Link>
            <Link href="/login" className="hover:text-primary transition-colors" onClick={() => setMenuOpen(false)}>Login</Link>
          </nav>
        </div>
      </div>
    </>
  );
}
