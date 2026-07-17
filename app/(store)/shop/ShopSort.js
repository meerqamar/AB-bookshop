'use client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ShopSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'newest';

  function handleSortChange(e) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    router.push(`/shop?${params.toString()}`);
  }

  return (
    <select
      className="bg-white border border-outline-variant rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none cursor-pointer text-on-surface shadow-sm"
      value={currentSort}
      onChange={handleSortChange}
    >
      <option value="newest">Newest Arrivals</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
    </select>
  );
}
