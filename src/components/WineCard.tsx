import Link from 'next/link';
import { Wine } from '@/types/wine';
import StarRating from './StarRating';

export default function WineCard({ wine }: { wine: Wine }) {
  const typeBadgeClass = wine.type ? `type-badge-${wine.type}` : 'type-badge-기타';

  return (
    <Link
      href={`/wines/${wine.id}`}
      className="block glass-card rounded-2xl overflow-hidden group"
    >
      {wine.image_url ? (
        <img
          src={wine.image_url}
          alt={wine.name}
          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-40 bg-white/[0.03] flex items-center justify-center text-4xl">
          🍷
        </div>
      )}
      <div className="p-3">
        <h3 className="font-semibold text-white truncate">{wine.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          {wine.type && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${typeBadgeClass}`}>
              {wine.type}
            </span>
          )}
          {wine.vintage && (
            <span className="text-xs text-white/40">{wine.vintage}</span>
          )}
        </div>
        <div className="mt-2">
          <StarRating value={wine.rating} readonly size="sm" />
        </div>
        <p className="text-xs text-white/30 mt-1">{wine.tasting_date}</p>
      </div>
    </Link>
  );
}
