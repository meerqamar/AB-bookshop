export const metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <div className="container section" style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 'var(--space-6)' }}>Privacy Policy</h1>
      <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem' }}>
        <p><strong>Last updated:</strong> July 2026</p>

        <h3 style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-3)' }}>1. Information We Collect</h3>
        <p>When you create an account, place an order, or contact us, we collect your name, email address, phone number, WhatsApp number, and delivery address. We use this information solely to process your orders and communicate with you.</p>

        <h3 style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-3)' }}>2. How We Use Your Information</h3>
        <p>Your information is used to: process and deliver orders, send order status updates, respond to your inquiries, and improve our services. We do not sell or share your personal data with third parties for marketing purposes.</p>

        <h3 style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-3)' }}>3. Data Security</h3>
        <p>We use industry-standard security measures including encrypted connections (SSL/TLS) and secure password hashing. Your payment information is never stored on our servers as we operate on Cash on Delivery only.</p>

        <h3 style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-3)' }}>4. Cookies</h3>
        <p>We use essential cookies for authentication and cart functionality. No tracking or advertising cookies are used.</p>

        <h3 style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-3)' }}>5. Contact</h3>
        <p>For privacy-related questions, contact us via WhatsApp or email at the contact information provided on our website.</p>
      </div>
    </div>
  );
}
