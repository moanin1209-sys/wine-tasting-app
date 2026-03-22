'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Wine, WineType } from '@/types/wine';
import WineCard from '@/components/WineCard';
import SearchBar from '@/components/SearchBar';
import FilterPanel, { SortOption } from '@/components/FilterPanel';

export default function Home() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<WineType | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('latest');

  useEffect(() => {
    fetchWines();
  }, []);

  const fetchWines = async () => {
    try {
      const res = await fetch('/api/wines');
      if (!res.ok) throw new Error('데이터를 불러올 수 없습니다');
      const data = await res.json();
      setWines(data);
    } catch {
      setError('데이터를 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  const filtered = wines
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
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'ko');
      return new Date(b.tasting_date).getTime() - new Date(a.tasting_date).getTime();
    });

  return (
    <>
      <header className="sticky top-0 pt-6 pb-3 z-10" style={{ background: 'rgba(12, 10, 14, 0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <h1 className="text-2xl font-bold text-white mb-4 tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f5f0eb] to-[#b4824a]">Wine Note</span>
        </h1>
        <SearchBar value={search} onChange={setSearch} />
        <div className="mt-3">
          <FilterPanel
            selectedType={typeFilter}
            onTypeChange={setTypeFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>
      </header>

      <main className="mt-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden">
                <div className="h-40 skeleton" />
                <div className="p-3 space-y-2">
                  <div className="h-4 skeleton rounded w-3/4" />
                  <div className="h-3 skeleton rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-white/50 mb-3">{error}</p>
            <button
              onClick={() => { setError(null); setLoading(true); fetchWines(); }}
              className="text-[#f9a8d4] font-medium hover:underline"
            >
              다시 시도
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🍷</p>
            <p className="text-white/50 mb-1">
              {wines.length === 0 ? '아직 기록한 와인이 없습니다' : '검색 결과가 없습니다'}
            </p>
            {wines.length === 0 && (
              <Link
                href="/wines/new"
                className="inline-block mt-3 text-[#f9a8d4] font-medium hover:underline"
              >
                첫 와인을 기록해보세요
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((wine) => (
              <WineCard key={wine.id} wine={wine} />
            ))}
          </div>
        )}
      </main>

      <Link
        href="/wines/new"
        className="fixed bottom-20 right-6 w-14 h-14 bg-[#0c0a0e] text-white rounded-full shadow-lg flex items-center justify-center text-2xl z-20 radiant-fab hover:scale-110 transition-transform duration-300"
      >
        +
      </Link>
    </>
  );
}
