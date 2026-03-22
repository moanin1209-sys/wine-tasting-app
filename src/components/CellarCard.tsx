import Link from 'next/link';
import { CellarWine } from '@/types/cellar';

export default function CellarCard({ wine }: { wine: CellarWine }) {
  const isDepleted = wine.quantity === 0;
  const typeBadgeClass = wine.type ? `type-badge-${wine.type}` : 'type-badge-기타';

  return (
    <Link
      href={`/cellar/${wine.id}`}
      className={`block glass-card rounded-2xl overflow-hidden group ${
        isDepleted ? 'opacity-40' : ''
      }`}
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
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white truncate flex-1">{wine.name}</h3>
          <span className={`text-xs font-bold ml-2 px-2 py-0.5 rounded-full ${
            isDepleted
              ? 'bg-white/10 text-white/40'
              : 'bg-[#8b2252]/20 text-[#f9a8d4]'
          }`}>
            {isDepleted ? '소진' : `×${wine.quantity}`}
          </span>
        </div>
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
      </div>
    </Link>
  );
}
