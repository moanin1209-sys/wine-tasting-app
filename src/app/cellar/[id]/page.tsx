'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CellarWine } from '@/types/cellar';
import { Wine } from '@/types/wine';
import ConfirmModal from '@/components/ConfirmModal';

export default function CellarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [wine, setWine] = useState<CellarWine | null>(null);
  const [tastingNotes, setTastingNotes] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDrinkModal, setShowDrinkModal] = useState(false);

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
    setShowDrinkModal(true);
  };

  const confirmDrink = () => {
    setShowDrinkModal(false);
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
        <p className="text-[--text-muted]">와인을 찾을 수 없습니다</p>
        <Link href="/cellar" className="text-[--accent] mt-2 inline-block hover:underline">
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
        className="text-[--text-muted] text-sm mb-4 hover:text-[--text-secondary] transition-colors"
      >
        ← 뒤로
      </button>

      {wine.image_url ? (
        <div className="card">
          <div className="card-inner">
            <img
              src={wine.image_url}
              alt={wine.name}
              className="w-full h-64 object-cover"
            />
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-inner w-full h-64 flex items-center justify-center text-6xl">
            🍷
          </div>
        </div>
      )}

      <div className="mt-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{wine.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {wine.type && (
                <span className={`text-sm px-2.5 py-0.5 rounded-full ${typeBadgeClass}`}>
                  {wine.type}
                </span>
              )}
              {wine.vintage && (
                <span className="text-sm text-[--text-muted]">{wine.vintage}</span>
              )}
            </div>
          </div>
          <div className={`text-center px-4 py-2 rounded-xl ${
            wine.quantity === 0
              ? 'bg-[--surface-secondary] text-[--text-muted]'
              : 'bg-[--accent-bg] text-[--accent]'
          }`}>
            <p className="text-2xl font-bold">{wine.quantity}</p>
            <p className="text-xs">{wine.quantity === 0 ? '소진' : '병'}</p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
          {wine.grape && (
            <div>
              <p className="text-[--text-muted]">품종</p>
              <p className="text-[--text-secondary]">{wine.grape}</p>
            </div>
          )}
          {wine.region && (
            <div>
              <p className="text-[--text-muted]">산지</p>
              <p className="text-[--text-secondary]">{wine.region}</p>
            </div>
          )}
          {wine.price && (
            <div>
              <p className="text-[--text-muted]">가격</p>
              <p className="text-[--text-secondary]">{formatPrice(wine.price)}</p>
            </div>
          )}
          {wine.purchase_date && (
            <div>
              <p className="text-[--text-muted]">구매일</p>
              <p className="text-[--text-secondary]">{wine.purchase_date}</p>
            </div>
          )}
          {wine.purchase_from && (
            <div className="col-span-2">
              <p className="text-[--text-muted]">구매처</p>
              <p className="text-[--text-secondary]">{wine.purchase_from}</p>
            </div>
          )}
        </div>

        {wine.memo && (
          <div className="glass-card rounded-xl p-4">
            <p className="text-[--text-muted] text-sm mb-1">메모</p>
            <p className="text-[--text-secondary] whitespace-pre-wrap leading-relaxed">
              {wine.memo}
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleDrink}
            disabled={wine.quantity === 0}
            className="flex-1 btn-primary py-3 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {wine.quantity === 0 ? '소진됨' : '🍷 마시기'}
          </button>
          <Link
            href={`/cellar/${wine.id}/edit`}
            className="px-5 py-3 btn-secondary rounded-full font-medium text-center"
          >
            수정
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-5 py-3 btn-danger rounded-full font-medium disabled:opacity-50"
          >
            삭제
          </button>
        </div>

        <ConfirmModal
          isOpen={showDrinkModal}
          title={wine.quantity === 1 ? '마지막 한 병입니다' : undefined}
          message={
            wine.quantity === 1
              ? '정말 오늘인가요?\n셀러에서 마지막 1병이 빠집니다.'
              : '오늘의 한 병을 열어볼까요?\n셀러에서 1병 빠집니다.'
          }
          confirmText="네, 오늘이 그 날입니다"
          cancelText="아직은 아껴두겠습니다"
          onConfirm={confirmDrink}
          onCancel={() => setShowDrinkModal(false)}
        />

        {/* 테이스팅 기록 */}
        {tastingNotes.length > 0 && (
          <div className="pt-4 border-t border-[--border]">
            <h2 className="text-sm font-semibold text-[--text-secondary] mb-3">테이스팅 기록</h2>
            <div className="space-y-2">
              {tastingNotes.map((note) => (
                <Link
                  key={note.id}
                  href={`/wines/${note.id}`}
                  className="block glass-card rounded-xl p-3 hover:bg-[--surface-secondary] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-amber-400">
                      {'★'.repeat(note.rating)}{'☆'.repeat(5 - note.rating)}
                    </span>
                    <span className="text-xs text-[--text-muted]">{note.tasting_date}</span>
                  </div>
                  {note.memo && (
                    <p className="text-xs text-[--text-muted] mt-1 truncate">{note.memo}</p>
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
