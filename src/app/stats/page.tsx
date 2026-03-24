'use client';

import { useEffect, useState } from 'react';
import { Wine } from '@/types/wine';
import { CellarWine } from '@/types/cellar';
import RadarChart from '@/components/RadarChart';

interface Stats {
  totalTasted: number;
  totalCellar: number;
  avgRating: number;
  totalSpent: number;
  cellarValue: number;
  ratingDist: number[];
  typeDist: { type: string; count: number; pct: number }[];
  topGrapes: { name: string; count: number }[];
  topRegions: { name: string; count: number }[];
  monthlySpending: { month: string; amount: number }[];
  monthlyCount: { month: string; count: number }[];
  avgTaste: Record<string, number | null>;
}

function computeStats(wines: Wine[], cellar: CellarWine[]): Stats {
  const totalTasted = wines.length;
  const totalCellar = cellar.reduce((s, c) => s + c.quantity, 0);
  const avgRating = totalTasted > 0
    ? Math.round((wines.reduce((s, w) => s + w.rating, 0) / totalTasted) * 10) / 10
    : 0;

  // Spending
  const totalSpent = wines.filter(w => w.price).reduce((s, w) => s + (w.price ?? 0), 0);
  const cellarValue = cellar.filter(c => c.price).reduce((s, c) => s + (c.price ?? 0) * c.quantity, 0);

  // Rating distribution [1-5]
  const ratingDist = [0, 0, 0, 0, 0];
  wines.forEach(w => { if (w.rating >= 1 && w.rating <= 5) ratingDist[w.rating - 1]++; });

  // Type distribution
  const typeMap: Record<string, number> = {};
  wines.forEach(w => { if (w.type) typeMap[w.type] = (typeMap[w.type] || 0) + 1; });
  const typeDist = Object.entries(typeMap)
    .map(([type, count]) => ({ type, count, pct: Math.round((count / totalTasted) * 100) }))
    .sort((a, b) => b.count - a.count);

  // Top grapes
  const grapeMap: Record<string, number> = {};
  wines.forEach(w => { if (w.grape) grapeMap[w.grape] = (grapeMap[w.grape] || 0) + 1; });
  const topGrapes = Object.entries(grapeMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top regions
  const regionMap: Record<string, number> = {};
  wines.forEach(w => { if (w.region) regionMap[w.region] = (regionMap[w.region] || 0) + 1; });
  const topRegions = Object.entries(regionMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Monthly spending (last 6 months)
  const now = new Date();
  const monthlySpending: { month: string; amount: number }[] = [];
  const monthlyCount: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${d.getMonth() + 1}월`;
    const monthWines = wines.filter(w => w.tasting_date?.startsWith(key));
    monthlySpending.push({ month: label, amount: monthWines.reduce((s, w) => s + (w.price ?? 0), 0) });
    monthlyCount.push({ month: label, count: monthWines.length });
  }

  // Average taste profile
  const tasteFields = ['body', 'tannin', 'acidity', 'sweetness', 'aroma'] as const;
  const avgTaste: Record<string, number | null> = {};
  for (const field of tasteFields) {
    const vals = wines.map(w => w[field]).filter((v): v is number => v != null && typeof v === 'number');
    avgTaste[field] = vals.length > 0 ? Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10 : null;
  }

  return { totalTasted, totalCellar, avgRating, totalSpent, cellarValue, ratingDist, typeDist, topGrapes, topRegions, monthlySpending, monthlyCount, avgTaste };
}

// --- 데이터 기반 유머 멘트 ---
function getCountComment(n: number): string {
  if (n === 0) return '아직 첫 잔을 기다리는 중입니다 🍷';
  if (n <= 5) return '워밍업 중. 혀도 아직 긴장하고 있습니다.';
  if (n <= 15) return '슬슬 소믈리에 기질이 보입니다.';
  if (n <= 30) return '이 정도면 와인바 단골 자격 충분합니다.';
  if (n <= 50) return '혀가 보르도와 나파밸리를 분간하기 시작했습니다.';
  return '당신의 혀는 이미 국가대표급입니다 🏆';
}

function getTypeComment(typeDist: { type: string; pct: number }[]): string | null {
  if (typeDist.length === 0) return null;
  const top = typeDist[0];
  if (top.type === '레드' && top.pct >= 70) return '확고한 레드 원칙주의자';
  if (top.type === '화이트' && top.pct >= 70) return '화이트의 세계에 깊이 빠진 사람';
  if (top.type === '로제' && top.pct >= 50) return '로제는 여름 한정이라고? 당신에겐 사계절입니다.';
  if (top.type === '스파클링' && top.pct >= 50) return '매일이 축하할 일인 사람 🥂';
  if (top.pct < 50) return '포도 민주주의자 — 어떤 포도도 거부하지 않는 타입';
  return null;
}

function getCellarComment(n: number): string {
  if (n === 0) return '셀러가 텅 비었습니다. 와인샵에 갈 시간이에요.';
  if (n <= 5) return '소박하지만 확실한 취향의 시작';
  if (n <= 15) return '슬슬 와인 냉장고를 고민할 때입니다.';
  if (n <= 30) return '이 정도면 집이 아니라 와인바입니다 🍷';
  return '혹시 와인 수입업도 하시나요? 🍾';
}

function getValueComment(n: number): string | null {
  if (n === 0) return null;
  if (n <= 500000) return '가볍게 시작한 컬렉션';
  if (n <= 2000000) return '냉장고보다 셀러가 비싼 집';
  if (n <= 5000000) return '자산 포트폴리오에 \'와인\' 항목이 필요합니다';
  return '보험 들어야 할 수도 있습니다 🍾';
}

function getTasteProfileType(avgTaste: Record<string, number | null>): { name: string; desc: string } | null {
  const vals = Object.values(avgTaste).filter((v): v is number => v != null);
  if (vals.length < 3) return null;

  const tannin = avgTaste.tannin ?? 0;
  const body = avgTaste.body ?? 0;
  const acidity = avgTaste.acidity ?? 0;
  const sweetness = avgTaste.sweetness ?? 0;
  const aroma = avgTaste.aroma ?? 0;
  const avg = vals.reduce((s, v) => s + v, 0) / vals.length;

  if (tannin >= 4 && body >= 4) return { name: '묵직함 추구자', desc: '입 안을 꽉 채우는 와인을 좋아하는 당신' };
  if (acidity >= 4 && aroma >= 4) return { name: '감각파 탐험가', desc: '향과 산미를 쫓는 예민한 미각의 소유자' };
  if (sweetness >= 4) return { name: '달콤한 세계의 주민', desc: '인생은 달아야 한다는 철학' };
  if (avg <= 3) return { name: '미니멀리스트', desc: '과하지 않은 것이 최고라는 절제의 미학' };
  if (avg >= 4) return { name: '맥시멀리스트', desc: '모든 것이 강렬해야 직성이 풀리는 타입' };
  return { name: '균형의 달인', desc: '어느 하나 치우치지 않는 안정적인 취향' };
}

const TYPE_COLORS: Record<string, string> = {
  '레드': '#ef4444',
  '화이트': '#eab308',
  '로제': '#ec4899',
  '스파클링': '#3b82f6',
  '기타': '#6b7280',
};

const formatPrice = (n: number) => new Intl.NumberFormat('ko-KR').format(n) + '원';

export default function StatsPage() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [cellar, setCellar] = useState<CellarWine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/wines').then(r => r.json()),
      fetch('/api/cellar').then(r => r.json()),
    ])
      .then(([w, c]) => {
        setWines(Array.isArray(w) ? w : []);
        setCellar(Array.isArray(c) ? c : []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="pt-6 space-y-4">
        <div className="h-8 skeleton rounded w-1/3" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 skeleton rounded-2xl" />)}
        </div>
        <div className="h-48 skeleton rounded-2xl" />
      </div>
    );
  }

  const stats = computeStats(wines, cellar);
  const maxRating = Math.max(...stats.ratingDist, 1);
  const maxMonthly = Math.max(...stats.monthlySpending.map(m => m.amount), 1);
  const maxMonthlyCount = Math.max(...stats.monthlyCount.map(m => m.count), 1);

  return (
    <div className="pt-6 pb-4">
      <h1 className="text-2xl font-bold mb-6">통계</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold">{stats.totalTasted}</p>
          <p className="text-xs text-[--text-muted] mt-1">테이스팅 기록</p>
          <p className="text-[10px] text-[--text-muted] mt-1.5">{getCountComment(stats.totalTasted)}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-amber-400">{'★ '}{stats.avgRating}</p>
          <p className="text-xs text-[--text-muted] mt-1">평균 별점</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-[--accent]">{stats.totalCellar}</p>
          <p className="text-xs text-[--text-muted] mt-1">셀러 보유 (병)</p>
          <p className="text-[10px] text-[--text-muted] mt-1.5">{getCellarComment(stats.totalCellar)}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-lg font-bold">{formatPrice(stats.cellarValue)}</p>
          <p className="text-xs text-[--text-muted] mt-1">셀러 총 가치</p>
          {getValueComment(stats.cellarValue) && (
            <p className="text-[10px] text-[--text-muted] mt-1.5">{getValueComment(stats.cellarValue)}</p>
          )}
        </div>
      </div>

      {/* Type Distribution */}
      {stats.typeDist.length > 0 && (
        <div className="glass-card rounded-2xl p-5 mb-4">
          <h2 className="text-sm font-semibold text-[--text-secondary] mb-1">와인 타입 분포</h2>
          {getTypeComment(stats.typeDist) && (
            <p className="text-xs text-[--text-muted] mb-4">{getTypeComment(stats.typeDist)}</p>
          )}
          {!getTypeComment(stats.typeDist) && <div className="mb-3" />}
          <div className="flex items-center gap-3 mb-4">
            {stats.typeDist.map(t => (
              <div key={t.type} className="flex-1 text-center">
                <div
                  className="mx-auto rounded-full mb-2 flex items-center justify-center"
                  style={{
                    width: Math.max(36, t.pct * 0.8) + 'px',
                    height: Math.max(36, t.pct * 0.8) + 'px',
                    background: `${TYPE_COLORS[t.type] ?? '#6b7280'}30`,
                    border: `2px solid ${TYPE_COLORS[t.type] ?? '#6b7280'}60`,
                  }}
                >
                  <span className="text-xs font-bold" style={{ color: TYPE_COLORS[t.type] }}>{t.pct}%</span>
                </div>
                <p className="text-xs text-[--text-muted]">{t.type}</p>
                <p className="text-xs text-[--text-placeholder]">{t.count}병</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rating Distribution */}
      <div className="glass-card rounded-2xl p-5 mb-4">
        <h2 className="text-sm font-semibold text-[--text-secondary] mb-4">별점 분포</h2>
        <div className="flex items-end gap-2 h-28">
          {stats.ratingDist.map((count, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-[--text-muted]">{count}</span>
              <div
                className="w-full rounded-t-lg transition-all duration-500"
                style={{
                  height: `${(count / maxRating) * 80}px`,
                  background: `linear-gradient(to top, rgba(124,45,80,0.7), rgba(180,130,74,0.7))`,
                  minHeight: count > 0 ? '8px' : '2px',
                }}
              />
              <span className="text-xs text-amber-400">{'★'.repeat(i + 1)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Tasting Count */}
      <div className="glass-card rounded-2xl p-5 mb-4">
        <h2 className="text-sm font-semibold text-[--text-secondary] mb-4">월별 테이스팅</h2>
        <div className="flex items-end gap-2 h-24">
          {stats.monthlyCount.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-[--text-muted]">{m.count > 0 ? m.count : ''}</span>
              <div
                className="w-full rounded-t-lg"
                style={{
                  height: `${(m.count / maxMonthlyCount) * 64}px`,
                  background: 'rgba(124,45,80,0.3)',
                  minHeight: m.count > 0 ? '6px' : '2px',
                }}
              />
              <span className="text-[10px] text-[--text-muted]">{m.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Spending */}
      <div className="glass-card rounded-2xl p-5 mb-4">
        <h2 className="text-sm font-semibold text-[--text-secondary] mb-2">월별 소비</h2>
        <p className="text-xs text-[--text-muted] mb-4">총 {formatPrice(stats.totalSpent)}</p>
        <div className="flex items-end gap-2 h-24">
          {stats.monthlySpending.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-[--text-muted]">
                {m.amount > 0 ? (m.amount >= 10000 ? `${Math.round(m.amount / 10000)}만` : formatPrice(m.amount)) : ''}
              </span>
              <div
                className="w-full rounded-t-lg"
                style={{
                  height: `${(m.amount / maxMonthly) * 64}px`,
                  background: 'linear-gradient(to top, rgba(180,130,74,0.5), rgba(180,130,74,0.3))',
                  minHeight: m.amount > 0 ? '6px' : '2px',
                }}
              />
              <span className="text-[10px] text-[--text-muted]">{m.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Grapes & Regions */}
      <div className="grid grid-cols-2 gap-3">
        {stats.topGrapes.length > 0 && (
          <div className="glass-card rounded-2xl p-4">
            <h2 className="text-sm font-semibold text-[--text-secondary] mb-3">🍇 선호 품종</h2>
            <div className="space-y-2">
              {stats.topGrapes.map((g, i) => (
                <div key={g.name} className="flex items-center justify-between">
                  <span className="text-xs text-[--text-secondary] truncate flex-1">
                    <span className="text-[--text-muted] mr-1">{i + 1}.</span>
                    {g.name}
                  </span>
                  <span className="text-xs text-[--accent] ml-2">{g.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {stats.topRegions.length > 0 && (
          <div className="glass-card rounded-2xl p-4">
            <h2 className="text-sm font-semibold text-[--text-secondary] mb-3">🌍 선호 산지</h2>
            <div className="space-y-2">
              {stats.topRegions.map((r, i) => (
                <div key={r.name} className="flex items-center justify-between">
                  <span className="text-xs text-[--text-secondary] truncate flex-1">
                    <span className="text-[--text-muted] mr-1">{i + 1}.</span>
                    {r.name}
                  </span>
                  <span className="text-xs text-amber-600 ml-2">{r.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Average Taste Profile */}
      {Object.values(stats.avgTaste).some(v => v != null) && (
        <div className="mt-4">
          <RadarChart
            body={stats.avgTaste.body != null ? Math.round(stats.avgTaste.body) : null}
            tannin={stats.avgTaste.tannin != null ? Math.round(stats.avgTaste.tannin) : null}
            acidity={stats.avgTaste.acidity != null ? Math.round(stats.avgTaste.acidity) : null}
            sweetness={stats.avgTaste.sweetness != null ? Math.round(stats.avgTaste.sweetness) : null}
            aroma={stats.avgTaste.aroma != null ? Math.round(stats.avgTaste.aroma) : null}
          />
          {(() => {
            const profile = getTasteProfileType(stats.avgTaste);
            if (!profile) return null;
            return (
              <div className="glass-card rounded-xl p-4 mt-3 text-center">
                <p className="text-sm font-semibold text-[--accent]">{profile.name}</p>
                <p className="text-xs text-[--text-muted] mt-1">{profile.desc}</p>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
