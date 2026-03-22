'use client';

import { useEffect, useState } from 'react';
import { Wine } from '@/types/wine';
import { CellarWine } from '@/types/cellar';

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

  return { totalTasted, totalCellar, avgRating, totalSpent, cellarValue, ratingDist, typeDist, topGrapes, topRegions, monthlySpending, monthlyCount };
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
      <h1 className="text-2xl font-bold mb-6">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f5f0eb] to-[#b4824a]">통계</span>
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-white">{stats.totalTasted}</p>
          <p className="text-xs text-white/40 mt-1">테이스팅 기록</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-amber-400">{'★ '}{stats.avgRating}</p>
          <p className="text-xs text-white/40 mt-1">평균 별점</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-[#f9a8d4]">{stats.totalCellar}</p>
          <p className="text-xs text-white/40 mt-1">셀러 보유 (병)</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-lg font-bold text-white">{formatPrice(stats.cellarValue)}</p>
          <p className="text-xs text-white/40 mt-1">셀러 총 가치</p>
        </div>
      </div>

      {/* Type Distribution */}
      {stats.typeDist.length > 0 && (
        <div className="glass-card rounded-2xl p-5 mb-4">
          <h2 className="text-sm font-semibold text-white/60 mb-4">와인 타입 분포</h2>
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
                <p className="text-xs text-white/50">{t.type}</p>
                <p className="text-xs text-white/30">{t.count}병</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rating Distribution */}
      <div className="glass-card rounded-2xl p-5 mb-4">
        <h2 className="text-sm font-semibold text-white/60 mb-4">별점 분포</h2>
        <div className="flex items-end gap-2 h-28">
          {stats.ratingDist.map((count, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-white/40">{count}</span>
              <div
                className="w-full rounded-t-lg transition-all duration-500"
                style={{
                  height: `${(count / maxRating) * 80}px`,
                  background: `linear-gradient(to top, rgba(139,34,82,0.6), rgba(180,130,74,0.6))`,
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
        <h2 className="text-sm font-semibold text-white/60 mb-4">월별 테이스팅</h2>
        <div className="flex items-end gap-2 h-24">
          {stats.monthlyCount.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-white/40">{m.count > 0 ? m.count : ''}</span>
              <div
                className="w-full rounded-t-lg"
                style={{
                  height: `${(m.count / maxMonthlyCount) * 64}px`,
                  background: 'rgba(249,168,212,0.4)',
                  minHeight: m.count > 0 ? '6px' : '2px',
                }}
              />
              <span className="text-[10px] text-white/30">{m.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Spending */}
      <div className="glass-card rounded-2xl p-5 mb-4">
        <h2 className="text-sm font-semibold text-white/60 mb-2">월별 소비</h2>
        <p className="text-xs text-white/30 mb-4">총 {formatPrice(stats.totalSpent)}</p>
        <div className="flex items-end gap-2 h-24">
          {stats.monthlySpending.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-white/40">
                {m.amount > 0 ? (m.amount >= 10000 ? `${Math.round(m.amount / 10000)}만` : formatPrice(m.amount)) : ''}
              </span>
              <div
                className="w-full rounded-t-lg"
                style={{
                  height: `${(m.amount / maxMonthly) * 64}px`,
                  background: 'linear-gradient(to top, rgba(180,130,74,0.5), rgba(180,130,74,0.2))',
                  minHeight: m.amount > 0 ? '6px' : '2px',
                }}
              />
              <span className="text-[10px] text-white/30">{m.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Grapes & Regions */}
      <div className="grid grid-cols-2 gap-3">
        {stats.topGrapes.length > 0 && (
          <div className="glass-card rounded-2xl p-4">
            <h2 className="text-sm font-semibold text-white/60 mb-3">🍇 선호 품종</h2>
            <div className="space-y-2">
              {stats.topGrapes.map((g, i) => (
                <div key={g.name} className="flex items-center justify-between">
                  <span className="text-xs text-white/70 truncate flex-1">
                    <span className="text-white/30 mr-1">{i + 1}.</span>
                    {g.name}
                  </span>
                  <span className="text-xs text-[#f9a8d4] ml-2">{g.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {stats.topRegions.length > 0 && (
          <div className="glass-card rounded-2xl p-4">
            <h2 className="text-sm font-semibold text-white/60 mb-3">🌍 선호 산지</h2>
            <div className="space-y-2">
              {stats.topRegions.map((r, i) => (
                <div key={r.name} className="flex items-center justify-between">
                  <span className="text-xs text-white/70 truncate flex-1">
                    <span className="text-white/30 mr-1">{i + 1}.</span>
                    {r.name}
                  </span>
                  <span className="text-xs text-amber-400/80 ml-2">{r.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
