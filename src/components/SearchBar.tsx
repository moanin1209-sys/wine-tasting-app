'use client';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative radiant-border rounded-xl">
      <div className="radiant-border-mask rounded-xl" />
      <div className="relative z-10 flex items-center">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
          🔍
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="와인명, 품종, 산지로 검색"
          className="w-full pl-10 pr-10 py-3 bg-white/[0.06] backdrop-blur-xl rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:bg-white/[0.1] transition-all duration-300 border-none"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
