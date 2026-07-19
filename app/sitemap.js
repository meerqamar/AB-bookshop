import { createClient } from '@/lib/supabase/server';
import { SITE_URL } from '@/lib/seo';

export default async function sitemap() {
  const staticPages = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  try {
    const supabase = await createClient();
    const { data: products } = await supabase
      .from('products')
      .select('id, updated_at, created_at')
      .or('in_stock.eq.true,in_stock.is.null');

    const productPages = (products || []).map((p) => ({
      url: `${SITE_URL}/product/${p.id}`,
      lastModified: new Date(p.updated_at || p.created_at || Date.now()),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticPages, ...productPages];
  } catch {
    return staticPages;
  }
}
