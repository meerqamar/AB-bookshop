export const SITE_NAME = 'AB Book Shop';

function resolveSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, '')}`;
  }
  return 'https://ab-bookshop.vercel.app';
}

export const SITE_URL = resolveSiteUrl();

export const SITE_DESCRIPTION =
  'AB Book Shop offers academic, entry-test (MDCAT, CSS, PPSC), Islamic, and kids books online with Cash on Delivery across Pakistan. Fast delivery, quality selection.';

export const DEFAULT_OG_IMAGE = {
  url: '/Heroimage.jpeg',
  width: 1600,
  height: 800,
  alt: 'AB Book Shop — Books that Inspire, Knowledge that Empowers',
};

export function absoluteUrl(path = '/') {
  if (!path) return SITE_URL;
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BookStore',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    logo: absoluteUrl('/icon'),
    image: absoluteUrl(DEFAULT_OG_IMAGE.url),
    priceRange: '$$',
    paymentAccepted: 'Cash on Delivery',
    currenciesAccepted: 'PKR',
    areaServed: {
      '@type': 'Country',
      name: 'Pakistan',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Lahore',
      addressCountry: 'PK',
    },
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function productJsonLd(product, categoryName) {
  const url = absoluteUrl(`/product/${product.id}`);
  const available = product.in_stock !== false;

  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: product.title,
    description: product.description
      ? product.description.slice(0, 500)
      : `Buy "${product.title}" online from AB Book Shop with Cash on Delivery in Pakistan.`,
    image: product.image ? [product.image] : [absoluteUrl(DEFAULT_OG_IMAGE.url)],
    url,
    ...(product.author ? { author: { '@type': 'Person', name: product.author } } : {}),
    ...(categoryName ? { genre: categoryName } : {}),
    bookFormat: product.format || 'Paperback',
    inLanguage: ['en', 'ur'],
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'PKR',
      price: Number(product.price),
      availability: available
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'BookStore',
        name: SITE_NAME,
        url: SITE_URL,
      },
    },
  };
}

export function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildPageMetadata({
  title,
  description,
  path = '/',
  image,
  noIndex = false,
  type = 'website',
}) {
  const url = absoluteUrl(path);
  const ogImage = image
    ? (typeof image === 'string' ? { url: image } : image)
    : DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type,
      locale: 'en_PK',
      url,
      siteName: SITE_NAME,
      title: title ? `${title} | ${SITE_NAME}` : SITE_NAME,
      description,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: title ? `${title} | ${SITE_NAME}` : SITE_NAME,
      description,
      images: [typeof ogImage === 'string' ? ogImage : ogImage.url],
    },
  };
}
