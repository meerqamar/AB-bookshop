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
    <section className="py-8 bg-white">
      <div className="max-w-container-max mx-auto px-4 md:px-lg">
        <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-1">Curator's Choice</p>
        <div className="flex items-center justify-between mb-6 gap-2">
          <h2 className="font-headline-md text-xl sm:text-[1.75rem] font-bold text-on-surface">Featured Books</h2>
          <div className="flex items-center gap-3">
            <Link className="font-label-md text-label-md text-primary flex items-center gap-1 hover:underline" href="/shop">
              View All →
            </Link>
            {/* Arrow buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 shadow-sm"
                aria-label="Scroll left"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 shadow-sm"
                aria-label="Scroll right"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal scrollable row */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map(p => (
            <div key={p.id} className="min-w-[160px] max-w-[160px] sm:min-w-[200px] sm:max-w-[200px] shrink-0">
              <ProductCard product={p} />
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
