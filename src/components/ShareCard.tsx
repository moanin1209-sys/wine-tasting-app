'use client';

import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Wine } from '@/types/wine';

interface ShareCardProps {
  wine: Wine;
  onClose: () => void;
}

const TYPE_GRADIENT: Record<string, string> = {
  '레드': 'linear-gradient(135deg, #2d0a1a, #4a1028, #1a0510)',
  '화이트': 'linear-gradient(135deg, #2d2a0a, #4a4010, #1a1505)',
  '로제': 'linear-gradient(135deg, #2d0a20, #4a1038, #1a0515)',
  '스파클링': 'linear-gradient(135deg, #0a1a2d, #102848, #05101a)',
  '기타': 'linear-gradient(135deg, #1a1a1a, #2a2a2a, #0a0a0a)',
};

export default function ShareCard({ wine, onClose }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = `wine-note-${wine.name.replace(/\s/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      alert('이미지 생성에 실패했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        cacheBust: true,
      });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `wine-note.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${wine.name} - Wine Note`,
          files: [file],
        });
      } else {
        // Fallback to download
        handleDownload();
      }
    } catch {
      // User cancelled share or error
    } finally {
      setGenerating(false);
    }
  };

  const bg = TYPE_GRADIENT[wine.type ?? '기타'] ?? TYPE_GRADIENT['기타'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-sm">
        {/* The card to be captured */}
        <div
          ref={cardRef}
          className="rounded-3xl p-6 relative overflow-hidden"
          style={{ background: bg }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3), transparent)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.2), transparent)', transform: 'translate(-30%, 30%)' }} />

          {/* Content */}
          <div className="relative z-10">
            {/* Wine emoji & type badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">🍷</span>
              {wine.type && (
                <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/70 border border-white/10">
                  {wine.type}
                </span>
              )}
            </div>

            {/* Wine name */}
            <h2 className="text-xl font-bold text-white mb-1 leading-tight">{wine.name}</h2>

            {/* Vintage & Region */}
            <div className="flex items-center gap-2 text-sm text-white/50 mb-4">
              {wine.vintage && <span>{wine.vintage}</span>}
              {wine.vintage && wine.region && <span>·</span>}
              {wine.region && <span>{wine.region}</span>}
            </div>

            {/* Rating */}
            <div className="mb-4">
              <div className="flex gap-0.5 text-xl">
                {[1, 2, 3, 4, 5].map(s => (
                  <span key={s} className={s <= wine.rating ? 'text-amber-400' : 'text-white/15'}>★</span>
                ))}
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {wine.grape && (
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider">품종</p>
                  <p className="text-sm text-white/80">{wine.grape}</p>
                </div>
              )}
              {wine.price && (
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider">가격</p>
                  <p className="text-sm text-white/80">{new Intl.NumberFormat('ko-KR').format(wine.price)}원</p>
                </div>
              )}
            </div>

            {/* Memo */}
            {wine.memo && (
              <div className="bg-white/5 rounded-xl p-3 mb-4 border border-white/5">
                <p className="text-sm text-white/60 leading-relaxed line-clamp-3">
                  &ldquo;{wine.memo}&rdquo;
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-[10px] text-white/25 tracking-wider">WINE NOTE</span>
              <span className="text-[10px] text-white/25">{wine.tasting_date}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleShare}
            disabled={generating}
            className="flex-1 btn-primary py-3 rounded-xl font-medium text-sm disabled:opacity-50"
          >
            {generating ? '생성 중...' : '📤 공유하기'}
          </button>
          <button
            onClick={handleDownload}
            disabled={generating}
            className="flex-1 btn-secondary py-3 rounded-xl font-medium text-sm disabled:opacity-50"
          >
            {generating ? '...' : '💾 저장하기'}
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full mt-2 py-2 text-sm text-white/40 hover:text-white/60 transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
