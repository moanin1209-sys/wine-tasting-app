'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wine } from '@/types/wine';
import StarRating from '@/components/StarRating';
import ShareCard from '@/components/ShareCard';

export default function WineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [wine, setWine] = useState<Wine | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    fetch(`/api/wines/${id}`)
      .then((res) => res.json())
      .then(setWine)
      .catch(() => setWine(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    setDeleting(true);
    try {
      await fetch(`/api/wines/${id}`, { method: 'DELETE' });
      router.push('/');
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
        <Link href="/" className="text-[#f9a8d4] mt-2 inline-block hover:underline">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ko-KR').format(price) + '원';

  const typeBadgeClass = wine.type ? `type-badge-${wine.type}` : '';

  return (
    <div className="pt-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.back()}
          className="text-white/50 text-sm hover:text-white/70 transition-colors"
        >
          ← 뒤로
        </button>
        <button
          onClick={() => setShowShare(true)}
          className="text-sm px-3 py-1.5 rounded-full bg-white/[0.08] text-white/60 hover:bg-white/[0.12] hover:text-white/80 transition-all border border-white/[0.08]"
        >
          📤 공유
        </button>
      </div>

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

        <StarRating value={wine.rating} readonly size="md" />

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
          <div>
            <p className="text-white/40">시음 날짜</p>
            <p className="text-white/80">{wine.tasting_date}</p>
          </div>
        </div>

        {wine.memo && (
          <div className="glass-card rounded-xl p-4">
            <p className="text-white/40 text-sm mb-1">메모</p>
            <p className="text-white/80 whitespace-pre-wrap leading-relaxed">
              {wine.memo}
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Link
            href={`/wines/${wine.id}/edit`}
            className="flex-1 text-center py-3 btn-primary rounded-xl font-medium"
          >
            수정
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-6 py-3 btn-danger rounded-xl font-medium disabled:opacity-50"
          >
            {deleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>

      {/* Share Card Modal */}
      {showShare && <ShareCard wine={wine} onClose={() => setShowShare(false)} />}
    </div>
  );
}
