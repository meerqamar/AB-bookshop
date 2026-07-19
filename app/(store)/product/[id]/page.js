import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import AddToCartWrapper from './AddToCartWrapper';
import { money } from '@/lib/utils';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import {
  absoluteUrl,
  breadcrumbJsonLd,
  productJsonLd,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
} from '@/lib/seo';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('title, author, description, image, price')
    .eq('id', resolvedParams.id)
    .single();

  if (!product) return { title: 'Book Not Found', robots: { index: false, follow: false } };

  const description = product.description
    ? product.description.slice(0, 160)
    : `Buy "${product.title}" by ${product.author || SITE_NAME} with Cash on Delivery in Pakistan.`;
  const path = `/product/${resolvedParams.id}`;

  return {
    title: product.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: 'en_PK',
      url: absoluteUrl(path),
      siteName: SITE_NAME,
      title: `${product.title} | ${SITE_NAME}`,
      description,
      images: product.image
        ? [{ url: product.image, alt: product.title }]
        : [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description,
      images: product.image ? [product.image] : [DEFAULT_OG_IMAGE.url],
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

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
  ];
  if (categoryName && product.category_id) {
    crumbs.push({ name: categoryName, path: `/shop?category=${product.category_id}` });
  }
  crumbs.push({ name: product.title, path: `/product/${product.id}` });

  return (
    <main className="min-h-screen bg-[#f3f7f5]">
      <JsonLd data={[productJsonLd(product, categoryName), breadcrumbJsonLd(crumbs)]} />
      <div className="max-w-container-max mx-auto px-4 md:px-lg py-8 md:py-12">
        <nav className="flex flex-wrap gap-1.5 text-sm text-on-surface-variant mb-6 md:mb-8" aria-label="Breadcrumb">
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
                  <div className="mx-auto w-full max-w-[220px] sm:max-w-[280px] md:max-w-none flex items-center justify-center bg-[#f3f7f5] rounded-xl">
                    <img
                      className="w-full max-h-[42vh] sm:max-h-[48vh] md:max-h-none h-auto md:aspect-[2/3] object-contain md:object-cover rounded-xl"
                      alt={product.title}
                      src={product.image}
                    />
                  </div>
                ) : (
                  <div className="mx-auto w-full max-w-[220px] sm:max-w-[280px] md:max-w-none aspect-[2/3] flex items-center justify-center bg-primary-container text-primary rounded-xl">
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
              <h2 className="font-headline-sm text-xl text-on-surface mb-4">Synopsis</h2>
              <div className="bg-white border border-outline-variant/60 rounded-2xl p-5 sm:p-6 text-base text-on-surface leading-relaxed">
                {product.description ? (
                  <p className="whitespace-pre-line">{product.description}</p>
                ) : (
                  <p className="italic text-on-surface-variant">No description available for this product.</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="font-headline-sm text-xl text-on-surface mb-4">Specifications</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white border border-outline-variant/60 p-4 sm:p-5 rounded-2xl">
                {[
                  ['Category', categoryName || 'Uncategorized'],
                  ['Language', 'English / Urdu'],
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
