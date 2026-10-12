import React, { useState } from 'react';
import { Mechanic, GRADE_THRESHOLDS } from '../types/mechanic';
import { Trophy, ArrowUpDown, ChevronRight } from 'lucide-react';

interface SiteComparisonViewProps {
  mechanics: Mechanic[];
  allSites: string[];
  onSelectSite: (site: string) => void;
}

export const SiteComparisonView: React.FC<SiteComparisonViewProps> = ({
  mechanics,
  allSites,
  onSelectSite,
}) => {
  const [sortField, setSortField] = useState<
    'totalPoints' | 'count' | 'avgPoints' | 'promotedCount' | 'cert2026' | 'cert2025' | 'cert2024' | 'bmc' | 'bmh' | 'masaKerja' | 'qcc'
  >('totalPoints');
  const [sortAsc, setSortAsc] = useState(false);

  // Compute stats per site
  const siteRows = allSites.map((site) => {
    const list = mechanics.filter((m) => m.site === site);
    const count = list.length;
    const activeCount = list.filter((m) => m.status === 'Active').length;
    const promotedCount = list.filter((m) => m.promosi2026 === 'Promosi').length;

    const totalPoints = list.reduce((acc, m) => acc + m.currentPoint, 0);
    const avgPoints = count > 0 ? Math.round(totalPoints / count) : 0;

    const bmc = list.reduce((acc, m) => acc + m.rank1BmcPoint, 0);
    const bmh = list.reduce((acc, m) => acc + m.bmhPoint, 0);
    const masaKerja = list.reduce((acc, m) => acc + m.masaKerjaPoint, 0);
    const qcc = list.reduce((acc, m) => acc + m.qccSsPoint, 0);
    const cert2024 = list.reduce((acc, m) => acc + (m.certification2024 || 0), 0);
    const cert2025 = list.reduce((acc, m) => acc + (m.certification2025 || 0), 0);
    const cert2026 = list.reduce((acc, m) => acc + (m.certification2026 || 0), 0);

    // Grade distributions
    const grades: Record<string, number> = { G1: 0, G2: 0, G3: 0, G4: 0, G5: 0, G6: 0, G7: 0 };
    list.forEach((m) => {
      const g = m.upgrade2026 || m.startGrade;
      if (grades[g] !== undefined) grades[g]++;
      else grades['G1']++;
    });

    return {
      site,
      count,
      activeCount,
      promotedCount,
      totalPoints,
      avgPoints,
      bmc,
      bmh,
      masaKerja,
      qcc,
      cert2024,
      cert2025,
      cert2026,
      grades,
    };
  });

  // Sort
  const sortedRows = [...siteRows].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (aVal === bVal) return a.site.localeCompare(b.site);
    return sortAsc ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
  });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Matriks Komparasi Poin & Akselerasi Antar Site</span>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Evaluasi kinerja komprehensif seluruh site: akumulasi poin berjalan, kontribusi sertifikasi, akselerasi kompetensi, dan tingkat promosi grade.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Total {allSites.length} Unit Operasional
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 whitespace-nowrap">Site Lokasi</th>
                <th
                  onClick={() => handleSort('count')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Mekanik</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('promotedCount')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-right text-amber-700"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Promosi '26</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('bmc')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-right text-orange-600"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Rank 1 BMC</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('bmh')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-right text-cyan-600"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>BMH</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('masaKerja')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-right text-emerald-600"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Masa Kerja</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('qcc')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-right text-purple-600"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>QCC / SS</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('cert2024')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-right text-orange-600"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Cert 2024</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('cert2025')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-right text-amber-600"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Cert 2025</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('cert2026')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-right text-blue-600"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Cert 2026</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('avgPoints')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Rata2 Poin</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('totalPoints')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-right font-bold text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Total Current Point</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {sortedRows.map((row) => (
                <tr key={row.site} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-900 whitespace-nowrap">
                    {row.site}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">
                    {row.count} orang
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-amber-700">
                    {row.promotedCount}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-orange-700 font-medium">
                    {row.bmc.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-cyan-700 font-medium">
                    {row.bmh.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-emerald-700 font-medium">
                    {row.masaKerja.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-purple-700 font-medium">
                    {row.qcc.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-orange-700 font-medium">
                    {row.cert2024.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-amber-700 font-medium">
                    {row.cert2025.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-blue-700 font-semibold">
                    {row.cert2026.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-800">
                    {row.avgPoints.toLocaleString()} pts
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-900">
                    {row.totalPoints.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-center font-sans">
                    <button
                      onClick={() => onSelectSite(row.site)}
                      className="px-2 py-1 text-[10px] font-medium text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded inline-flex items-center gap-0.5 transition-colors"
                    >
                      <span>Detail</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Distribution Bar Stack per Site */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <span className="text-base font-bold text-slate-900">
              Distribusi Grade Mekanik (G1–G7) Berdasarkan Site
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Proporsi jenjang karir mekanik di masing-masing site untuk pemetaan suksesi teknis.
            </p>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-3 text-xs">
            {GRADE_THRESHOLDS.map((gt) => (
              <div key={gt.grade} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: gt.color }} />
                <span className="font-mono text-slate-700 font-medium">{gt.grade}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {siteRows.map((s) => {
            if (s.count === 0) return null;
            return (
              <div key={s.site} className="flex items-center gap-3 text-xs">
                <span className="w-24 font-medium text-slate-800 shrink-0 truncate">
                  {s.site}
                </span>
                <div className="flex-1 h-5 rounded bg-slate-100 flex overflow-hidden">
                  {GRADE_THRESHOLDS.map((gt) => {
                    const cnt = s.grades[gt.grade] || 0;
                    if (cnt === 0) return null;
                    const pct = (cnt / s.count) * 100;
                    return (
                      <div
                        key={gt.grade}
                        style={{ width: `${pct}%`, backgroundColor: gt.color }}
                        title={`${s.site} ${gt.grade}: ${cnt} orang (${pct.toFixed(1)}%)`}
                        className="h-full flex items-center justify-center text-[10px] text-white font-mono font-semibold truncate transition-all hover:opacity-90"
                      >
                        {pct > 8 ? `${gt.grade}:${cnt}` : ''}
                      </div>
                    );
                  })}
                </div>
                <span className="w-16 text-right font-mono text-slate-500 tabular-nums shrink-0">
                  {s.count} orang
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
