import Link from 'next/link';
import { Wine } from '@/types/wine';
import StarRating from './StarRating';

export default function WineCard({ wine }: { wine: Wine }) {
  const typeBadgeClass = wine.type ? `type-badge-${wine.type}` : 'type-badge-기타';

  return (
    <Link href={`/wines/${wine.id}`} className="block card group">
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
          <h3 className="font-semibold text-[--text-primary] truncate text-[15px] leading-snug">{wine.name}</h3>
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
          <div className="mt-2">
            <StarRating value={wine.rating} readonly size="sm" />
          </div>
          <p className="text-[11px] text-[--text-placeholder] mt-1.5">{wine.tasting_date}</p>
        </div>
      </div>
    </Link>
  );
}
