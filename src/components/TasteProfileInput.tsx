'use client';

interface TasteProfileInputProps {
  values: {
    body: number | null;
    tannin: number | null;
    acidity: number | null;
    sweetness: number | null;
    aroma: number | null;
  };
  onChange: (field: string, value: number | null) => void;
}

const dimensions = [
  { key: 'body', label: '바디', description: '가벼움 ← → 무거움' },
  { key: 'tannin', label: '타닌', description: '부드러움 ← → 강함' },
  { key: 'acidity', label: '산미', description: '낮음 ← → 높음' },
  { key: 'sweetness', label: '당도', description: '드라이 ← → 스위트' },
  { key: 'aroma', label: '아로마', description: '단순 ← → 복합' },
] as const;

export default function TasteProfileInput({ values, onChange }: TasteProfileInputProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[--text-secondary]">맛 프로필</label>
        <span className="text-xs text-[--text-muted]">선택사항</span>
      </div>
      {dimensions.map(({ key, label, description }) => {
        const value = values[key];
        return (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[--text-secondary]">{label}</span>
              <span className="text-xs text-[--text-muted]">{description}</span>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => onChange(key, value === level ? null : level)}
                  className={`flex-1 h-8 rounded-md text-xs font-medium transition-all ${
                    value !== null && level <= value
                      ? 'bg-[--accent] text-white'
                      : 'bg-[--surface-secondary] text-[--text-muted] hover:bg-[--surface-secondary]'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
