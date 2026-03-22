'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Wine } from '@/types/wine';
import WineForm from '@/components/WineForm';

export default function EditWinePage() {
  const { id } = useParams<{ id: string }>();
  const [wine, setWine] = useState<Wine | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/wines/${id}`)
      .then((res) => res.json())
      .then(setWine)
      .catch(() => setWine(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="pt-6 space-y-4">
        <div className="h-6 skeleton rounded w-1/3" />
        <div className="h-48 skeleton rounded-2xl" />
        <div className="h-10 skeleton rounded-xl" />
        <div className="h-10 skeleton rounded-xl" />
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

  return (
    <div className="pt-6">
      <h1 className="text-xl font-bold text-white mb-6">와인 수정</h1>
      <WineForm wine={wine} />
    </div>
  );
}
