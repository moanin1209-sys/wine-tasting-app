'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import WineForm from '@/components/WineForm';
import { CellarWine } from '@/types/cellar';

function NewWineContent() {
  const searchParams = useSearchParams();
  const fromCellar = searchParams.get('from_cellar');
  const [cellarWine, setCellarWine] = useState<CellarWine | null>(null);
  const [loading, setLoading] = useState(!!fromCellar);

  useEffect(() => {
    if (fromCellar) {
      fetch(`/api/cellar/${fromCellar}`)
        .then((r) => r.json())
        .then(setCellarWine)
        .catch(() => setCellarWine(null))
        .finally(() => setLoading(false));
    }
  }, [fromCellar]);

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
    : undefined;

  return (
    <div className="pt-6">
      <h1 className="text-xl font-bold text-white mb-6">
        {cellarWine ? `🍷 ${cellarWine.name} 테이스팅` : '새 와인 기록'}
      </h1>
      <WineForm defaultValues={defaultValues} cellarWineId={fromCellar} />
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
