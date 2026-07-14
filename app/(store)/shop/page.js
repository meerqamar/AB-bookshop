import ProductCard from '@/components/ProductCard';
import { createClient } from '@/lib/supabase/server';
import ShopFilters from './ShopFilters';
import ShopSort from './ShopSort';

export const metadata = {
  title: 'Browse Books',
  description: 'Browse our full collection of MDCAT, CSS, PPSC, Islamic, academic and kids books. Filter by category, sort by price, and order with Cash on Delivery across Pakistan.',
  alternates: { canonical: '/shop' },
  openGraph: {
    title: 'Browse Books — AB Book Shop',
    description: 'Explore Pakistan\'s widest selection of entry-test, academic and Islamic books online.',
    url: 'https://ab-bookshop.vercel.app/shop',
  },
};

export default async function ShopPage({ searchParams }) {
  const params = await searchParams;
  const q = params?.q || '';
  const categoryId = params?.category ? parseInt(params.category) : 0;
  const sort = params?.sort || 'newest';

  const supabase = await createClient();

  // Fetch categories for filter
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  // Build product query
  let query = supabase
    .from('products')
    .select('*, category:categories(name)');

  if (q) {
    query = query.ilike('title', `%${q}%`);
  }
  if (categoryId > 0) {
    query = query.eq('category_id', categoryId);
  }

  if (sort === 'price_asc') {
    query = query.order('price', { ascending: true });
  } else if (sort === 'price_desc') {
    query = query.order('price', { ascending: false });
  } else {
    // newest
    query = query.order('created_at', { ascending: false });
  }

  const { data: products } = await query;

  const selectedCategory = categories?.find(c => c.id === categoryId);
  const pageTitle = selectedCategory ? selectedCategory.name : (q ? `Search Results for "${q}"` : 'Browse Our Collection');
  const pageDescription = selectedCategory ? `Explore our collection of ${selectedCategory.name} books.` : 'Curating the timeless wisdom of the ages. Discover books that challenge the mind.';

  return (
    <main className="max-w-container-max mx-auto px-4 md:px-lg py-md md:py-xl min-h-screen">
      <div className="flex flex-col md:flex-row gap-gutter">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <ShopFilters categories={categories || []} currentQ={q} currentCategory={categoryId} />
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-md">
          {/* Sorting and Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-md mb-lg">
            <div>
              <h1 className="font-display-lg text-[2rem] md:text-display-lg text-primary leading-tight">{pageTitle}</h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mt-xs">{pageDescription}</p>
            </div>
            <div className="flex items-center gap-sm">
              <span className="text-label-md font-label-md text-on-surface-variant whitespace-nowrap">Sort by:</span>
              <ShopSort />
            </div>
          </div>

          {/* Book Grid */}
          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 items-start">
              {products.map(p => (
                <div key={p.id} className="w-full max-w-[260px] mx-auto sm:mx-0">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>

          ) : (
            <div className="flex flex-col items-center justify-center p-xl bg-surface-container-low border border-outline border-dashed rounded text-center my-xl">
              <span className="material-symbols-outlined text-[64px] text-on-surface-variant/50 mb-md">search_off</span>
              <h3 className="font-headline-md text-headline-md text-primary mb-xs">No books found</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
