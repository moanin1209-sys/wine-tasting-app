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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[15px] font-semibold text-[--text-primary]">맛 프로필</label>
        <span className="text-xs text-[--text-muted]">선택사항</span>
      </div>
      {dimensions.map(({ key, label, description }) => {
        const value = values[key];
        return (
          <div key={key} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[--text-secondary]">{label}</span>
              <span className="text-[11px] text-[--text-muted]">{description}</span>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((level) => {
                const isFilled = value !== null && level <= value;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onChange(key, value === level ? null : level)}
                    className={`
                      flex-1 h-9 rounded-xl text-[13px] font-medium
                      transition-all duration-200
                      ${isFilled
                        ? 'bg-[#7c2d50] text-white'
                        : 'bg-[#f5f5f5] text-[#999]'
                      }
                      active:scale-[0.96]
                    `}
                    style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
