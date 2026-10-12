import React, { useState, useMemo } from 'react';
import { Mechanic } from '../types/mechanic';
import { BarChart3, Layers, Info, Filter, ArrowUpRight } from 'lucide-react';

interface SiteCategoryChartsProps {
  mechanics: Mechanic[];
  selectedSite: string;
  onSelectSite: (site: string) => void;
  allSites: string[];
}

interface CategoryConfig {
  key: 'rank1BmcPoint' | 'bmhPoint' | 'masaKerjaPoint' | 'qccSsPoint' | 'certification2026' | 'certification2025';
  label: string;
  shortLabel: string;
  color: string;
  description: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: 'rank1BmcPoint',
    label: 'Rank 1 BMC',
    shortLabel: 'BMC R1',
    color: '#F97316', // Orange
    description: 'Poin prestasi peringkat 1 kursus Basic Mechanic Course',
  },
  {
    key: 'bmhPoint',
    label: 'BMH',
    shortLabel: 'BMH',
    color: '#06B6D4', // Cyan
    description: 'Poin kelulusan kualifikasi Basic Maintenance Heavy/Hydraulic',
  },
  {
    key: 'masaKerjaPoint',
    label: 'Masa Kerja',
    shortLabel: 'Masa Kerja',
    color: '#10B981', // Emerald
    description: 'Poin pengabdian dan jam terbang masa kerja mekanik',
  },
  {
    key: 'qccSsPoint',
    label: 'QCC / SS',
    shortLabel: 'QCC/SS',
    color: '#8B5CF6', // Purple
    description: 'Poin inovasi Quality Control Circle & Sumbang Saran ide perbaikan',
  },
  {
    key: 'certification2025',
    label: 'Certification 2025',
    shortLabel: 'Cert 2025',
    color: '#EAB308', // Amber
    description: 'Poin hasil uji sertifikasi mekanik periode tahun 2025',
  },
  {
    key: 'certification2026',
    label: 'Certification 2026',
    shortLabel: 'Cert 2026',
    color: '#3B82F6', // Blue
    description: 'Poin hasil uji sertifikasi mekanik periode berjalan 2026',
  },
];

