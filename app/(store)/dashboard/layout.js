export const metadata = {
  title: 'My Account',
  description: 'Manage your AB Book Shop orders, addresses, and profile.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/dashboard' },
};

export default function DashboardLayout({ children }) {
  return children;
}
