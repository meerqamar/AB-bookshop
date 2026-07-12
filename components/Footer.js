import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter py-xl px-lg max-w-container-max mx-auto w-full">
        <div className="md:col-span-1">
          <h2 className="font-headline-md text-headline-md text-primary mb-md">AB Book Shop</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-md pr-4">
            Curated for the inquisitive mind. A space for literature that lingers. Pakistan's trusted book shop.
          </p>
          <div className="flex gap-md">
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#" aria-label="Facebook"><span className="material-symbols-outlined">brand_awareness</span></a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#" aria-label="Instagram"><span className="material-symbols-outlined">groups</span></a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#" aria-label="Twitter"><span className="material-symbols-outlined">public</span></a>
          </div>
        </div>
        <div>
          <h4 className="font-label-md text-label-md text-primary mb-md uppercase tracking-wider">Catalog</h4>
          <ul className="space-y-base font-body-md text-body-md text-on-surface-variant">
            <li><Link className="hover:text-primary transition-colors" href="/shop?category=novel">Novels</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="/shop?category=academic">Academic</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="/shop?category=islamic">Islamic Literature</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="/shop">All Collections</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-label-md text-label-md text-primary mb-md uppercase tracking-wider">Support</h4>
          <ul className="space-y-base font-body-md text-body-md text-on-surface-variant">
            <li><Link className="hover:text-primary transition-colors" href="#">About Us</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="#">Shipping &amp; Returns</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="#">Contact</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="#">Privacy Policy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-label-md text-label-md text-primary mb-md uppercase tracking-wider">Visit Us</h4>
          <p className="font-body-md text-body-md text-on-surface-variant mb-xs">Lahore, Pakistan</p>
          <p className="font-body-md text-body-md text-on-surface-variant mb-md">Cash on Delivery Available</p>
          <p className="font-body-md text-body-md text-on-surface-variant">Mon – Sat: 10am – 8pm</p>
          <p className="font-body-md text-body-md text-on-surface-variant">Sun: 11am – 5pm</p>
        </div>
      </div>
      <div className="max-w-container-max mx-auto px-lg py-md border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-md text-on-surface-variant">
        <p className="font-caption text-caption">© {new Date().getFullYear()} AB Book Shop. All rights reserved.</p>
        <div className="flex gap-lg font-caption text-caption">
          <Link className="hover:text-primary" href="#">Terms of Service</Link>
          <Link className="hover:text-primary" href="#">Cookie Policy</Link>
          <Link className="hover:text-primary" href="#">Accessibility</Link>
        </div>
      </div>
    </footer>
  );
}
