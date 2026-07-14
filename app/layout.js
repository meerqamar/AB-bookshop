import './globals.css';
import { CartProvider } from '@/components/CartProvider';
import { ToastProvider } from '@/components/Toast';


export const metadata = {
  title: {
    default: 'AB Book Shop — Buy Books Online with Cash on Delivery in Pakistan',
    template: '%s | AB Book Shop',
  },
  description: 'AB Book Shop offers the widest range of academic, entry-test (MDCAT, CSS, PPSC), Islamic, and kids books online with Cash on Delivery across Pakistan. Fast delivery, quality selection.',
  keywords: ['buy books online Pakistan', 'MDCAT books', 'CSS books', 'PPSC books', 'Islamic books', 'kids books', 'academic books', 'entry test preparation', 'AB Book Shop', 'books with cash on delivery'],
  authors: [{ name: 'AB Book Shop' }],
  creator: 'AB Book Shop',
  publisher: 'AB Book Shop',
  metadataBase: new URL('https://ab-bookshop.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: 'https://ab-bookshop.vercel.app',
    siteName: 'AB Book Shop',
    title: 'AB Book Shop — Buy Books Online with Cash on Delivery in Pakistan',
    description: 'Pakistan\'s trusted online bookshop. Wide range of MDCAT, CSS, PPSC, Islamic, and kids books. Cash on Delivery available.',
    images: [
      {
        url: '/Heroimage.jpeg',
        width: 1200,
        height: 630,
        alt: 'AB Book Shop — Books that Inspire, Knowledge that Empowers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AB Book Shop — Buy Books Online Pakistan',
    description: 'Pakistan\'s trusted online bookshop. MDCAT, CSS, PPSC, Islamic and kids books with Cash on Delivery.',
    images: ['/Heroimage.jpeg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:ital,wght@0,400;0,600;0,700;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&display=swap"
          rel="stylesheet"
        />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-on-surface font-body-md selection:bg-secondary-container selection:text-on-secondary-container">
        <CartProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}
