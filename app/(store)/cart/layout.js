export const metadata = {
  title: 'Shopping Cart',
  description: 'Review books in your AB Book Shop cart before checkout.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/cart' },
};

export default function CartLayout({ children }) {
  return children;
}
