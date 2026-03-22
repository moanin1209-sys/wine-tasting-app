'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CellarWine } from '@/types/cellar';
import { Wine } from '@/types/wine';

export default function CellarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [wine, setWine] = useState<CellarWine | null>(null);
  const [tastingNotes, setTastingNotes] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/cellar/${id}`).then((r) => r.json()),
      fetch(`/api/wines?cellar_wine_id=${id}`).then((r) => r.json()),
    ])
      .then(([cellarData, notesData]) => {
        setWine(cellarData);
        setTastingNotes(Array.isArray(notesData) ? notesData : []);
      })
      .catch(() => setWine(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDrink = () => {
    if (!confirm('이 와인을 마시겠습니까? 수량이 1 감소합니다.')) return;
    router.push(`/wines/new?from_cellar=${id}`);
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    setDeleting(true);
    try {
      await fetch(`/api/cellar/${id}`, { method: 'DELETE' });
      router.push('/cellar');
      router.refresh();
    } catch {
      alert('삭제에 실패했습니다.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-6">
        <div className="h-64 skeleton rounded-2xl" />
        <div className="mt-4 space-y-3">
          <div className="h-6 skeleton rounded w-1/2" />
          <div className="h-4 skeleton rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (!wine) {
    return (
      <div className="pt-6 text-center py-16">
        <p className="text-white/50">와인을 찾을 수 없습니다</p>
        <Link href="/cellar" className="text-[#f9a8d4] mt-2 inline-block hover:underline">
          셀러로 돌아가기
        </Link>
      </div>
    );
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ko-KR').format(price) + '원';

  const typeBadgeClass = wine.type ? `type-badge-${wine.type}` : '';

  return (
    <div className="pt-6">
      <button
        onClick={() => router.back()}
        className="text-white/50 text-sm mb-4 hover:text-white/70 transition-colors"
      >
        ← 뒤로
      </button>

      {wine.image_url ? (
        <img
          src={wine.image_url}
          alt={wine.name}
          className="w-full h-64 object-cover rounded-2xl"
        />
      ) : (
        <div className="w-full h-64 bg-white/[0.04] rounded-2xl flex items-center justify-center text-6xl border border-white/[0.06]">
          🍷
        </div>
      )}

      <div className="mt-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{wine.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {wine.type && (
                <span className={`text-sm px-2.5 py-0.5 rounded-full ${typeBadgeClass}`}>
                  {wine.type}
                </span>
              )}
              {wine.vintage && (
                <span className="text-sm text-white/40">{wine.vintage}</span>
              )}
            </div>
          </div>
          <div className={`text-center px-4 py-2 rounded-xl ${
            wine.quantity === 0
              ? 'bg-white/[0.06] text-white/40'
              : 'bg-[#8b2252]/20 text-[#f9a8d4]'
          }`}>
            <p className="text-2xl font-bold">{wine.quantity}</p>
            <p className="text-xs">{wine.quantity === 0 ? '소진' : '병'}</p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
          {wine.grape && (
            <div>
              <p className="text-white/40">품종</p>
              <p className="text-white/80">{wine.grape}</p>
            </div>
          )}
          {wine.region && (
            <div>
              <p className="text-white/40">산지</p>
              <p className="text-white/80">{wine.region}</p>
            </div>
          )}
          {wine.price && (
            <div>
              <p className="text-white/40">가격</p>
              <p className="text-white/80">{formatPrice(wine.price)}</p>
            </div>
          )}
          {wine.purchase_date && (
            <div>
              <p className="text-white/40">구매일</p>
              <p className="text-white/80">{wine.purchase_date}</p>
            </div>
          )}
          {wine.purchase_from && (
            <div className="col-span-2">
              <p className="text-white/40">구매처</p>
              <p className="text-white/80">{wine.purchase_from}</p>
            </div>
          )}
        </div>

        {wine.memo && (
          <div className="glass-card rounded-xl p-4">
            <p className="text-white/40 text-sm mb-1">메모</p>
            <p className="text-white/80 whitespace-pre-wrap leading-relaxed">
              {wine.memo}
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleDrink}
            disabled={wine.quantity === 0}
            className="flex-1 btn-primary py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {wine.quantity === 0 ? '소진됨' : '🍷 마시기'}
          </button>
          <Link
            href={`/cellar/${wine.id}/edit`}
            className="px-5 py-3 btn-secondary rounded-xl font-medium text-center"
          >
            수정
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-5 py-3 btn-danger rounded-xl font-medium disabled:opacity-50"
          >
            삭제
          </button>
        </div>

        {/* 테이스팅 기록 */}
        {tastingNotes.length > 0 && (
          <div className="pt-4 border-t border-white/[0.08]">
            <h2 className="text-sm font-semibold text-white/60 mb-3">테이스팅 기록</h2>
            <div className="space-y-2">
              {tastingNotes.map((note) => (
                <Link
                  key={note.id}
                  href={`/wines/${note.id}`}
                  className="block glass-card rounded-xl p-3 hover:bg-white/[0.08] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-amber-400">
                      {'★'.repeat(note.rating)}{'☆'.repeat(5 - note.rating)}
                    </span>
                    <span className="text-xs text-white/30">{note.tasting_date}</span>
                  </div>
                  {note.memo && (
                    <p className="text-xs text-white/40 mt-1 truncate">{note.memo}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
