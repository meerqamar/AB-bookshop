'use client';
import { useRef } from 'react';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export default function FeaturedCarousel({ products }) {
  const scrollRef = useRef(null);

  function scroll(dir) {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.75;
    scrollRef.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
  }

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-container-max mx-auto px-4 md:px-lg">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-[11px] sm:text-xs text-primary/80 uppercase tracking-[0.2em] font-semibold mb-2">
              Curator&apos;s choice
            </p>
            <h2 className="font-headline-md text-2xl sm:text-3xl md:text-headline-md text-on-surface">
              Featured Books
            </h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link className="hidden sm:inline-flex font-label-md text-sm text-primary font-semibold items-center gap-1 hover:underline" href="/shop">
              View all
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border border-outline-variant bg-white flex items-center justify-center text-on-surface hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
              aria-label="Scroll left"
            >
              <span className="material-symbols-outlined text-[22px]">chevron_left</span>
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border border-outline-variant bg-white flex items-center justify-center text-on-surface hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
              aria-label="Scroll right"
            >
              <span className="material-symbols-outlined text-[22px]">chevron_right</span>
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto hide-scrollbar pb-1 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory"
        >
          {products.map(p => (
            <div key={p.id} className="min-w-[160px] max-w-[160px] sm:min-w-[200px] sm:max-w-[200px] shrink-0 snap-start">
              <ProductCard product={p} />
            </div>
          ))}
        </div>

        <div className="sm:hidden mt-6 text-center">
          <Link href="/shop" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
            View all books
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
