export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/checkout', '/api'],
      },
    ],
    sitemap: 'https://ab-bookshop.vercel.app/sitemap.xml',
  };
}
