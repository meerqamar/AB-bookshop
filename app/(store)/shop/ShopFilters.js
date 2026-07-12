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
    
    if (newQ) {
      params.set('q', newQ);
    } else {
      params.delete('q');
    }
    
    if (newCat > 0) {
      params.set('category', newCat);
    } else {
      params.delete('category');
    }
    
    router.push(`/shop?${params.toString()}`);
  }

  return (
    <div className="sticky top-24 space-y-md">
      <div className="flex items-center justify-between mb-sm">
        <h2 className="font-headline-sm text-headline-sm">Filters</h2>
        <button 
          className="text-label-md font-label-md text-primary hover:underline"
          onClick={() => { setQ(''); setCat(0); applyFilters('', 0); }}
        >
          Clear all
        </button>
      </div>
      
      {/* Search Filter */}
      <section className="pt-md border-t border-outline-variant">
        <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-sm">Search</h3>
        <div className="flex gap-2">
          <input
            className="w-full bg-surface-container-low border border-outline-variant rounded px-sm py-2 text-body-md focus:border-primary focus:ring-0 outline-none"
            placeholder="Search books..."
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyFilters(q, cat)}
          />
          <button 
            className="bg-primary text-on-primary px-3 py-2 rounded font-label-md hover:bg-primary-container transition-colors flex items-center justify-center btn-focus"
            onClick={() => applyFilters(q, cat)}
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>
        </div>
      </section>

      {/* Genre Filter */}
      <section className="pt-md border-t border-outline-variant mt-md">
        <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-sm">Categories</h3>
        <div className="space-y-xs max-h-64 overflow-y-auto pr-2">
          <label className="flex items-center gap-sm py-xs cursor-pointer group">
            <input 
              className="w-5 h-5 rounded border-outline focus:ring-secondary text-primary" 
              type="radio" 
              name="category"
              checked={cat === 0}
              onChange={() => { setCat(0); applyFilters(q, 0); }}
            />
            <span className="text-body-md group-hover:text-primary transition-colors">All Categories</span>
          </label>
          {categories.map(c => (
            <label key={c.id} className="flex items-center gap-sm py-xs cursor-pointer group">
              <input 
                className="w-5 h-5 rounded border-outline focus:ring-secondary text-primary" 
                type="radio" 
                name="category"
                checked={cat === c.id}
                onChange={() => { setCat(c.id); applyFilters(q, c.id); }}
              />
              <span className="text-body-md group-hover:text-primary transition-colors">{c.name}</span>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
