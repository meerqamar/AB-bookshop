'use client';
import Link from 'next/link';
import { money, discountPercent } from '@/lib/utils';

export default function ProductCard({ product }) {
  const { id, title, author, price, original_price, image, category, in_stock } = product;
  const categoryName = typeof category === 'object' ? category?.name : category;
  const discount = discountPercent(original_price, price);

  return (
    <Link href={`/product/${id}`} className="bg-surface-container-lowest border border-outline-variant p-sm paper-shadow group transition-all hover-lift flex flex-col h-full relative">
      {!in_stock && in_stock !== undefined && in_stock !== null && (
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-error/95 text-on-error font-bold px-4 py-2 rounded shadow-xl backdrop-blur-sm text-sm uppercase tracking-wider rotate-[-8deg] pointer-events-none whitespace-nowrap border border-error">Out of Stock</div>
      )}
      <div className={`relative aspect-[3/4] mb-md overflow-hidden bg-surface-container ${!in_stock ? 'opacity-50 grayscale-[50%]' : ''}`}>
        {discount > 0 && <span className="absolute top-3 left-3 bg-error text-on-error text-xs font-bold px-2.5 py-1.5 rounded shadow-sm z-10 tracking-wide">{discount}% OFF</span>}
        {image ? (
          <img src={image} alt={title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-on-surface-variant/50">
            <span className="material-symbols-outlined text-[48px]">menu_book</span>
          </div>
        )}
        <button className="absolute bottom-md right-md bg-primary text-on-primary w-12 h-12 flex items-center justify-center rounded shadow-lg opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-300 btn-focus" onClick={(e) => {
          e.preventDefault();
          // Assuming cart adding is handled here or elsewhere
        }} aria-label="Add to cart">
          <span className="material-symbols-outlined">add_shopping_cart</span>
        </button>
      </div>
      <div className="space-y-xs flex flex-col flex-grow">
        {categoryName && <span className="font-label-md text-label-md text-primary tracking-widest uppercase">{categoryName}</span>}
        <h3 className="font-headline-sm text-[1.25rem] md:text-headline-sm group-hover:text-primary transition-colors line-clamp-2">{title}</h3>
        {author && <p className="font-body-md text-body-md text-on-surface-variant italic mb-auto">{author}</p>}
        <div className="flex items-center gap-2 pt-sm mt-auto">
          <span className="font-bold text-body-lg text-on-surface">{money(price)}</span>
          {original_price && original_price > price && (
            <span className="text-sm font-medium text-on-surface-variant line-through">{money(original_price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
