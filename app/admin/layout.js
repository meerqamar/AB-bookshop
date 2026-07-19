import AdminShell from './AdminShell';

export const metadata = {
  title: {
    default: 'Admin',
    template: '%s | AB Admin',
  },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
