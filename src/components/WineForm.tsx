'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wine, WineType } from '@/types/wine';
import StarRating from './StarRating';
import ImageUpload from './ImageUpload';

const WINE_TYPES: WineType[] = ['레드', '화이트', '로제', '스파클링', '기타'];

interface WineFormDefaultValues {
  name?: string;
  type?: WineType | null;
  vintage?: number | null;
  grape?: string | null;
  region?: string | null;
  price?: number | null;
  image_url?: string | null;
}

interface WineFormProps {
  wine?: Wine;
  defaultValues?: WineFormDefaultValues;
  cellarWineId?: string | null;
}

export default function WineForm({ wine, defaultValues, cellarWineId }: WineFormProps) {
  const router = useRouter();
  const isEdit = !!wine;

  const [name, setName] = useState(wine?.name ?? defaultValues?.name ?? '');
  const [type, setType] = useState<WineType | ''>(wine?.type ?? defaultValues?.type ?? '');
  const [vintage, setVintage] = useState(wine?.vintage?.toString() ?? defaultValues?.vintage?.toString() ?? '');
  const [grape, setGrape] = useState(wine?.grape ?? defaultValues?.grape ?? '');
  const [region, setRegion] = useState(wine?.region ?? defaultValues?.region ?? '');
  const [price, setPrice] = useState(wine?.price?.toString() ?? defaultValues?.price?.toString() ?? '');
  const [rating, setRating] = useState(wine?.rating ?? 0);
  const [tastingDate, setTastingDate] = useState(
    wine?.tasting_date ?? new Date().toISOString().split('T')[0]
  );
  const [memo, setMemo] = useState(wine?.memo ?? '');
  const [imageUrl, setImageUrl] = useState<string | null>(wine?.image_url ?? defaultValues?.image_url ?? null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = '와인명을 입력해주세요';
    if (rating === 0) newErrors.rating = '별점을 선택해주세요';
    if (!tastingDate) newErrors.tastingDate = '시음 날짜를 선택해주세요';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        type: type || null,
        vintage: vintage ? parseInt(vintage) : null,
        grape: grape.trim() || null,
        region: region.trim() || null,
        price: price ? parseInt(price) : null,
        rating,
        tasting_date: tastingDate,
        memo: memo.trim() || null,
        image_url: imageUrl,
        cellar_wine_id: cellarWineId || null,
      };

      const url = isEdit ? `/api/wines/${wine.id}` : '/api/wines';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('저장 실패');

      router.push(cellarWineId ? `/cellar/${cellarWineId}` : '/');
      router.refresh();
    } catch {
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <ImageUpload value={imageUrl} onChange={setImageUrl} />

      <div>
        <label className="block text-sm font-medium text-white/60 mb-1">
          와인명 <span className="text-[#e57373]">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 샤또 마고 2015"
          className="w-full glass-input rounded-xl px-3 py-2.5"
        />
        {errors.name && <p className="text-[#e57373] text-xs mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-white/60 mb-1">타입</label>
        <div className="flex flex-wrap gap-2">
          {WINE_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(type === t ? '' : t)}
              className={`px-3 py-1.5 rounded-full text-sm pill ${
                type === t ? 'pill-active' : 'pill-inactive'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-white/60 mb-1">빈티지</label>
          <input
            type="number"
            value={vintage}
            onChange={(e) => setVintage(e.target.value)}
            placeholder="예: 2020"
            min="1900"
            max="2030"
            className="w-full glass-input rounded-xl px-3 py-2.5"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/60 mb-1">가격 (원)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="예: 50000"
            min="0"
            className="w-full glass-input rounded-xl px-3 py-2.5"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/60 mb-1">품종</label>
        <input
          type="text"
          value={grape}
          onChange={(e) => setGrape(e.target.value)}
          placeholder="예: 카베르네 소비뇽"
          className="w-full glass-input rounded-xl px-3 py-2.5"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/60 mb-1">산지</label>
        <input
          type="text"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="예: 보르도, 프랑스"
          className="w-full glass-input rounded-xl px-3 py-2.5"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/60 mb-1">
          별점 <span className="text-[#e57373]">*</span>
        </label>
        <StarRating value={rating} onChange={setRating} size="lg" />
        {errors.rating && <p className="text-[#e57373] text-xs mt-1">{errors.rating}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-white/60 mb-1">
          시음 날짜 <span className="text-[#e57373]">*</span>
        </label>
        <input
          type="date"
          value={tastingDate}
          onChange={(e) => setTastingDate(e.target.value)}
          className="w-full glass-input rounded-xl px-3 py-2.5"
        />
        {errors.tastingDate && <p className="text-[#e57373] text-xs mt-1">{errors.tastingDate}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-white/60 mb-1">메모</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="맛, 향, 느낌을 자유롭게 기록하세요"
          rows={4}
          className="w-full glass-input rounded-xl px-3 py-2.5 resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 btn-primary py-3 rounded-xl font-medium"
        >
          {saving ? '저장 중...' : isEdit ? '수정하기' : '저장하기'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 btn-secondary rounded-xl font-medium"
        >
          취소
        </button>
      </div>
    </form>
  );
}
