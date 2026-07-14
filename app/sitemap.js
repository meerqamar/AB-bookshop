import { createClient } from '@/lib/supabase/server';

export default async function sitemap() {
  const baseUrl = 'https://ab-bookshop.vercel.app';

  // Static pages
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/cart`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/signup`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.2 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.2 },
  ];

  // Dynamic product pages
  try {
    const supabase = await createClient();
    const { data: products } = await supabase
      .from('products')
      .select('id, updated_at')
      .eq('in_stock', true);

    const productPages = (products || []).map((p) => ({
      url: `${baseUrl}/product/${p.id}`,
      lastModified: new Date(p.updated_at || Date.now()),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticPages, ...productPages];
  } catch {
    return staticPages;
  }
}
