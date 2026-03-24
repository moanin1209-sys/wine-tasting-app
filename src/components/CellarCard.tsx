import Link from 'next/link';
import { CellarWine } from '@/types/cellar';

export default function CellarCard({ wine }: { wine: CellarWine }) {
  const isDepleted = wine.quantity === 0;
  const typeBadgeClass = wine.type ? `type-badge-${wine.type}` : 'type-badge-기타';

  return (
    <Link
      href={`/cellar/${wine.id}`}
      className={`block card group ${isDepleted ? 'opacity-40' : ''}`}
    >
      <div className="card-inner">
        {wine.image_url ? (
          <div className="h-40 overflow-hidden">
            <img
              src={wine.image_url}
              alt={wine.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          </div>
        ) : (
          <div className="w-full h-40 bg-[--surface-secondary] flex items-center justify-center text-4xl">
            🍷
          </div>
        )}
        <div className="p-3.5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[--text-primary] truncate flex-1 text-[15px] leading-snug">{wine.name}</h3>
            <span className={`text-[11px] font-bold ml-2 px-2.5 py-1 rounded-full ${
              isDepleted
                ? 'bg-[--surface-secondary] text-[--text-muted]'
                : 'bg-[--accent-bg] text-[--accent]'
            }`}>
              {isDepleted ? '소진' : `×${wine.quantity}`}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            {wine.type && (
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${typeBadgeClass}`}>
                {wine.type}
              </span>
            )}
            {wine.vintage && (
              <span className="text-[11px] text-[--text-muted]">{wine.vintage}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
