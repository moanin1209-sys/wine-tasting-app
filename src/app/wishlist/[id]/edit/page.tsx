'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { WishlistWine } from '@/types/wishlist';
import WishlistForm from '@/components/WishlistForm';

export default function EditWishlistPage() {
  const { id } = useParams<{ id: string }>();
  const [wine, setWine] = useState<WishlistWine | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/wishlist/${id}`)
      .then((r) => r.json())
      .then(setWine)
      .catch(() => setWine(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="pt-6 space-y-4">
        <div className="h-6 skeleton rounded w-1/3" />
        <div className="h-48 skeleton rounded-2xl" />
      </div>
    );
  }

  if (!wine) {
    return (
      <div className="pt-6 text-center py-16">
        <p className="text-[--text-muted]">와인을 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="pt-6">
      <h1 className="text-xl font-bold mb-6">위시리스트 수정</h1>
      <WishlistForm wishlistWine={wine} />
    </div>
  );
}
