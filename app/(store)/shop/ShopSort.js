'use client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ShopSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'newest';

  function handleSortChange(e) {
    const newSort = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort);
    router.push(`/shop?${params.toString()}`);
  }

  return (
    <select 
      className="bg-surface border border-outline-variant rounded px-md py-sm font-body-md focus:border-primary focus:ring-0 outline-none cursor-pointer text-on-surface"
      value={currentSort}
      onChange={handleSortChange}
    >
      <option value="newest">Newest Arrivals</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
    </select>
  );
}
