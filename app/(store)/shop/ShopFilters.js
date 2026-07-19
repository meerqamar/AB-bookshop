'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ShopFilters({ categories, currentQ, currentCategory }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(currentQ);
  const cat = currentCategory || 0;
  const sort = searchParams.get('sort') || 'newest';
  const hasActive = Boolean(currentQ) || cat > 0 || sort !== 'newest';

  // Keep input in sync with the URL (e.g. after Clear or browser back)
  useEffect(() => {
    setQ(currentQ || '');
  }, [currentQ]);

  function pushParams({ nextQ = q, nextCat = cat, nextSort = sort } = {}) {
    const params = new URLSearchParams();
    const trimmed = typeof nextQ === 'string' ? nextQ.trim() : '';
    if (trimmed) params.set('q', trimmed);
    if (nextCat > 0) params.set('category', String(nextCat));
    if (nextSort && nextSort !== 'newest') params.set('sort', nextSort);
    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : '/shop');
  }

  function clearAll() {
    setQ('');
    router.push('/shop');
  }

  function handleSearchChange(e) {
    const value = e.target.value;
    setQ(value);
    // Clearing the box should restore the full catalog immediately
    if (!value.trim() && currentQ) {
      pushParams({ nextQ: '' });
    }
  }

  return (
    <div className="bg-white border border-outline-variant/80 rounded-2xl p-3 sm:p-4 shadow-[0_8px_24px_rgba(4,120,87,0.06)]">
      <div className="flex flex-col gap-2.5 sm:gap-3">
        <div className="flex gap-2">
          <div className="relative flex-1 min-w-0">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">
              search
            </span>
            <input
              className="w-full bg-[#f3f7f5] border border-outline-variant rounded-xl pl-10 pr-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all"
              placeholder="Search books..."
              value={q}
              onChange={handleSearchChange}
              onKeyDown={(e) => e.key === 'Enter' && pushParams({ nextQ: q })}
              aria-label="Search books"
            />
          </div>
          <button
            type="button"
            className="bg-primary text-white px-3.5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center shrink-0"
            onClick={() => pushParams({ nextQ: q })}
            aria-label="Search"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2">
          <select
            className="w-full sm:flex-1 sm:min-w-0 bg-[#f3f7f5] border border-outline-variant rounded-xl px-3 py-2.5 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none cursor-pointer text-on-surface"
            value={cat}
            onChange={(e) => pushParams({ nextCat: Number(e.target.value) || 0 })}
            aria-label="Category"
          >
            <option value={0}>All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="w-full sm:flex-1 sm:min-w-0 bg-[#f3f7f5] border border-outline-variant rounded-xl px-3 py-2.5 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none cursor-pointer text-on-surface"
            value={sort}
            onChange={(e) => pushParams({ nextSort: e.target.value })}
            aria-label="Sort by"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

          {hasActive && (
            <button
              type="button"
              onClick={clearAll}
              className="col-span-2 sm:col-span-1 sm:w-auto text-xs font-semibold text-primary hover:underline py-1 sm:px-2 shrink-0"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
