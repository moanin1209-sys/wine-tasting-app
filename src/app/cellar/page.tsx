'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CellarWine, WineType } from '@/types/cellar';
import CellarCard from '@/components/CellarCard';
import SearchBar from '@/components/SearchBar';

const WINE_TYPES: WineType[] = ['레드', '화이트', '로제', '스파클링', '기타'];
const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'name', label: '이름순' },
  { value: 'quantity', label: '수량순' },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]['value'];

export default function CellarPage() {
  const [wines, setWines] = useState<CellarWine[]>([]);
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
      const res = await fetch('/api/cellar');
      if (!res.ok) throw new Error('데이터를 불러올 수 없습니다');
      const data = await res.json();
      setWines(data);
    } catch {
      setError('데이터를 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

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
        if (sortBy === 'quantity') return b.quantity - a.quantity;
        if (sortBy === 'name') return a.name.localeCompare(b.name, 'ko');
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }),
    [wines, typeFilter, search, sortBy]
  );

  return (
    <>
      <header className="sticky top-0 pt-8 pb-3 z-10" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <h1 className="text-2xl font-bold mb-4 tracking-tight">셀러</h1>
        <SearchBar value={search} onChange={setSearch} />
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTypeFilter(null)}
              className={`px-3 py-1 rounded-full text-sm pill ${
                typeFilter === null ? 'pill-active' : 'pill-inactive'
              }`}
            >
              전체
            </button>
            {WINE_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(typeFilter === t ? null : t)}
                className={`px-3 py-1 rounded-full text-sm pill ${
                  typeFilter === t ? 'pill-active' : 'pill-inactive'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`text-xs px-2.5 py-1 rounded pill ${
                  sortBy === opt.value
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'pill-inactive'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
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
            <p className="text-[--text-muted] mb-3">{error}</p>
            <button
              onClick={() => { setError(null); setLoading(true); fetchWines(); }}
              className="text-[--accent] font-medium hover:underline"
            >
              다시 시도
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-[--text-muted] mb-1">
              {wines.length === 0 ? '셀러가 당신의 첫 와인을 기다리고 있습니다 📦' : '그런 와인은 아직 만나지 못했네요 🔍'}
            </p>
            {wines.length === 0 && (
              <Link
                href="/cellar/new"
                className="inline-block mt-3 text-[--accent] font-medium hover:underline"
              >
                첫 와인을 등록해보세요
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((wine) => (
              <CellarCard key={wine.id} wine={wine} />
            ))}
          </div>
        )}
      </main>

      <Link
        href="/cellar/new"
        className="fixed bottom-24 right-4 w-14 h-14 text-white rounded-full flex items-center justify-center text-2xl z-20 radiant-fab"
      >
        +
      </Link>
    </>
  );
}
