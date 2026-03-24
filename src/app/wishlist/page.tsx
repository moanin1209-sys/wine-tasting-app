'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { WishlistWine } from '@/types/wishlist';
import { WineType } from '@/types/wine';
import WishlistCard from '@/components/WishlistCard';
import SearchBar from '@/components/SearchBar';
import FilterPanel from '@/components/FilterPanel';

export default function WishlistPage() {
  const [wines, setWines] = useState<WishlistWine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<WineType | null>(null);
  const [sort, setSort] = useState('priority');

  useEffect(() => {
    fetch('/api/wishlist')
      .then((r) => r.json())
      .then((data) => setWines(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() =>
    wines
      .filter((w) => {
        if (typeFilter && w.type !== typeFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            w.name.toLowerCase().includes(q) ||
            (w.grape?.toLowerCase().includes(q) ?? false) ||
            (w.region?.toLowerCase().includes(q) ?? false)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sort === 'priority') return b.priority - a.priority;
        if (sort === 'name') return a.name.localeCompare(b.name, 'ko');
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }),
    [wines, typeFilter, search, sort]
  );

  return (
    <div className="pt-6 pb-4">
      <div className="sticky top-0 z-20 pt-8 pb-3" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <h1 className="text-2xl font-bold mb-4 tracking-tight">위시리스트</h1>
        <SearchBar value={search} onChange={setSearch} />
        <div className="mt-3">
          <FilterPanel
            selectedType={typeFilter}
            onTypeChange={setTypeFilter}
            sortBy={sort}
            onSortChange={setSort}
            sortOptions={[
              { value: 'priority', label: '우선순위' },
              { value: 'latest', label: '최신순' },
              { value: 'name', label: '이름순' },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-56 skeleton rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">💭</p>
          <p className="text-[--text-muted] text-sm">
            {wines.length === 0 ? '아직 만날 와인을 찾지 못한 것뿐입니다 ✨' : '그런 와인은 아직 만나지 못했네요 🔍'}
          </p>
          {wines.length === 0 && (
            <Link href="/wishlist/new" className="text-[--accent] text-sm mt-2 inline-block hover:underline">
              마시고 싶은 와인 추가하기
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mt-4">
          {filtered.map((wine) => (
            <WishlistCard key={wine.id} wine={wine} />
          ))}
        </div>
      )}

      <Link
        href="/wishlist/new"
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full radiant-fab flex items-center justify-center text-2xl text-white z-20"
      >
        +
      </Link>
    </div>
  );
}
