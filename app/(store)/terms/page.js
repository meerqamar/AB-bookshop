import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Terms of Service',
  description:
    'Read the terms of service for shopping at AB Book Shop, including Cash on Delivery, shipping, and returns across Pakistan.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f3f7f5]">
      <div className="max-w-3xl mx-auto px-4 md:px-lg py-12 md:py-16">
        <h1 className="font-headline-md text-3xl text-on-surface mb-4">Terms of Service</h1>
        <div className="bg-white border border-outline-variant/70 rounded-2xl p-6 sm:p-8 text-on-surface-variant leading-relaxed space-y-6">
          <p><strong className="text-on-surface">Last updated:</strong> July 2026</p>

          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-2">1. General</h2>
            <p>By using AB Book Shop, you agree to these terms. We reserve the right to update these terms at any time. Continued use of the site constitutes acceptance of any changes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-2">2. Orders &amp; Payment</h2>
            <p>All orders are processed on a Cash on Delivery (COD) basis. A shipping fee applies per order. Prices are listed in Pakistani Rupees (PKR) and are subject to change without notice. Once an order is confirmed, the listed price at the time of order will be honored.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-2">3. Delivery</h2>
            <p>We deliver across Pakistan. Delivery times vary by location and are estimated at 3-7 business days. We are not responsible for delays caused by courier services or circumstances beyond our control.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-2">4. Returns &amp; Refunds</h2>
            <p>If you receive a damaged or incorrect book, please contact us within 48 hours via WhatsApp with photos of the issue. We will arrange a replacement or refund at our discretion.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-2">5. Account Responsibility</h2>
            <p>You are responsible for maintaining the security of your account credentials. Any activity under your account is your responsibility.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-2">6. Contact</h2>
            <p>For any questions regarding these terms, please reach out via WhatsApp using the contact button on our website.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
