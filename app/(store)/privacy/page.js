import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Privacy Policy',
  description:
    'Learn how AB Book Shop collects, uses, and protects your personal information when you shop books online in Pakistan.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f3f7f5]">
      <div className="max-w-3xl mx-auto px-4 md:px-lg py-12 md:py-16">
        <h1 className="font-headline-md text-3xl text-on-surface mb-4">Privacy Policy</h1>
        <div className="bg-white border border-outline-variant/70 rounded-2xl p-6 sm:p-8 text-on-surface-variant leading-relaxed space-y-6">
          <p><strong className="text-on-surface">Last updated:</strong> July 2026</p>

          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-2">1. Information We Collect</h2>
            <p>When you create an account, place an order, or contact us, we collect your name, email address, phone number, WhatsApp number, and delivery address. We use this information solely to process your orders and communicate with you.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-2">2. How We Use Your Information</h2>
            <p>Your information is used to: process and deliver orders, send order status updates, respond to your inquiries, and improve our services. We do not sell or share your personal data with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-2">3. Data Security</h2>
            <p>We use industry-standard security measures including encrypted connections (SSL/TLS) and secure password hashing. Your payment information is never stored on our servers as we operate on Cash on Delivery only.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-2">4. Cookies</h2>
            <p>We use essential cookies for authentication and cart functionality. No tracking or advertising cookies are used.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-2">5. Contact</h2>
            <p>For privacy-related questions, contact us via WhatsApp or email at the contact information provided on our website.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
