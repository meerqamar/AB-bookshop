import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import AddToCartWrapper from './AddToCartWrapper';
import { money } from '@/lib/utils';
import Link from 'next/link';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('title, author, description, image, price')
    .eq('id', resolvedParams.id)
    .single();

  if (!product) return { title: 'Book Not Found' };

  return {
    title: product.title,
    description: product.description
      ? product.description.slice(0, 160)
      : `Buy "${product.title}" by ${product.author || 'AB Book Shop'} with Cash on Delivery in Pakistan.`,
    openGraph: {
      title: `${product.title} | AB Book Shop`,
      description: `Buy "${product.title}" online with Cash on Delivery in Pakistan.`,
      images: product.image ? [{ url: product.image, alt: product.title }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      images: product.image ? [product.image] : [],
    },
  };
}

export default async function ProductPage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('*, category:categories(name)')
    .eq('id', id)
    .single();

  if (!product) notFound();

  const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;

  return (
    <main className="min-h-screen bg-[#f3f7f5]">
      <div className="max-w-container-max mx-auto px-4 md:px-lg py-8 md:py-12">
        <nav className="flex flex-wrap gap-1.5 text-sm text-on-surface-variant mb-6 md:mb-8">
          <Link className="hover:text-primary transition-colors" href="/">Home</Link>
          <span>/</span>
          <Link className="hover:text-primary transition-colors" href="/shop">Shop</Link>
          <span>/</span>
          {categoryName && (
            <>
              <Link className="hover:text-primary transition-colors" href={`/shop?category=${product.category_id}`}>{categoryName}</Link>
              <span>/</span>
            </>
          )}
          <span className="text-on-surface line-clamp-1 flex-1">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          <div className="md:col-span-5 lg:col-span-4">
            <div className="sticky top-24">
              <div className="bg-white p-3 sm:p-4 border border-outline-variant/80 rounded-2xl shadow-[0_12px_32px_rgba(4,120,87,0.08)] overflow-hidden">
                {product.image ? (
                  <img
                    className="w-full h-auto aspect-[2/3] object-cover rounded-xl"
                    alt={product.title}
                    src={product.image}
                  />
                ) : (
                  <div className="w-full aspect-[2/3] flex items-center justify-center bg-primary-container text-primary rounded-xl">
                    <span className="material-symbols-outlined text-[64px]">menu_book</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-7 lg:col-span-8 flex flex-col">
            {categoryName && (
              <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-primary mb-2">{categoryName}</p>
            )}
            <h1 className="font-display-lg text-[1.75rem] sm:text-[2rem] md:text-display-lg text-on-surface mb-2 leading-tight">
              {product.title}
            </h1>
            {product.author && (
              <p className="font-headline-sm text-lg text-on-surface-variant italic mb-6">by {product.author}</p>
            )}

            <div className="bg-white border border-outline-variant/80 p-5 sm:p-6 rounded-2xl mb-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline gap-2 mb-1">
                    <span className="font-headline-md text-2xl sm:text-3xl text-primary font-bold">{money(product.price)}</span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-sm line-through text-on-surface-variant">{money(product.original_price)}</span>
                    )}
                    {product.format && (
                      <span className="text-xs font-semibold bg-primary-container text-on-primary-container px-2.5 py-1 rounded-full">
                        {product.format}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-on-surface-variant">Cash on Delivery available nationwide</p>
                </div>
                <div className="sm:w-56 flex flex-col gap-3">
                  <AddToCartWrapper product={product} />
                  <div className="flex justify-between text-xs text-on-surface-variant px-0.5">
                    {product.in_stock !== false ? (
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span> In Stock
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-error font-medium">
                        <span className="material-symbols-outlined text-[16px]">cancel</span> Out of Stock
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">local_shipping</span> 2–4 days
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-headline-sm text-xl text-on-surface mb-4">Synopsis</h3>
              <div className="bg-white border border-outline-variant/60 rounded-2xl p-5 sm:p-6 text-base text-on-surface leading-relaxed">
                {product.description ? (
                  <p className="whitespace-pre-line">{product.description}</p>
                ) : (
                  <p className="italic text-on-surface-variant">No description available for this product.</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-headline-sm text-xl text-on-surface mb-4">Specifications</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-white border border-outline-variant/60 p-4 sm:p-5 rounded-2xl">
                {[
                  ['Category', categoryName || 'Uncategorized'],
                  ['Language', 'English / Urdu'],
                  ['Stock ID', `#${String(product.id).substring(0, 8)}`],
                  ['Format', product.format || 'Standard'],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-1 p-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">{label}</span>
                    <span className="text-sm font-bold text-on-surface truncate">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
