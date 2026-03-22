'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: '테이스팅', icon: '🍷' },
  { href: '/cellar', label: '셀러', icon: '📦' },
  { href: '/stats', label: '통계', icon: '📊' },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 glass-nav z-30">
      <div className="max-w-2xl mx-auto h-full flex">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-300 relative ${
              isActive(tab.href)
                ? 'text-white'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className={`text-xs font-medium ${
              isActive(tab.href) ? 'opacity-100' : 'opacity-60'
            }`}>{tab.label}</span>
            {isActive(tab.href) && (
              <div className="absolute bottom-1 w-8 h-0.5 rounded-full bg-gradient-to-r from-[#8b2252] to-[#b4824a]" />
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
