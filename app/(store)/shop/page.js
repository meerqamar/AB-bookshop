import ProductCard from '@/components/ProductCard';
import { createClient } from '@/lib/supabase/server';
import ShopFilters from './ShopFilters';
import ShopSort from './ShopSort';
import { buildPageMetadata, DEFAULT_OG_IMAGE } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Browse Books',
  description:
    'Browse our full collection of MDCAT, CSS, PPSC, Islamic, academic and kids books. Filter by category, sort by price, and order with Cash on Delivery across Pakistan.',
  path: '/shop',
  image: DEFAULT_OG_IMAGE,
});

export default async function ShopPage({ searchParams }) {
  const params = await searchParams;
  const q = params?.q || '';
  const categoryId = params?.category ? parseInt(params.category) : 0;
  const sort = params?.sort || 'newest';

  const supabase = await createClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  let query = supabase
    .from('products')
    .select('*, category:categories(name)')
    .or('in_stock.eq.true,in_stock.is.null');

  if (q) query = query.ilike('title', `%${q}%`);
  if (categoryId > 0) query = query.eq('category_id', categoryId);

  if (sort === 'price_asc') query = query.order('price', { ascending: true });
  else if (sort === 'price_desc') query = query.order('price', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  const { data: products } = await query;

  const selectedCategory = categories?.find(c => c.id === categoryId);
  const pageTitle = selectedCategory ? selectedCategory.name : (q ? `Results for “${q}”` : 'Browse Our Collection');
  const pageDescription = selectedCategory
    ? `Explore our collection of ${selectedCategory.name} books.`
    : 'Academic, entry-test, Islamic, and leisure reads — delivered with Cash on Delivery.';

  return (
    <main className="min-h-screen bg-[#f3f7f5]">
      <div className="max-w-container-max mx-auto px-4 md:px-lg py-8 md:py-12">
        <div className="mb-8 md:mb-10">
          <p className="text-[11px] sm:text-xs text-primary/80 uppercase tracking-[0.2em] font-semibold mb-2">
            Catalog
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="font-display-lg text-[1.75rem] sm:text-[2rem] md:text-display-lg text-primary leading-tight">
                {pageTitle}
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mt-2">
                {pageDescription}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm text-on-surface-variant hidden sm:inline">Sort by</span>
              <ShopSort />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          <aside className="w-full md:w-64 shrink-0">
            <ShopFilters categories={categories || []} currentQ={q} currentCategory={categoryId} />
          </aside>

          <div className="flex-1 w-full">
            {products && products.length > 0 ? (
              <>
                <p className="text-sm text-on-surface-variant mb-4">
                  {products.length} book{products.length === 1 ? '' : 's'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                  {products.map(p => (
                    <div key={p.id} className="w-full">
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 md:p-16 bg-white border border-dashed border-outline-variant rounded-2xl text-center">
                <span className="material-symbols-outlined text-[56px] text-primary/40 mb-4">search_off</span>
                <h3 className="font-headline-md text-xl text-on-surface mb-2">No books found</h3>
                <p className="text-on-surface-variant mb-6">Try adjusting your search or filters.</p>
                <a href="/shop" className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                  Clear filters
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
