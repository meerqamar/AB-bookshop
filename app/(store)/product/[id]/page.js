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

  if (!product) {
    notFound();
  }

  const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;

  return (
    <main className="max-w-container-max mx-auto px-lg py-xl">
      {/* Breadcrumb */}
      <nav className="flex gap-xs text-label-md font-label-md text-on-surface-variant mb-lg">
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

      {/* Product Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-xl">
        {/* Book Cover */}
        <div className="md:col-span-5 lg:col-span-4">
          <div className="sticky top-24">
            <div className="bg-white p-base border border-outline-variant paper-shadow rounded-lg">
              {product.image ? (
                <img 
                  className="w-full h-auto aspect-[2/3] object-cover rounded-sm" 
                  alt={product.title} 
                  src={product.image}
                />
              ) : (
                <div className="w-full aspect-[2/3] flex items-center justify-center bg-surface-container-low text-on-surface-variant/50">
                  <span className="material-symbols-outlined text-[64px]">menu_book</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col">
          <div className="mb-md">
            <h1 className="font-display-lg text-[2rem] md:text-display-lg text-primary mb-xs leading-tight">{product.title}</h1>
            {product.author && <p className="font-headline-sm text-headline-sm text-secondary italic">by {product.author}</p>}
          </div>

          {/* Price & CTA Box */}
          <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl mb-lg grid grid-cols-1 sm:grid-cols-2 gap-md items-center">
            <div>
              <div className="flex items-center gap-sm mb-xs">
                <span className="font-headline-md text-headline-md text-on-surface">{money(product.price)}</span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-label-md font-label-md line-through text-on-surface-variant">{money(product.original_price)}</span>
                )}
                {product.format && <span className="text-label-md font-label-md bg-secondary-container px-sm py-1 rounded-full text-on-secondary-container">{product.format}</span>}
              </div>
              <p className="text-label-md font-label-md text-on-surface-variant">Standard Shipping Available</p>
            </div>
            
            <div className="flex flex-col gap-sm">
              <AddToCartWrapper product={product} />
              <div className="flex justify-between px-xs text-caption font-caption text-on-surface-variant">
                {product.in_stock !== false ? (
                  <span className="flex items-center gap-xs text-secondary"><span className="material-symbols-outlined text-[16px]">check_circle</span> In Stock</span>
                ) : (
                  <span className="flex items-center gap-xs text-error"><span className="material-symbols-outlined text-[16px]">cancel</span> Out of Stock</span>
                )}
                <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-[16px]">local_shipping</span> 2-4 days</span>
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div className="mb-xl">
            <h3 className="font-headline-sm text-headline-sm mb-md flex items-center gap-sm">
              Synopsis <span className="h-px bg-outline-variant flex-grow ml-4"></span>
            </h3>
            <div className="font-body-lg text-body-lg space-y-md text-on-surface leading-relaxed">
              {product.description ? (
                <p className="whitespace-pre-line">{product.description}</p>
              ) : (
                <p className="italic text-on-surface-variant">No description available for this product.</p>
              )}
            </div>
          </div>

          {/* Specifications Grid */}
          <div className="mb-xl">
            <h3 className="font-headline-sm text-headline-sm mb-md flex items-center gap-sm">
              Specifications <span className="h-px bg-outline-variant flex-grow ml-4"></span>
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-md bg-surface-container-low p-md rounded-xl">
              <div className="flex flex-col gap-xs">
                <span className="text-label-md font-label-md text-on-surface-variant">Category</span>
                <span className="text-body-md font-body-md font-bold">{categoryName || 'Uncategorized'}</span>
              </div>
              <div className="flex flex-col gap-xs">
                <span className="text-label-md font-label-md text-on-surface-variant">Language</span>
                <span className="text-body-md font-body-md font-bold">English / Urdu</span>
              </div>
              <div className="flex flex-col gap-xs">
                <span className="text-label-md font-label-md text-on-surface-variant">Stock ID</span>
                <span className="text-body-md font-body-md font-bold truncate">#{String(product.id).substring(0, 8)}</span>
              </div>
              <div className="flex flex-col gap-xs">
                <span className="text-label-md font-label-md text-on-surface-variant">Format</span>
                <span className="text-body-md font-body-md font-bold">{product.format || 'Standard'}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
