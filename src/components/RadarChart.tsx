import { memo, useMemo } from 'react';

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

function RadarChartInner({
  body, tannin, acidity, sweetness, aroma,
  size = 200,
}: RadarChartProps) {
  const values = useMemo(() => ({
    aroma: aroma ?? null,
    body: body ?? null,
    tannin: tannin ?? null,
    acidity: acidity ?? null,
    sweetness: sweetness ?? null,
  }), [aroma, body, tannin, acidity, sweetness]);

  const hasData = Object.values(values).some((v) => v !== null);
  if (!hasData) return null;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.35;
  const angleStep = (2 * Math.PI) / 5;
  const startAngle = -Math.PI / 2;

  const { gridPolygons, dataPoints, labelPositions, axisLines, barData } = useMemo(() => {
    const getPoint = (index: number, value: number) => {
      const angle = startAngle + index * angleStep;
      const r = (value / 5) * radius;
      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    };

    const gridPolygons = [1, 2, 3, 4, 5].map((level) =>
      labels.map((_, i) => {
        const p = getPoint(i, level);
        return `${p.x},${p.y}`;
      }).join(' ')
    );

    const dataPoints = labels.map((dim, i) => {
      const val = values[dim.key] ?? 0;
      const p = getPoint(i, val);
      return { str: `${p.x},${p.y}`, p, val };
    });

    const labelPositions = labels.map((_, i) => {
      const angle = startAngle + i * angleStep;
      const labelRadius = radius + 24;
      return { x: cx + labelRadius * Math.cos(angle), y: cy + labelRadius * Math.sin(angle) };
    });

    const axisLines = labels.map((_, i) => {
      const p = getPoint(i, 5);
      return { x1: cx, y1: cy, x2: p.x, y2: p.y };
    });

    const barData = labels.map((dim) => ({
      label: dim.label,
      value: values[dim.key],
    }));

    return { gridPolygons, dataPoints, labelPositions, axisLines, barData };
  }, [values, cx, cy, radius, angleStep, startAngle]);

  return (
    <div className="glass-card rounded-xl p-4">
      <p className="text-[--text-muted] text-sm mb-3">맛 프로필</p>

      <div className="flex justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {gridPolygons.map((points, i) => (
            <polygon key={i} points={points} fill="none" stroke="#e5e5e7" strokeWidth={1} />
          ))}
          {axisLines.map((line, i) => (
            <line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="#e5e5e7" strokeWidth={1} />
          ))}
          <polygon
            points={dataPoints.map(d => d.str).join(' ')}
            fill="rgba(139,34,82,0.25)"
            stroke="#8b2252"
            strokeWidth={2}
          />
          {dataPoints.map((d, i) =>
            d.val === 0 ? null : (
              <circle key={i} cx={d.p.x} cy={d.p.y} r={3} fill="#8b2252" stroke="white" strokeWidth={1.5} />
            )
          )}
          {labels.map((dim, i) => {
            const pos = labelPositions[i];
            const val = values[dim.key];
            return (
              <text key={i} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" className="text-xs" fill="#999999">
                {dim.label}{val !== null ? `(${val})` : ''}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 space-y-2">
        {barData.map(({ label, value }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="text-xs text-[--text-muted] w-12 text-right">{label}</span>
            <div className="flex-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-1.5 flex-1 rounded-full ${
                    value !== null && level <= value ? 'bg-[--accent]' : 'bg-[--surface-secondary]'
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

export default memo(RadarChartInner);
