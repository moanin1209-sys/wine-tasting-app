'use client';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
}: StarRatingProps) {
  const sizeMap = {
    sm: { star: 20, viewBox: 24 },
    md: { star: 28, viewBox: 24 },
    lg: { star: 34, viewBox: 24 },
  };
  const s = sizeMap[size];

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            className={`${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-90'
            } transition-transform duration-200`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <svg
              width={s.star}
              height={s.star}
              viewBox={`0 0 ${s.viewBox} ${s.viewBox}`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id={`starGold-${star}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="50%" stopColor="#FFC107" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
              <path
                d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9L12 2.5z"
                fill={filled ? `url(#starGold-${star})` : 'none'}
                stroke={filled ? '#E5A100' : '#D1D5DB'}
                strokeWidth={filled ? '0.8' : '1.5'}
                strokeLinejoin="round"
              />
              {filled && (
                <path
                  d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9L12 2.5z"
                  fill="white"
                  opacity="0.25"
                  clipPath="inset(0 0 60% 0)"
                />
              )}
            </svg>
          </button>
        );
      })}
    </div>
  );
}
