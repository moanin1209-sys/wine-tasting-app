'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WishlistWine } from '@/types/wishlist';
import { WineType } from '@/types/wine';
import ImageUpload from './ImageUpload';

const WINE_TYPES: WineType[] = ['레드', '화이트', '로제', '스파클링', '기타'];

interface WishlistFormProps {
  wishlistWine?: WishlistWine;
}

export default function WishlistForm({ wishlistWine }: WishlistFormProps) {
  const router = useRouter();
  const isEdit = !!wishlistWine;

  const [name, setName] = useState(wishlistWine?.name ?? '');
  const [type, setType] = useState<WineType | ''>(wishlistWine?.type ?? '');
  const [grape, setGrape] = useState(wishlistWine?.grape ?? '');
  const [region, setRegion] = useState(wishlistWine?.region ?? '');
  const [priceRange, setPriceRange] = useState(wishlistWine?.price_range ?? '');
  const [reason, setReason] = useState(wishlistWine?.reason ?? '');
  const [priority, setPriority] = useState(wishlistWine?.priority ?? 3);
  const [imageUrl, setImageUrl] = useState<string | null>(wishlistWine?.image_url ?? null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = '와인명을 입력해주세요';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        type: type || null,
        grape: grape.trim() || null,
        region: region.trim() || null,
        price_range: priceRange.trim() || null,
        reason: reason.trim() || null,
        priority,
        image_url: imageUrl,
      };

      const url = isEdit ? `/api/wishlist/${wishlistWine.id}` : '/api/wishlist';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '저장 실패');
      }

      if (isEdit) {
        router.push(`/wishlist/${wishlistWine.id}`);
      } else {
        router.push('/wishlist');
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <ImageUpload value={imageUrl} onChange={setImageUrl} />

      <div>
        <label className="block text-sm font-medium text-[--text-secondary] mb-1">
          와인명 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 오퍼스 원 2018"
          className="w-full glass-input rounded-xl px-3 py-2.5"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-[--text-secondary] mb-1">타입</label>
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

      <div>
        <label className="block text-sm font-medium text-[--text-secondary] mb-1">품종</label>
        <input
          type="text"
          value={grape}
          onChange={(e) => setGrape(e.target.value)}
          placeholder="예: 카베르네 소비뇽"
          className="w-full glass-input rounded-xl px-3 py-2.5"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[--text-secondary] mb-1">산지</label>
        <input
          type="text"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="예: 나파 밸리, 미국"
          className="w-full glass-input rounded-xl px-3 py-2.5"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[--text-secondary] mb-1">가격대</label>
        <input
          type="text"
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          placeholder="예: 5-10만원"
          className="w-full glass-input rounded-xl px-3 py-2.5"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[--text-secondary] mb-1">
          우선순위
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`flex-1 h-10 rounded-lg text-sm font-medium transition-all ${
                priority === p
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[--surface-secondary] text-[--text-muted] hover:bg-[--surface-secondary]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <p className="text-xs text-[--text-muted] mt-1">1 = 낮음, 5 = 높음</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[--text-secondary] mb-1">마시고 싶은 이유</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="추천받은 이유, 기대하는 점 등"
          rows={3}
          className="w-full glass-input rounded-xl px-3 py-2.5 resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 btn-primary py-3.5 rounded-full font-medium"
        >
          {saving ? '저장 중...' : isEdit ? '수정하기' : '저장하기'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3.5 btn-secondary rounded-full font-medium"
        >
          취소
        </button>
      </div>
    </form>
  );
}
