import Link from 'next/link';
import { Home } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  return (
    <nav className="border-b border-[var(--border)] bg-[var(--bg-header)] sticky top-0 z-20 shadow-sm backdrop-blur-md bg-opacity-80">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-[var(--primary)] font-bold text-xl">
          <Home className="w-6 h-6" />
          <span>SmartPG</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--text-secondary)]">
          <Link href="/#features" className="hover:text-[var(--text-primary)] transition-colors">Features</Link>
          <Link href="/#how-it-works" className="hover:text-[var(--text-primary)] transition-colors">How it works</Link>
          <Link href="/pg/sharma-pg-patna" className="hover:text-[var(--text-primary)] transition-colors">Vacant Beds</Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login" className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors">
            Login
          </Link>
          <Link href="/owner-request" className="bg-[var(--primary)] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors shadow-sm">
            Owner Request
          </Link>
        </div>
      </div>
    </nav>
  );
}
