'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import WineForm from '@/components/WineForm';
import { CellarWine } from '@/types/cellar';
import { WishlistWine } from '@/types/wishlist';

function NewWineContent() {
  const searchParams = useSearchParams();
  const fromCellar = searchParams.get('from_cellar');
  const fromWishlist = searchParams.get('from_wishlist');
  const [cellarWine, setCellarWine] = useState<CellarWine | null>(null);
  const [wishlistWine, setWishlistWine] = useState<WishlistWine | null>(null);
  const [loading, setLoading] = useState(!!fromCellar || !!fromWishlist);

  useEffect(() => {
    if (fromCellar) {
      fetch(`/api/cellar/${fromCellar}`)
        .then((r) => r.json())
        .then(setCellarWine)
        .catch(() => setCellarWine(null))
        .finally(() => setLoading(false));
    } else if (fromWishlist) {
      fetch(`/api/wishlist/${fromWishlist}`)
        .then((r) => r.json())
        .then(setWishlistWine)
        .catch(() => setWishlistWine(null))
        .finally(() => setLoading(false));
    }
  }, [fromCellar, fromWishlist]);

  if (loading) {
    return (
      <div className="pt-6 space-y-4">
        <div className="h-6 skeleton rounded w-1/3" />
        <div className="h-48 skeleton rounded-2xl" />
      </div>
    );
  }

  const defaultValues = cellarWine
    ? {
        name: cellarWine.name,
        type: cellarWine.type,
        vintage: cellarWine.vintage,
        grape: cellarWine.grape,
        region: cellarWine.region,
        price: cellarWine.price,
        image_url: cellarWine.image_url,
      }
    : wishlistWine
    ? {
        name: wishlistWine.name,
        type: wishlistWine.type,
        grape: wishlistWine.grape,
        region: wishlistWine.region,
        image_url: wishlistWine.image_url,
      }
    : undefined;

  const title = cellarWine
    ? `🍷 ${cellarWine.name} 테이스팅`
    : wishlistWine
    ? `🍷 ${wishlistWine.name} 테이스팅`
    : '새 와인 기록';

  return (
    <div className="pt-6">
      <h1 className="text-xl font-bold mb-6">{title}</h1>
      <WineForm
        defaultValues={defaultValues}
        cellarWineId={fromCellar}
        wishlistWineId={fromWishlist}
      />
    </div>
  );
}

export default function NewWinePage() {
  return (
    <Suspense fallback={<div className="pt-6"><div className="h-6 skeleton rounded w-1/3" /></div>}>
      <NewWineContent />
    </Suspense>
  );
}
