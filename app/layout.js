import './globals.css';
import { CartProvider } from '@/components/CartProvider';
import { ToastProvider } from '@/components/Toast';

import StoreShell from '@/components/StoreShell';

export const metadata = {
  title: {
    default: 'AB Book Shop — Buy Books Online with Cash on Delivery',
    template: '%s — AB Book Shop',
  },
  description: 'AB Book Shop — buy novels, academic, entry-test, Islamic and programming books online with Cash on Delivery across Pakistan.',
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
