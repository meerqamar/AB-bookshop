import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0f1f1a] text-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-gutter py-12 md:py-16 px-4 md:px-lg max-w-container-max mx-auto w-full">
        <div className="md:col-span-1 sm:col-span-2">
          <h2 className="font-headline-md text-2xl md:text-headline-md text-white mb-4">AB Book Shop</h2>
          <p className="font-body-md text-body-md text-white/65 mb-5 max-w-sm leading-relaxed">
            Pakistan&apos;s trusted bookstore for novels, academic textbooks, Islamic literature, and recruitment guides. Fast Cash on Delivery nationwide.
          </p>
          <div className="flex gap-3">
            <a className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-primary hover:text-white transition-colors" href="#" aria-label="Facebook"><span className="material-symbols-outlined text-[20px]">brand_awareness</span></a>
            <a className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-primary hover:text-white transition-colors" href="#" aria-label="Instagram"><span className="material-symbols-outlined text-[20px]">groups</span></a>
            <a className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-primary hover:text-white transition-colors" href="#" aria-label="Twitter"><span className="material-symbols-outlined text-[20px]">public</span></a>
          </div>
        </div>
        <div>
          <h4 className="font-label-md text-sm text-white mb-4 uppercase tracking-wider">Catalog</h4>
          <ul className="space-y-3 font-body-md text-body-md text-white/65">
            <li><Link className="hover:text-white transition-colors" href="/shop">All Collections</Link></li>
            <li><Link className="hover:text-white transition-colors" href="/shop">Academic</Link></li>
            <li><Link className="hover:text-white transition-colors" href="/shop">Islamic Literature</Link></li>
            <li><Link className="hover:text-white transition-colors" href="/shop">Novels</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-label-md text-sm text-white mb-4 uppercase tracking-wider">Support</h4>
          <ul className="space-y-3 font-body-md text-body-md text-white/65">
            <li><Link className="hover:text-white transition-colors" href="/terms">About Us</Link></li>
            <li><Link className="hover:text-white transition-colors" href="/terms">Shipping &amp; Returns</Link></li>
            <li><Link className="hover:text-white transition-colors" href="#">Contact</Link></li>
            <li><Link className="hover:text-white transition-colors" href="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-label-md text-sm text-white mb-4 uppercase tracking-wider">Visit Us</h4>
          <p className="font-body-md text-body-md text-white/65 mb-1">Lahore, Pakistan</p>
          <p className="font-body-md text-body-md text-white/65 mb-4">Cash on Delivery Available</p>
          <p className="font-body-md text-body-md text-white/65">Mon – Sat: 10am – 8pm</p>
          <p className="font-body-md text-body-md text-white/65">Sun: 11am – 5pm</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-container-max mx-auto px-4 md:px-lg py-5 flex flex-col md:flex-row justify-between items-center gap-3 text-white/45">
          <p className="font-caption text-caption text-center md:text-left">© {new Date().getFullYear()} AB Book Shop. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 font-caption text-caption">
            <Link className="hover:text-white transition-colors" href="/terms">Terms of Service</Link>
            <Link className="hover:text-white transition-colors" href="/privacy">Cookie Policy</Link>
            <Link className="hover:text-white transition-colors" href="/privacy">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
