'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { WishlistWine } from '@/types/wishlist';

export default function WishlistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [wine, setWine] = useState<WishlistWine | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/wishlist/${id}`)
      .then((res) => res.json())
      .then(setWine)
      .catch(() => setWine(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    setDeleting(true);
    try {
      await fetch(`/api/wishlist/${id}`, { method: 'DELETE' });
      router.push('/wishlist');
      router.refresh();
    } catch {
      alert('삭제에 실패했습니다.');
      setDeleting(false);
    }
  };

  const handleTriedIt = () => {
    // Navigate to new tasting note with wishlist data pre-filled
    router.push(`/wines/new?from_wishlist=${id}`);
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
        <Link href="/wishlist" className="text-[--accent] mt-2 inline-block hover:underline">
          위시리스트로 돌아가기
        </Link>
      </div>
    );
  }

  const typeBadgeClass = wine.type ? `type-badge-${wine.type}` : '';

  return (
    <div className="pt-6">
      <button
        onClick={() => router.back()}
        className="text-[--text-muted] text-sm hover:text-[--text-secondary] transition-colors mb-4"
      >
        ← 뒤로
      </button>

      {wine.image_url ? (
        <div className="card">
          <div className="card-inner">
            <img src={wine.image_url} alt={wine.name} className="w-full h-64 object-cover" />
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-inner w-full h-64 flex items-center justify-center text-6xl">
            💭
          </div>
        </div>
      )}

      <div className="mt-5 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">{wine.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            {wine.type && (
              <span className={`text-sm px-2.5 py-0.5 rounded-full ${typeBadgeClass}`}>
                {wine.type}
              </span>
            )}
            {/* Priority dots */}
            <div className="flex gap-1 items-center">
              {[1, 2, 3, 4, 5].map((p) => (
                <div
                  key={p}
                  className={`w-2 h-2 rounded-full ${
                    p <= wine.priority ? 'bg-[--accent]' : 'bg-[--surface-secondary]'
                  }`}
                />
              ))}
              <span className="text-xs text-[--text-muted] ml-1">우선순위</span>
            </div>
          </div>
        </div>

        {/* "마셔봤어요" button */}
        <button
          onClick={handleTriedIt}
          className="w-full py-3.5 rounded-full btn-primary font-medium text-center"
        >
          🍷 마셔봤어요!
        </button>

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
          {wine.price_range && (
            <div>
              <p className="text-[--text-muted]">가격대</p>
              <p className="text-[--text-secondary]">{wine.price_range}</p>
            </div>
          )}
        </div>

        {wine.reason && (
          <div className="glass-card rounded-xl p-4">
            <p className="text-[--text-muted] text-sm mb-1">마시고 싶은 이유</p>
            <p className="text-[--text-secondary] whitespace-pre-wrap leading-relaxed">
              {wine.reason}
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Link
            href={`/wishlist/${wine.id}/edit`}
            className="flex-1 text-center py-3 btn-primary rounded-full font-medium"
          >
            수정
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-6 py-3 btn-danger rounded-full font-medium disabled:opacity-50"
          >
            {deleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  );
}