export const SiteCategoryCharts: React.FC<SiteCategoryChartsProps> = ({
  mechanics,
  selectedSite,
  onSelectSite,
  allSites,
}) => {
  const [metricMode, setMetricMode] = useState<'total' | 'avg'>('total');
  const [chartType, setChartType] = useState<'stacked' | 'grouped'>('stacked');
  const [hoveredData, setHoveredData] = useState<{
    site: string;
    category: string;
    value: number;
    totalSite: number;
    count: number;
    color: string;
    x: number;
    y: number;
  } | null>(null);

  // Compute aggregation per site
  const siteAggregates = useMemo(() => {
    const map = new Map<
      string,
      {
        site: string;
        count: number;
        rank1BmcPoint: number;
        bmhPoint: number;
        masaKerjaPoint: number;
        qccSsPoint: number;
        certification2025: number;
        certification2026: number;
        totalPoints: number;
      }
    >();

    allSites.forEach((site) => {
      map.set(site, {
        site,
        count: 0,
        rank1BmcPoint: 0,
        bmhPoint: 0,
        masaKerjaPoint: 0,
        qccSsPoint: 0,
        certification2025: 0,
        certification2026: 0,
        totalPoints: 0,
      });
    });

    mechanics.forEach((m) => {
      const entry = map.get(m.site);
      if (entry) {
        entry.count += 1;
        entry.rank1BmcPoint += m.rank1BmcPoint;
        entry.bmhPoint += m.bmhPoint;
        entry.masaKerjaPoint += m.masaKerjaPoint;
        entry.qccSsPoint += m.qccSsPoint;
        entry.certification2025 += m.certification2025;
        entry.certification2026 += m.certification2026;
        entry.totalPoints +=
          m.rank1BmcPoint +
          m.bmhPoint +
          m.masaKerjaPoint +
          m.qccSsPoint +
          m.certification2025 +
          m.certification2026;
      }
    });

    // Return list sorted by total points descending
    return Array.from(map.values()).sort((a, b) => b.totalPoints - a.totalPoints);
  }, [mechanics, allSites]);

  // Max value calculation for chart scaling
  const maxValue = useMemo(() => {
    if (metricMode === 'total') {
      if (chartType === 'stacked') {
        const max = Math.max(...siteAggregates.map((s) => s.totalPoints), 100);
        return Math.ceil(max / 100) * 100;
      } else {
        let maxSingle = 100;
        siteAggregates.forEach((s) => {
          CATEGORIES.forEach((c) => {
            const val = s[c.key];
            if (val > maxSingle) maxSingle = val;
          });
        });
        return Math.ceil(maxSingle / 50) * 50;
      }
    } else {
      // Average mode
      if (chartType === 'stacked') {
        const maxAvgTotal = Math.max(
          ...siteAggregates.map((s) => (s.count > 0 ? s.totalPoints / s.count : 0)),
          50
        );
        return Math.ceil(maxAvgTotal / 10) * 10;
      } else {
        let maxSingleAvg = 30;
        siteAggregates.forEach((s) => {
          if (s.count > 0) {
            CATEGORIES.forEach((c) => {
              const val = s[c.key] / s.count;
              if (val > maxSingleAvg) maxSingleAvg = val;
            });
          }
        });
        return Math.ceil(maxSingleAvg / 5) * 5;
      }
    }
  }, [siteAggregates, metricMode, chartType]);

  // Deep dive data for selected site (or top site if ALL)
  const currentFocusedSite = selectedSite !== 'ALL' ? selectedSite : (siteAggregates[0]?.site || 'GAM-SKL');
  const focusedSiteData = useMemo(() => {
    return siteAggregates.find((s) => s.site === currentFocusedSite) || siteAggregates[0];
  }, [siteAggregates, currentFocusedSite]);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                Grafik Poin Akselerasi & Sertifikasi Berdasarkan Site
              </span>
              <span className="text-xs text-slate-500">
                · Rank 1 BMC, BMH, Masa Kerja, QCC/SS, Cert 2026 & 2025
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Analisis perolehan poin akselerasi dan capaian sertifikasi mekanik di setiap lokasi operasional site.
            </p>
          </div>

          {/* Toggle controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Total vs Average selector */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                onClick={() => setMetricMode('total')}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                  metricMode === 'total'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Total Poin Site
              </button>
              <button
                onClick={() => setMetricMode('avg')}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                  metricMode === 'avg'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rata-rata per Mechanic
              </button>
            </div>

            {/* Stacked vs Grouped */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                onClick={() => setChartType('stacked')}
                title="Tampilan Tumpuk Komposisi"
                className={`px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1 whitespace-nowrap ${
                  chartType === 'stacked'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Stacked</span>
              </button>
              <button
                onClick={() => setChartType('grouped')}
                title="Tampilan Berdampingan"
                className={`px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1 whitespace-nowrap ${
                  chartType === 'grouped'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Grouped</span>
              </button>
            </div>
          </div>
        </div>

        {/* Legend strip */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
          <span className="text-slate-500 font-medium">Kategori Poin:</span>
          {CATEGORIES.map((cat) => (
            <div key={cat.key} className="flex items-center gap-1.5 text-slate-700">
              <span
                className="w-3 h-3 rounded-xs shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="font-medium">{cat.label}</span>
            </div>
          ))}
        </div>

        {/* Main Chart Canvas (SVG-based for precision & zero-dependency stability) */}
        <div className="mt-6 relative">
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[760px] h-84 relative">
              <svg className="w-full h-full select-none" viewBox="0 0 860 300">
                {/* Y-axis grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const y = 240 - ratio * 200;
                  const labelValue = Math.round(ratio * maxValue);
                  return (
                    <g key={ratio}>
                      <line
                        x1="60"
                        y1={y}
                        x2="840"
                        y2={y}
                        stroke="#F1F5F9"
                        strokeDasharray={ratio === 0 ? 'none' : '3 3'}
                        strokeWidth="1"
                      />
                      <text
                        x="50"
                        y={y + 4}
                        textAnchor="end"
                        className="text-[10px] font-mono fill-slate-400 tabular-nums"
                      >
                        {labelValue.toLocaleString()}
                      </text>
                    </g>
                  );
                })}

                {/* X-axis baseline */}
                <line x1="60" y1="240" x2="840" y2="240" stroke="#CBD5E1" strokeWidth="1.5" />

                {/* Bars for each site */}
                {siteAggregates.map((siteItem, sIdx) => {
                  const totalBars = siteAggregates.length;
                  const barAreaWidth = (840 - 70) / totalBars;
                  const groupX = 70 + sIdx * barAreaWidth;
                  const isSelected = selectedSite === siteItem.site;

                  if (chartType === 'stacked') {
                    // Stacked bar calculation
                    const barWidth = Math.min(36, barAreaWidth * 0.65);
                    const barX = groupX + (barAreaWidth - barWidth) / 2;

                    let cumulativeY = 240;

                    return (
                      <g
                        key={siteItem.site}
                        className="cursor-pointer group"
                        onClick={() => onSelectSite(isSelected ? 'ALL' : siteItem.site)}
                      >
                        {/* Hover highlight background column */}
                        <rect
                          x={groupX + 2}
                          y={30}
                          width={barAreaWidth - 4}
                          height={210}
                          fill={isSelected ? '#EFF6FF' : 'transparent'}
                          rx="4"
                          className="group-hover:fill-slate-50 transition-colors"
                        />

                        {/* Stacked segments */}
                        {CATEGORIES.map((cat) => {
                          const rawVal = siteItem[cat.key];
                          const val = metricMode === 'avg' && siteItem.count > 0
                            ? rawVal / siteItem.count
                            : rawVal;

                          const height = maxValue > 0 ? (val / maxValue) * 200 : 0;
                          const currentY = cumulativeY - height;
                          cumulativeY = currentY;

                          if (height <= 0.5) return null;

                          return (
                            <rect
                              key={cat.key}
                              x={barX}
                              y={currentY}
                              width={barWidth}
                              height={height}
                              fill={cat.color}
                              rx={1}
                              className="transition-all opacity-95 group-hover:opacity-100"
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoveredData({
                                  site: siteItem.site,
                                  category: cat.label,
                                  value: Math.round(val),
                                  totalSite: Math.round(
                                    metricMode === 'avg' && siteItem.count > 0
                                      ? siteItem.totalPoints / siteItem.count
                                      : siteItem.totalPoints
                                  ),
                                  count: siteItem.count,
                                  color: cat.color,
                                  x: rect.left + rect.width / 2,
                                  y: rect.top,
                                });
                              }}
                              onMouseLeave={() => setHoveredData(null)}
                            />
                          );
                        })}

                        {/* Site label below bar */}
                        <text
                          x={barX + barWidth / 2}
                          y="256"
                          textAnchor="middle"
                          className={`text-[10px] font-medium ${
                            isSelected ? 'fill-blue-700 font-bold' : 'fill-slate-600'
                          }`}
                        >
                          {siteItem.site}
                        </text>
                        {/* Mechanic count indicator */}
                        <text
                          x={barX + barWidth / 2}
                          y="268"
                          textAnchor="middle"
                          className="text-[9px] font-mono fill-slate-400 tabular-nums"
                        >
                          {siteItem.count} mech
                        </text>

                        {/* Total indicator on top */}
                        <text
                          x={barX + barWidth / 2}
                          y={Math.max(22, cumulativeY - 4)}
                          textAnchor="middle"
                          className="text-[9px] font-mono font-semibold fill-slate-700 tabular-nums"
                        >
                          {Math.round(
                            metricMode === 'avg' && siteItem.count > 0
                              ? siteItem.totalPoints / siteItem.count
                              : siteItem.totalPoints
                          ).toLocaleString()}
                        </text>
                      </g>
                    );
                  } else {
                    // Grouped bars calculation (6 mini bars side by side per site)
                    const totalCatBars = CATEGORIES.length;
                    const groupSlotWidth = barAreaWidth * 0.85;
                    const miniBarWidth = Math.max(3, (groupSlotWidth - (totalCatBars - 1) * 2) / totalCatBars);
                    const startX = groupX + (barAreaWidth - groupSlotWidth) / 2;

                    return (
                      <g
                        key={siteItem.site}
                        className="cursor-pointer group"
                        onClick={() => onSelectSite(isSelected ? 'ALL' : siteItem.site)}
                      >
                        <rect
                          x={groupX + 2}
                          y={30}
                          width={barAreaWidth - 4}
                          height={210}
                          fill={isSelected ? '#EFF6FF' : 'transparent'}
                          rx="4"
                          className="group-hover:fill-slate-50 transition-colors"
                        />

                        {CATEGORIES.map((cat, cIdx) => {
                          const rawVal = siteItem[cat.key];
                          const val = metricMode === 'avg' && siteItem.count > 0
                            ? rawVal / siteItem.count
                            : rawVal;

                          const height = maxValue > 0 ? (val / maxValue) * 200 : 0;
                          const barX = startX + cIdx * (miniBarWidth + 2);
                          const barY = 240 - height;

                          return (
                            <rect
                              key={cat.key}
                              x={barX}
                              y={barY}
                              width={miniBarWidth}
                              height={Math.max(1, height)}
                              fill={cat.color}
                              rx={1}
                              className="transition-all opacity-90 hover:opacity-100"
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoveredData({
                                  site: siteItem.site,
                                  category: cat.label,
                                  value: Math.round(val),
                                  totalSite: siteItem.totalPoints,
                                  count: siteItem.count,
                                  color: cat.color,
                                  x: rect.left + rect.width / 2,
                                  y: rect.top,
                                });
                              }}
                              onMouseLeave={() => setHoveredData(null)}
                            />
                          );
                        })}

                        <text
                          x={startX + groupSlotWidth / 2}
                          y="256"
                          textAnchor="middle"
                          className={`text-[10px] font-medium ${
                            isSelected ? 'fill-blue-700 font-bold' : 'fill-slate-600'
                          }`}
                        >
                          {siteItem.site}
                        </text>
                        <text
                          x={startX + groupSlotWidth / 2}
                          y="268"
                          textAnchor="middle"
                          className="text-[9px] font-mono fill-slate-400 tabular-nums"
                        >
                          {siteItem.count} mech
                        </text>
                      </g>
                    );
                  }
                })}
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 mt-1 px-2">
            <span className="flex items-center gap-1 text-[11px]">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              Klik pada batang site untuk memfilter tabel atau mendalami rincian site tersebut.
            </span>
            <span className="text-[11px] font-mono">
              Satuan: {metricMode === 'total' ? 'Total Poin Kumulatif' : 'Rata-rata Poin per Orang'}
            </span>
          </div>
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredData && (
        <div
          className="fixed pointer-events-none z-50 bg-slate-900 text-white rounded-lg px-3 py-2 text-xs shadow-xl transform -translate-x-1/2 -translate-y-full mb-2"
          style={{ left: hoveredData.x, top: hoveredData.y }}
        >
          <div className="font-bold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hoveredData.color }} />
            <span>{hoveredData.site}</span>
            <span className="text-slate-400 font-normal">({hoveredData.count} mechanic)</span>
          </div>
          <div className="mt-1 text-slate-200">
            {hoveredData.category}:{' '}
            <strong className="font-mono tabular-nums text-white">{hoveredData.value.toLocaleString()} pts</strong>
          </div>
          <div className="text-[11px] text-slate-400">
            Total Seluruh Kategori: {hoveredData.totalSite.toLocaleString()} pts
          </div>
        </div>
      )}

      {/* Deep-Dive Grid for Selected / Highlighted Site */}
      {focusedSiteData && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900">
                  Rincian 6 Kategori Poin: {focusedSiteData.site}
                </span>
                {selectedSite !== focusedSiteData.site && (
                  <button
                    onClick={() => onSelectSite(focusedSiteData.site)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-0.5"
                  >
                    <span>Filter ke Site Ini</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Total mekanik: <strong className="font-mono text-slate-800">{focusedSiteData.count} orang</strong> · Total akumulasi poin akselerasi & sertifikasi:{' '}
                <strong className="font-mono text-slate-800">{focusedSiteData.totalPoints.toLocaleString()} pts</strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Pilih Site untuk Rincian:</span>
              <select
                value={focusedSiteData.site}
                onChange={(e) => onSelectSite(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              >
                {allSites.map((s) => (
                  <option key={s} value={s}>
                    {s} ({siteAggregates.find((x) => x.site === s)?.count || 0} orang)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 6 Category Breakdown Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
            {CATEGORIES.map((cat) => {
              const val = focusedSiteData[cat.key];
              const avg = focusedSiteData.count > 0 ? (val / focusedSiteData.count).toFixed(1) : '0';
              const percentOfTotal =
                focusedSiteData.totalPoints > 0
                  ? ((val / focusedSiteData.totalPoints) * 100).toFixed(1)
                  : '0';

              return (
                <div
                  key={cat.key}
                  className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-3 relative overflow-hidden"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div className="text-xs font-semibold text-slate-700 truncate" title={cat.label}>
                    {cat.label}
                  </div>
                  <div className="mt-2 text-xl font-bold font-mono tabular-nums text-slate-900">
                    {val.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Rata2: {avg} pts
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Porsi Site:</span>
                    <span className="font-semibold font-mono text-slate-700">{percentOfTotal}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Year-over-Year Certification Comparison Strip */}
          <div className="mt-5 p-3.5 bg-blue-50/50 border border-blue-100 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold font-mono">
                VS
              </div>
              <div>
                <span className="font-bold text-slate-900">
                  Perbandingan Sertifikasi Site {focusedSiteData.site}:
                </span>
                <span className="text-slate-600 ml-1">
                  Certification 2025 (<strong className="font-mono text-amber-700">{focusedSiteData.certification2025.toLocaleString()} pts</strong>) vs Certification 2026 (
                  <strong className="font-mono text-blue-700">{focusedSiteData.certification2026.toLocaleString()} pts</strong>)
                </span>
              </div>
            </div>
            <div className="text-slate-600 sm:text-right font-mono text-[11px]">
              Diferensial:{' '}
              <span
                className={`font-bold ${
                  focusedSiteData.certification2026 >= focusedSiteData.certification2025
                    ? 'text-emerald-600'
                    : 'text-amber-600'
                }`}
              >
                {focusedSiteData.certification2026 >= focusedSiteData.certification2025 ? '+' : ''}
                {(focusedSiteData.certification2026 - focusedSiteData.certification2025).toLocaleString()} pts
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
