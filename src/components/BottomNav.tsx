'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: '테이스팅', icon: '🍷' },
  { href: '/cellar', label: '셀러', icon: '📦' },
  { href: '/wishlist', label: '위시', icon: '💭' },
  { href: '/stats', label: '통계', icon: '📊' },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 glass-nav">
      <div className="max-w-2xl mx-auto h-14 flex">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-300 ${
              isActive(tab.href)
                ? 'text-[#7c2d50]'
                : 'text-[#999] hover:text-[#666]'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
