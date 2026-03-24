'use client';

interface RadarChartProps {
  body: number | null;
  tannin: number | null;
  acidity: number | null;
  sweetness: number | null;
  aroma: number | null;
  size?: number;
}

const labels = [
  { key: 'aroma', label: '아로마' },
  { key: 'body', label: '바디' },
  { key: 'tannin', label: '타닌' },
  { key: 'acidity', label: '산미' },
  { key: 'sweetness', label: '당도' },
] as const;

export default function RadarChart({
  body, tannin, acidity, sweetness, aroma,
  size = 200,
}: RadarChartProps) {
  const values = {
    aroma: aroma ?? null,
    body: body ?? null,
    tannin: tannin ?? null,
    acidity: acidity ?? null,
    sweetness: sweetness ?? null,
  };
  const hasData = Object.values(values).some((v) => v !== null && v !== undefined);
  if (!hasData) return null;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.35;
  const angleStep = (2 * Math.PI) / 5;
  const startAngle = -Math.PI / 2; // start from top

  const getPoint = (index: number, value: number) => {
    const angle = startAngle + index * angleStep;
    const r = (value / 5) * radius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // Grid lines (5 levels)
  const gridLevels = [1, 2, 3, 4, 5];
  const gridPolygons = gridLevels.map((level) => {
    const points = labels.map((_, i) => {
      const p = getPoint(i, level);
      return `${p.x},${p.y}`;
    });
    return points.join(' ');
  });

  // Data polygon
  const dataPoints = labels.map((dim, i) => {
    const val = values[dim.key] ?? 0;
    const p = getPoint(i, val);
    return `${p.x},${p.y}`;
  });

  // Label positions (slightly outside the chart)
  const labelPositions = labels.map((_, i) => {
    const angle = startAngle + i * angleStep;
    const labelRadius = radius + 24;
    return {
      x: cx + labelRadius * Math.cos(angle),
      y: cy + labelRadius * Math.sin(angle),
    };
  });

  // Axis lines
  const axisLines = labels.map((_, i) => {
    const p = getPoint(i, 5);
    return { x1: cx, y1: cy, x2: p.x, y2: p.y };
  });

  // Bar indicators below chart
  const barData = labels.map((dim) => ({
    label: dim.label,
    value: values[dim.key],
  }));

  return (
    <div className="glass-card rounded-xl p-4">
      <p className="text-[--text-muted] text-sm mb-3">맛 프로필</p>

      {/* SVG Radar Chart */}
      <div className="flex justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Grid polygons */}
          {gridPolygons.map((points, i) => (
            <polygon
              key={i}
              points={points}
              fill="none"
              stroke="#e5e5e7"
              strokeWidth={1}
            />
          ))}

          {/* Axis lines */}
          {axisLines.map((line, i) => (
            <line
              key={i}
              x1={line.x1} y1={line.y1}
              x2={line.x2} y2={line.y2}
              stroke="#e5e5e7"
              strokeWidth={1}
            />
          ))}

          {/* Data polygon */}
          <polygon
            points={dataPoints.join(' ')}
            fill="rgba(139,34,82,0.25)"
            stroke="#8b2252"
            strokeWidth={2}
          />

          {/* Data points */}
          {labels.map((dim, i) => {
            const val = values[dim.key] ?? 0;
            if (val === 0) return null;
            const p = getPoint(i, val);
            return (
              <circle
                key={i}
                cx={p.x} cy={p.y}
                r={3}
                fill="#8b2252"
                stroke="white"
                strokeWidth={1.5}
              />
            );
          })}

          {/* Labels */}
          {labels.map((dim, i) => {
            const pos = labelPositions[i];
            const val = values[dim.key];
            return (
              <text
                key={i}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs"
                fill="#999999"
              >
                {dim.label}{val !== null ? `(${val})` : ''}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Bar indicators */}
      <div className="mt-3 space-y-2">
        {barData.map(({ label, value }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="text-xs text-[--text-muted] w-12 text-right">{label}</span>
            <div className="flex-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-1.5 flex-1 rounded-full ${
                    value !== null && level <= value
                      ? 'bg-[--accent]'
                      : 'bg-[--surface-secondary]'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-[--text-muted] w-4">{value ?? '-'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
