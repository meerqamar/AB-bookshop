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
    .limit(4);

  const { data: featured } = await supabase
    .from('products')
    .select('*, category:categories(name)')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(8);

  // Fallback: if no featured products, show latest
  let products = featured;
  if (!products || products.length === 0) {
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(name)')
      .order('created_at', { ascending: false })
      .limit(8);
    products = data;
  }

  const heroProduct = products?.[0] || {
    title: 'Architecture of Silence',
    description: 'A definitive exploration into the quiet spaces that shape human thought. Pre-order the limited linen-bound edition of Elias Thorne\'s latest masterpiece.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBs6_GHhhegTHI6LPfEl9MTa7fBhze3Omx-pjeV6nZD8Yjn4lOPfVZCQ5YNoP7tSQ49epVmQDr06gQedBzZUWIaAAn3ndK7eldroy315PQ5X6LUEscNPN1K4x2mcbCHcmCtBDCp8TRTEbKcCIKW17bomo9ctlumR8o3u9K48A4A1cvQ2RDqUcKzHYb4AKBfOZw9HmtfyDAGjbkOW5_TTakA0s3MdD1pcR13ZFIEmzIMX1WUYSfkTNLpUTdwn4_AyiMLdb84LmrMvti'
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Hero: full banner on mobile (no side crop); viewport-fill cover on md+ */}
      <section className="flex flex-col md:h-[calc(100dvh-5rem)] md:min-h-[480px] md:max-h-[900px]">
        <div className="w-full bg-white md:flex-1 md:overflow-hidden md:min-h-0">
          <img
            src="/Heroimage.jpeg"
            alt="AB Book Shop - Books that Inspire, Knowledge that Empowers"
            className="w-full h-auto block md:h-full md:object-cover md:object-center"
            loading="eager"
          />
        </div>
        <div className="bg-primary py-4 sm:py-5 px-4 md:px-lg flex-shrink-0">
          <div className="max-w-container-max mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-white font-label-md text-sm sm:text-label-md text-center sm:text-left">
              Quality books delivered to your doorstep — Cash on Delivery available!
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-md justify-center w-full sm:w-auto">
              <Link href="/shop" className="bg-white text-primary px-4 sm:px-lg py-2.5 sm:py-3 font-label-md text-sm sm:text-label-md hover:bg-primary-container hover:text-white transition-soft flex items-center justify-center gap-base rounded shadow-md flex-1 sm:flex-initial min-w-[140px]">
                Explore Collection
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link href="/shop" className="border border-white/70 text-white px-4 sm:px-lg py-2.5 sm:py-3 font-label-md text-sm sm:text-label-md hover:bg-white/10 transition-soft rounded inline-flex items-center justify-center flex-1 sm:flex-initial min-w-[140px]">
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category - Circular Icons */}
      {categories && categories.length > 0 && (
        <section className="py-10 bg-white border-b border-gray-100">
          <div className="max-w-container-max mx-auto px-4 md:px-lg">
            <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">Browse Curated Collections</p>
            <h2 className="text-2xl font-bold text-on-surface mb-8">Shop by Category</h2>
            <div className="flex gap-6 sm:gap-8 overflow-x-auto pb-4 items-start">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.id}`}
                  className="flex flex-col items-center gap-2.5 shrink-0 group"
                >
                  <div
                    style={{ borderRadius: '50%', aspectRatio: '1/1' }}
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden shrink-0 shadow-[0_6px_16px_rgba(0,0,0,0.12)] border-2 sm:border-[3px] border-white group-hover:border-primary group-hover:shadow-[0_12px_24px_rgba(6,95,70,0.25)] group-hover:scale-105 transition-all duration-300 bg-surface-container relative flex items-center justify-center"
                  >
                    {/* Spherical glass highlight for 3D sphere depth */}
                    <div className="absolute inset-0 rounded-full shadow-[inset_0_4px_8px_rgba(255,255,255,0.6),inset_0_-4px_8px_rgba(0,0,0,0.15)] pointer-events-none z-10"></div>
                    {cat.logo ? (
                      <img src={cat.logo} alt={cat.name} style={{ borderRadius: '50%' }} className="w-full h-full object-cover block rounded-full" />
                    ) : (
                      <div style={{ borderRadius: '50%' }} className="w-full h-full bg-[#e8f5e9] flex items-center justify-center rounded-full">
                        <span className="material-symbols-outlined text-primary text-[34px] sm:text-[42px]">menu_book</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] sm:text-xs text-center uppercase tracking-wider font-bold text-on-surface group-hover:text-primary transition-colors max-w-[95px] sm:max-w-[115px] leading-snug">
                    {cat.name}
                  </span>
                </Link>
              ))}
              {/* Discover all circle */}
              <Link href="/shop" className="flex flex-col items-center gap-2.5 shrink-0 group">
                <div
                  style={{ borderRadius: '50%', aspectRatio: '1/1' }}
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-2 sm:border-[3px] border-gray-200 flex items-center justify-center shrink-0 group-hover:border-primary group-hover:shadow-[0_12px_24px_rgba(6,95,70,0.2)] group-hover:scale-105 transition-all duration-300 bg-white relative overflow-hidden"
                >
                  <div className="absolute inset-0 rounded-full shadow-[inset_0_4px_8px_rgba(255,255,255,0.8),inset_0_-4px_8px_rgba(0,0,0,0.08)] pointer-events-none z-10"></div>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-[26px] sm:text-[34px] z-20">arrow_outward</span>
                </div>
                <span className="text-[11px] sm:text-xs text-center uppercase tracking-wider font-bold text-on-surface-variant group-hover:text-primary transition-colors max-w-[95px] sm:max-w-[115px] leading-snug">
                  Discover all new items
                </span>
              </Link>
            </div>


          </div>
        </section>
      )}

      {/* Featured Books - Scrollable Carousel */}
      {products && products.length > 0 && (
        <FeaturedCarousel products={products} />
      )}

      {/* Newsletter Signup */}
      <section className="py-10 md:py-xl bg-surface">
        <div className="max-w-container-max mx-auto px-4 md:px-lg text-center">
          <div className="max-w-2xl mx-auto">
            <span className="material-symbols-outlined text-primary text-[48px] mb-md" data-weight="fill">local_offer</span>
            <h2 className="font-display-lg text-[1.75rem] sm:text-[2rem] md:text-display-lg text-primary mb-base">Get Exclusive Book Deals & Alerts</h2>
            <p className="font-body-lg text-base sm:text-body-lg text-on-surface-variant mb-lg">
              Subscribe to receive instant alerts on discounts, recruitment guides, bestselling novels, and new book restocks right in your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-xs justify-center items-stretch sm:items-center bg-white p-2 border border-outline rounded">
              <input className="bg-surface-container-low border-none focus:ring-0 px-4 sm:px-md py-3 text-body-md w-full sm:w-auto flex-grow outline-none rounded" placeholder="Enter your email address..." required type="email" />
              <button className="bg-primary text-on-primary px-4 sm:px-lg py-3 font-label-md text-label-md btn-focus hover:bg-primary-container transition-soft whitespace-nowrap rounded font-bold cursor-pointer" type="submit">
                Get 10% Off
              </button>
            </form>
            <p className="font-caption text-caption text-on-surface-variant mt-md">
              Join thousands of happy book buyers across Pakistan. Use code <strong className="text-primary font-bold">WELCOME10</strong> for 10% off your first purchase!
            </p>
          </div>
        </div>
      </section>

    </main>
  );
}
