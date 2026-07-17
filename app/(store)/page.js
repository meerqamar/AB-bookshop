import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import FeaturedCarousel from '@/components/FeaturedCarousel';

export const metadata = {
  title: 'Home',
  description: 'AB Book Shop — Pakistan\'s trusted online bookshop. Buy MDCAT, CSS, PPSC, Islamic, and kids books with Cash on Delivery across Pakistan.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'AB Book Shop — Buy Books Online with Cash on Delivery in Pakistan',
    description: 'Shop from a wide range of academic, entry-test, Islamic and kids books. Fast delivery, Cash on Delivery available.',
    url: 'https://ab-bookshop.vercel.app',
    images: [{ url: '/Heroimage.jpeg', width: 1200, height: 630, alt: 'AB Book Shop' }],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BookStore',
  name: 'AB Book Shop',
  description: 'Pakistan\'s trusted online bookshop offering academic, entry-test, Islamic, and kids books with Cash on Delivery.',
  url: 'https://ab-bookshop.vercel.app',
  logo: 'https://ab-bookshop.vercel.app/Heroimage.jpeg',
  image: 'https://ab-bookshop.vercel.app/Heroimage.jpeg',
  priceRange: '$$',
  paymentAccepted: 'Cash on Delivery',
  currenciesAccepted: 'PKR',
  areaServed: 'Pakistan',
  address: { '@type': 'PostalAddress', addressCountry: 'PK' },
  sameAs: [],
};

export default async function HomePage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .limit(8);

  const { data: featured } = await supabase
    .from('products')
    .select('*, category:categories(name)')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(8);

  let products = featured;
  if (!products || products.length === 0) {
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(name)')
      .order('created_at', { ascending: false })
      .limit(8);
    products = data;
  }

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="w-full bg-white md:h-[calc(100dvh-5rem)] md:min-h-[480px] md:max-h-[900px] md:overflow-hidden">
        <img
          src="/Heroimage.jpeg"
          alt="AB Book Shop - Books that Inspire, Knowledge that Empowers"
          className="w-full h-auto block md:h-full md:object-cover md:object-center animate-fade-in"
          loading="eager"
        />
      </section>

      {/* Shop by Category */}
      {categories && categories.length > 0 && (
        <section id="categories" className="py-12 md:py-16 bg-[#f3f7f5] border-b border-emerald-900/5 scroll-mt-20">
          <div className="max-w-container-max mx-auto px-4 md:px-lg">
            <div className="mb-8 md:mb-10 animate-rise">
              <p className="text-[11px] sm:text-xs text-primary/80 uppercase tracking-[0.2em] font-semibold mb-2">
                Browse curated collections
              </p>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <h2 className="font-headline-md text-2xl sm:text-3xl md:text-headline-md text-on-surface">
                  Shop by Category
                </h2>
                <Link href="/shop" className="text-sm font-semibold text-primary hover:text-on-primary-fixed-variant transition-colors inline-flex items-center gap-1">
                  View all books
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>

            <div className="flex gap-5 sm:gap-8 overflow-x-auto hide-scrollbar py-2 -mx-4 px-4 md:mx-0 md:px-0 items-start">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.id}`}
                  className="flex flex-col items-center gap-3 shrink-0 group"
                >
                  <div
                    style={{ borderRadius: '50%' }}
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 overflow-hidden shrink-0 shadow-[0_8px_24px_rgba(4,120,87,0.12)] ring-2 ring-white group-hover:ring-primary group-hover:shadow-[0_14px_30px_rgba(4,120,87,0.22)] transition-all duration-300 bg-white relative aspect-square"
                  >
                    <div style={{ borderRadius: '50%' }} className="absolute inset-0 shadow-[inset_0_3px_8px_rgba(255,255,255,0.55),inset_0_-3px_8px_rgba(0,0,0,0.08)] pointer-events-none z-10" />
                    {cat.logo ? (
                      <img src={cat.logo} alt={cat.name} style={{ borderRadius: '50%' }} className="w-full h-full object-cover block transition-transform duration-300 group-hover:scale-110" />
                    ) : (
                      <div style={{ borderRadius: '50%' }} className="w-full h-full bg-primary-container flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                        <span className="material-symbols-outlined text-primary text-[32px] sm:text-[40px]">menu_book</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] sm:text-xs text-center uppercase tracking-wider font-bold text-on-surface group-hover:text-primary transition-colors max-w-[96px] sm:max-w-[120px] leading-snug">
                    {cat.name}
                  </span>
                </Link>
              ))}
              <Link href="/shop" className="flex flex-col items-center gap-3 shrink-0 group">
                <div
                  style={{ borderRadius: '50%' }}
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 border-2 border-dashed border-primary/25 flex items-center justify-center shrink-0 group-hover:border-primary group-hover:bg-white group-hover:shadow-[0_14px_30px_rgba(4,120,87,0.15)] transition-all duration-300 bg-white/60 relative overflow-hidden aspect-square"
                >
                  <span className="material-symbols-outlined text-primary/70 group-hover:text-primary transition-colors text-[26px] sm:text-[32px]">arrow_outward</span>
                </div>
                <span className="text-[11px] sm:text-xs text-center uppercase tracking-wider font-bold text-on-surface-variant group-hover:text-primary transition-colors max-w-[96px] sm:max-w-[120px] leading-snug">
                  See all
                </span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {products && products.length > 0 && (
        <FeaturedCarousel products={products} />
      )}

      {/* Newsletter */}
      <section className="relative overflow-hidden py-14 md:py-20 bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#065f46]">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-container-max mx-auto px-4 md:px-lg text-center">
          <div className="max-w-xl mx-auto animate-rise">
            <p className="text-white/70 text-xs uppercase tracking-[0.2em] font-semibold mb-3">Stay in the loop</p>
            <h2 className="font-display-lg text-[1.75rem] sm:text-[2.25rem] md:text-[2.75rem] text-white mb-3 leading-tight">
              Book deals, straight to your inbox
            </h2>
            <p className="text-white/75 text-base sm:text-lg mb-8 leading-relaxed">
              New arrivals, restocks, and exclusive discounts for readers across Pakistan.
            </p>
            <form className="flex flex-col sm:flex-row gap-2 p-1.5 sm:p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
              <input
                className="bg-white text-on-surface placeholder:text-on-surface-variant/70 border-none focus:ring-2 focus:ring-white/40 px-4 py-3.5 text-body-md w-full flex-grow outline-none rounded-lg"
                placeholder="Enter your email address..."
                required
                type="email"
              />
              <button
                className="bg-white text-primary px-6 py-3.5 font-label-md text-label-md hover:bg-primary-container transition-soft whitespace-nowrap rounded-lg font-bold cursor-pointer shrink-0"
                type="submit"
              >
                Subscribe
              </button>
            </form>
            <p className="text-white/55 text-xs sm:text-sm mt-4">
              First order tip: use code <span className="text-white font-semibold tracking-wide">WELCOME10</span> for 10% off.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
