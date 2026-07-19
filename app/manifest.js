import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/seo';

export default function manifest() {
  return {
    name: SITE_NAME,
    short_name: 'AB Books',
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#f3f7f5',
    theme_color: '#047857',
    lang: 'en-PK',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
