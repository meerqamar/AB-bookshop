'use client';
import Link from 'next/link';
import { useState } from 'react';
import { money, discountPercent } from '@/lib/utils';
import { useCart } from './CartProvider';

export default function ProductCard({ product }) {
  const { id, title, author, price, original_price, image, category, in_stock } = product;
  const categoryName = typeof category === 'object' ? category?.name : category;
  const discount = discountPercent(original_price, price);
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!in_stock && in_stock !== undefined && in_stock !== null) return;
    addToCart(id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }


  return (
    <Link href={`/product/${id}`} className="bg-white border border-outline-variant/80 p-2 sm:p-3 rounded-lg group transition-all duration-300 hover:border-primary/30 hover:shadow-[0_12px_28px_rgba(4,120,87,0.1)] hover:-translate-y-0.5 flex flex-col h-full relative">
      {!in_stock && in_stock !== undefined && in_stock !== null && (
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-error/95 text-on-error font-bold px-3 py-1.5 rounded shadow-xl backdrop-blur-sm text-xs sm:text-sm uppercase tracking-wider rotate-[-8deg] pointer-events-none whitespace-nowrap border border-error">Out of Stock</div>
      )}
      <div className={`relative aspect-[3/4] mb-2 sm:mb-3 overflow-hidden rounded-md bg-surface-container ${!in_stock ? 'opacity-50 grayscale-[50%]' : ''}`}>
        {discount > 0 && <span className="absolute top-2 left-2 bg-error text-on-error text-[10px] sm:text-xs font-bold px-2 py-1 rounded shadow-sm z-10 tracking-wide">{discount}% OFF</span>}
        {image ? (
          <img src={image} alt={title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#065f46] via-[#047857] to-[#064e3b] flex flex-col items-center justify-center p-3 text-center text-white shadow-inner">
            <span className="material-symbols-outlined text-[40px] sm:text-[52px] mb-2 text-white/90">auto_stories</span>
            <span className="text-xs sm:text-sm font-bold leading-tight line-clamp-3 text-white/95">{title || categoryName || 'AB Book Shop'}</span>
          </div>
        )}

        <button
          className={`absolute bottom-2 right-2 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow-lg opacity-100 translate-y-0 md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300 btn-focus ${added ? 'bg-green-500 text-white scale-110' : 'bg-primary text-on-primary'}`}
          onClick={handleAddToCart}
          aria-label="Add to cart"
          title="Add to cart"
        >
          <span className="material-symbols-outlined text-[18px] sm:text-[20px]">{added ? 'check' : 'shopping_bag'}</span>
        </button>
      </div>
      <div className="space-y-1 flex flex-col flex-grow px-0.5">
        {categoryName && <span className="text-[10px] sm:text-xs font-semibold text-primary tracking-wider uppercase">{categoryName}</span>}
        <h3 className="text-sm sm:text-base font-bold group-hover:text-primary transition-colors line-clamp-2 leading-snug font-headline-sm">{title || categoryName || 'Featured Book'}</h3>
        {author && <p className="text-xs text-on-surface-variant italic mb-auto line-clamp-1">{author}</p>}

        <div className="flex flex-col pt-1.5 mt-auto">
          <span className="font-bold text-base sm:text-lg text-primary leading-tight">{money(price)}</span>
          {original_price && original_price > price && (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-medium text-on-surface-variant line-through">{money(original_price)}</span>
              <span className="bg-error/10 text-error text-[11px] font-bold px-1.5 py-0.5 rounded leading-none">-{discount}%</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
