'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/scripts/new', label: 'Scripts' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-800 bg-pp-dark-950">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pp-primary-600">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </div>
          <span className="text-lg font-bold text-white">PromptPilot</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-white',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
