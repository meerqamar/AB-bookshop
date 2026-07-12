import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { createClient } from '@/lib/supabase/server';

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
      {/* Hero Section */}
      <section className="relative bg-surface py-xl overflow-hidden">
        <div className="max-w-container-max mx-auto px-lg grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center relative z-10">
          <div className="relative z-20 max-w-2xl">
            <span className="inline-flex items-center gap-2 text-secondary font-label-md text-label-md uppercase tracking-widest mb-md">
              <span className="w-8 h-0.5 bg-secondary rounded-full"></span>
              Pakistan's Trusted Book Shop
            </span>
            <h1 className="font-display-lg text-[3rem] sm:text-[4rem] lg:text-[4.5rem] font-bold text-primary leading-tight mb-md tracking-tight">
              Discover Your<br/>Next Great Read
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg max-w-xl">
              From academic essentials and entry test guides to novels and Islamic literature — quality books delivered to your doorstep with Cash on Delivery.
            </p>
            <div className="flex flex-wrap gap-md">
              <Link href="/shop" className="bg-primary text-on-primary px-lg py-4 font-label-md text-label-md btn-focus hover:bg-primary-container transition-soft flex items-center gap-base rounded shadow-lg">
                Explore Collection
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link href="/shop" className="border border-outline text-primary px-lg py-4 font-label-md text-label-md btn-focus hover:bg-surface-bright transition-soft rounded inline-flex items-center justify-center">
                Browse Categories
              </Link>
            </div>
          </div>
          
          <div className="relative z-20 lg:ml-auto w-full max-w-[460px] mx-auto lg:mx-0 mt-xl lg:mt-0 flex justify-center items-center">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-secondary to-transparent blur-3xl"></div>
            <div className="relative aspect-[4/5] w-full bg-white paper-shadow border border-outline-variant overflow-hidden transform lg:rotate-2 hover:rotate-0 transition-transform duration-500 rounded">
              <img
                src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80"
                alt="Collection of premium books"
                loading="eager"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        
        {/* Background decorative letters */}
        <div className="absolute -top-20 right-0 text-[25rem] font-display-lg font-bold text-primary opacity-[0.03] select-none z-0 pointer-events-none leading-none tracking-tighter overflow-hidden whitespace-nowrap">AB</div>
      </section>

      {/* Curated Collections: Bento Grid */}
      {categories && categories.length > 0 && (
        <section className="py-xl bg-surface">
          <div className="max-w-container-max mx-auto px-lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-lg gap-4">
              <div>
                <h2 className="font-headline-md text-[2rem] md:text-headline-md text-primary mb-xs">Curated Collections</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Expertly selected for the discerning reader.</p>
              </div>
              <Link className="font-label-md text-label-md text-primary flex items-center gap-xs hover:underline" href="/shop">
                Explore all genres <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-gutter h-auto md:h-[600px]">
              
              {/* Card 1 */}
              {categories[0] && (
                <Link href={`/shop?category=${categories[0].id}`} className="md:col-span-2 md:row-span-2 bg-surface-container-high relative overflow-hidden group cursor-pointer border border-outline-variant rounded">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${categories[0].image || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800'}')` }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-lg w-full">
                    <span className="font-label-md text-label-md text-secondary-fixed bg-primary px-sm py-1 mb-base inline-block rounded">Essential Reads</span>
                    <h3 className="font-headline-sm text-[1.5rem] md:text-headline-sm text-white mb-base">{categories[0].name}</h3>
                  </div>
                </Link>
              )}

              {/* Card 2 */}
              {categories[1] && (
                <Link href={`/shop?category=${categories[1].id}`} className="md:col-span-2 bg-surface-container relative overflow-hidden group cursor-pointer border border-outline-variant rounded h-48 md:h-auto">
                  <div className="absolute inset-0 bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 transition-all duration-500" style={{ backgroundImage: `url('${categories[1].image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800'}')` }}></div>
                  <div className="relative p-lg h-full flex flex-col justify-end">
                    <h3 className="font-headline-sm text-[1.5rem] md:text-headline-sm text-primary mb-xs">{categories[1].name}</h3>
                  </div>
                </Link>
              )}

              {/* Card 3 */}
              {categories[2] && (
                <Link href={`/shop?category=${categories[2].id}`} className="bg-surface-container-low relative overflow-hidden group cursor-pointer border border-outline-variant rounded h-48 md:h-auto">
                  <div className="p-lg h-full flex flex-col justify-between">
                    <span className="material-symbols-outlined text-primary text-[32px]">science</span>
                    <div>
                      <h3 className="font-headline-sm text-[1.25rem] md:text-headline-sm text-primary mb-xs">{categories[2].name}</h3>
                    </div>
                  </div>
                </Link>
              )}

              {/* Card 4 */}
              {categories[3] && (
                <Link href={`/shop?category=${categories[3].id}`} className="bg-primary relative overflow-hidden group cursor-pointer border border-outline-variant rounded h-48 md:h-auto">
                  <div className="p-lg h-full flex flex-col justify-between">
                    <span className="material-symbols-outlined text-secondary-container text-[32px]">public</span>
                    <div>
                      <h3 className="font-headline-sm text-[1.25rem] md:text-headline-sm text-white mb-xs">{categories[3].name}</h3>
                    </div>
                  </div>
                </Link>
              )}

            </div>
          </div>
        </section>
      )}

      {/* Featured Products Grid (Replaced Author Spotlight with Featured Products since we don't have authors) */}
      {products && products.length > 0 && (
        <section className="py-xl bg-surface-container">
          <div className="max-w-container-max mx-auto px-lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-lg gap-4">
              <div>
                <span className="font-label-md text-label-md text-secondary mb-base block">Featured</span>
                <h2 className="font-headline-md text-[2rem] md:text-headline-md text-primary">Discover Our Books</h2>
              </div>
              <Link className="font-label-md text-label-md text-primary flex items-center gap-xs hover:underline" href="/shop">
                View All Collection <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md lg:gap-gutter">
              {products.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Signup */}
      <section className="py-xl bg-surface">
        <div className="max-w-container-max mx-auto px-lg text-center">
          <div className="max-w-2xl mx-auto">
            <span className="material-symbols-outlined text-primary text-[48px] mb-md" data-weight="fill">mail</span>
            <h2 className="font-display-lg text-[2rem] md:text-display-lg text-primary mb-base">The Weekly Digest</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg">
              Thoughtful recommendations, new arrivals, and literary news delivered every Sunday morning. No noise, just substance.
            </p>
            <form className="flex flex-col sm:flex-row gap-xs justify-center items-stretch sm:items-center bg-white p-2 border border-outline rounded">
              <input className="bg-surface-container-low border-none focus:ring-0 px-md py-3 text-body-md w-full sm:w-auto flex-grow outline-none rounded" placeholder="Your email address" required type="email" />
              <button className="bg-primary text-on-primary px-lg py-3 font-label-md text-label-md btn-focus hover:bg-primary-container transition-soft whitespace-nowrap rounded" type="submit">
                Subscribe
              </button>
            </form>
            <p className="font-caption text-caption text-on-surface-variant mt-md">
              Join 12,000+ readers. Respectful of your inbox and privacy.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
