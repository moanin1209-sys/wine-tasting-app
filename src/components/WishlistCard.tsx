import Link from 'next/link';
import Image from 'next/image';
import { memo } from 'react';
import { WishlistWine } from '@/types/wishlist';

function WishlistCardInner({ wine }: { wine: WishlistWine }) {
  const typeBadgeClass = wine.type ? `type-badge-${wine.type}` : '';

  return (
    <Link href={`/wishlist/${wine.id}`} className="block card group">
      <div className="card-inner">
        {wine.image_url ? (
          <div className="h-40 overflow-hidden relative">
            <Image
              src={wine.image_url}
              alt={wine.name}
              fill
              sizes="(max-width: 640px) 50vw, 300px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          </div>
        ) : (
          <div className="h-40 bg-[--surface-secondary] flex items-center justify-center text-4xl">
            💭
          </div>
        )}
        <div className="p-3.5">
          <h3 className="font-semibold text-[--text-primary] text-[15px] truncate leading-snug">{wine.name}</h3>
          <div className="flex items-center gap-2 mt-1.5">
            {wine.type && (
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${typeBadgeClass}`}>
                {wine.type}
              </span>
            )}
            <div className="flex gap-1 ml-auto">
              {[1, 2, 3, 4, 5].map((p) => (
                <div
                  key={p}
                  className={`w-1.5 h-1.5 rounded-full ${
                    p <= wine.priority ? 'bg-[--accent]' : 'bg-[--border]'
                  }`}
                />
              ))}
            </div>
          </div>
          {wine.reason && (
            <p className="text-[11px] text-[--text-muted] mt-2 line-clamp-2 leading-relaxed">{wine.reason}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default memo(WishlistCardInner);
