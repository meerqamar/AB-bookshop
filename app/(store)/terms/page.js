export const metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return (
    <div className="container section" style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 'var(--space-6)' }}>Terms of Service</h1>
      <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem' }}>
        <p><strong>Last updated:</strong> July 2026</p>

        <h3 style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-3)' }}>1. General</h3>
        <p>By using AB Book Shop, you agree to these terms. We reserve the right to update these terms at any time. Continued use of the site constitutes acceptance of any changes.</p>

        <h3 style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-3)' }}>2. Orders & Payment</h3>
        <p>All orders are processed on a Cash on Delivery (COD) basis. A shipping fee of Rs 299 applies per order. Prices are listed in Pakistani Rupees (PKR) and are subject to change without notice. Once an order is confirmed, the listed price at the time of order will be honored.</p>

        <h3 style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-3)' }}>3. Delivery</h3>
        <p>We deliver across Pakistan. Delivery times vary by location and are estimated at 3-7 business days. We are not responsible for delays caused by courier services or circumstances beyond our control.</p>

        <h3 style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-3)' }}>4. Returns & Refunds</h3>
        <p>If you receive a damaged or incorrect book, please contact us within 48 hours via WhatsApp with photos of the issue. We will arrange a replacement or refund at our discretion.</p>

        <h3 style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-3)' }}>5. Account Responsibility</h3>
        <p>You are responsible for maintaining the security of your account credentials. Any activity under your account is your responsibility.</p>

        <h3 style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-3)' }}>6. Contact</h3>
        <p>For any questions regarding these terms, please reach out via WhatsApp using the contact button on our website.</p>
      </div>
    </div>
  );
}
