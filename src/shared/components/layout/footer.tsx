import Link from 'next/link';
import { getLocale } from 'next-intl/server';

export async function Footer() {
  const locale = await getLocale();
  const homeHref = `/${locale}`;

  return (
    <footer className="bg-dark text-white/60 border-t border-white/10">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <h4 className="text-white font-semibold mb-3">Platform</h4>
            <ul className="space-y-2">
              <li><Link href="/search" className="hover:text-white transition-colors">Explore</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/auth/signup" className="hover:text-white transition-colors">List Property</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Legal</h4>
            <ul className="space-y-2">
              <li><span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Cookie Policy</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/contact" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Trust & Safety</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Accessibility</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded" />
            <span className="text-white font-semibold">LocaleRent</span>
          </div>
          <p>&copy; 2026 LocaleRent. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
