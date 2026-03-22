'use client';

import { WineType } from '@/types/wine';

const WINE_TYPES: WineType[] = ['레드', '화이트', '로제', '스파클링', '기타'];
const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'rating', label: '점수순' },
  { value: 'name', label: '이름순' },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]['value'];

interface FilterPanelProps {
  selectedType: WineType | null;
  onTypeChange: (type: WineType | null) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export default function FilterPanel({
  selectedType,
  onTypeChange,
  sortBy,
  onSortChange,
}: FilterPanelProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onTypeChange(null)}
          className={`px-3 py-1 rounded-full text-sm pill ${
            selectedType === null ? 'pill-active' : 'pill-inactive'
          }`}
        >
          전체
        </button>
        {WINE_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => onTypeChange(selectedType === t ? null : t)}
            className={`px-3 py-1 rounded-full text-sm pill ${
              selectedType === t ? 'pill-active' : 'pill-inactive'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSortChange(opt.value)}
            className={`text-xs px-2.5 py-1 rounded pill ${
              sortBy === opt.value
                ? 'bg-white/15 text-white border border-white/20'
                : 'pill-inactive'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
