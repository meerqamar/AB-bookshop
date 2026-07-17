'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function ShopFilters({ categories, currentQ, currentCategory }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(currentQ);
  const [cat, setCat] = useState(currentCategory);

  function applyFilters(newQ, newCat) {
    const params = new URLSearchParams(searchParams.toString());
    if (newQ) params.set('q', newQ);
    else params.delete('q');
    if (newCat > 0) params.set('category', newCat);
    else params.delete('category');
    router.push(`/shop?${params.toString()}`);
  }

  return (
    <div className="sticky top-24 bg-white border border-outline-variant/80 rounded-2xl p-5 shadow-[0_8px_24px_rgba(4,120,87,0.06)] space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-headline-sm text-lg text-on-surface">Filters</h2>
        <button
          className="text-xs font-semibold text-primary hover:underline"
          onClick={() => { setQ(''); setCat(0); applyFilters('', 0); }}
        >
          Clear all
        </button>
      </div>

      <section>
        <h3 className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Search</h3>
        <div className="flex gap-2">
          <input
            className="w-full bg-[#f3f7f5] border border-outline-variant rounded-xl px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all"
            placeholder="Search books..."
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyFilters(q, cat)}
          />
          <button
            className="bg-primary text-white px-3 py-2.5 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center shrink-0"
            onClick={() => applyFilters(q, cat)}
            aria-label="Search"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>
        </div>
      </section>

      <section className="pt-4 border-t border-outline-variant/70">
        <h3 className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Categories</h3>
        <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => { setCat(0); applyFilters(q, 0); }}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${cat === 0 ? 'bg-primary/10 text-primary font-semibold' : 'text-on-surface hover:bg-[#f3f7f5]'}`}
          >
            All Categories
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => { setCat(c.id); applyFilters(q, c.id); }}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${cat === c.id ? 'bg-primary/10 text-primary font-semibold' : 'text-on-surface hover:bg-[#f3f7f5]'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
