import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export default function FeaturedCarousel({ products }) {
  if (!products?.length) return null;

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
          <Link
            className="hidden sm:inline-flex font-label-md text-sm text-primary font-semibold items-center gap-1 hover:underline shrink-0"
            href="/shop"
          >
            View all
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
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
