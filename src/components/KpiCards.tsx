import React from 'react';
import { Users, Award, TrendingUp, Sparkles, Calendar } from 'lucide-react';
import { Mechanic } from '../types/mechanic';

interface KpiCardsProps {
  mechanics: Mechanic[];
  selectedSite: string;
  activeSheet?: '2026' | '2024-2025';
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  mechanics,
  selectedSite,
  activeSheet = '2026',
}) => {
  const totalCount = mechanics.length;
  const activeCount = mechanics.filter((m) => m.status === 'Active').length;

  if (activeSheet === '2024-2025') {
    // KPI metrics for the 2024-2025 sheet
    const totalPoints2025 = mechanics.reduce((acc, m) => acc + (m.currentPoint2025 || m.startPoint), 0);
    const avgPoints2025 = totalCount > 0 ? Math.round(totalPoints2025 / totalCount) : 0;
    const totalCert2024 = mechanics.reduce((acc, m) => acc + (m.certification2024 || 0), 0);
    const totalCert2025 = mechanics.reduce((acc, m) => acc + (m.certification2025 || 0), 0);
    const promoted2025 = mechanics.filter((m) => m.promosi2025 === 'Promosi').length;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Mechanics in 2024-2025 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Mekanik 2024–2025
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
              {totalCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">
              orang {selectedSite !== 'ALL' ? `(${selectedSite})` : 'semua site'}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>
              Aktif: <strong className="font-mono tabular-nums text-slate-900">{activeCount}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Promosi '25: <strong className="font-mono tabular-nums text-amber-700">{promoted2025}</strong>
            </span>
          </div>
        </div>

        {/* KPI 2: Total & Avg Points 2024-2025 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Rata-rata Poin 2024–2025
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
              {avgPoints2025}
            </span>
            <span className="text-xs text-slate-500">poin / mechanic</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Akumulasi Poin:</span>
            <span className="font-mono tabular-nums font-semibold text-slate-900">
              {totalPoints2025.toLocaleString()} pts
            </span>
          </div>
        </div>

        {/* KPI 3: Certification 2024 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-orange-700 uppercase tracking-wider font-semibold">
              Certification 2024
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-orange-950">
              {totalCert2024.toLocaleString()}
            </span>
            <span className="text-xs text-orange-800">total poin uji</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Peserta Sertifikasi:</span>
            <span className="font-mono tabular-nums font-semibold text-slate-900">
              {mechanics.filter((m) => (m.certification2024 || 0) > 0).length} mekanik
            </span>
          </div>
        </div>

        {/* KPI 4: Certification 2025 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-700 uppercase tracking-wider font-semibold">
              Certification 2025
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-amber-950">
              {totalCert2025.toLocaleString()}
            </span>
            <span className="text-xs text-amber-800">total poin uji</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Peserta Sertifikasi:</span>
            <span className="font-mono tabular-nums font-semibold text-slate-900">
              {mechanics.filter((m) => (m.certification2025 || 0) > 0).length} mekanik
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Default Sheet 2026 KPI metrics
  const promosiCount = mechanics.filter((m) => m.promosi2026 === 'Promosi').length;
  const totalPoints = mechanics.reduce((acc, m) => acc + m.currentPoint, 0);
  const avgPoints = totalCount > 0 ? Math.round(totalPoints / totalCount) : 0;
  const totalCert2026 = mechanics.reduce((acc, m) => acc + m.certification2026, 0);
  const totalCert2025 = mechanics.reduce((acc, m) => acc + m.certification2025, 0);
  const totalAcceleration = mechanics.reduce((acc, m) => acc + m.totalAccelerationPoint, 0);
  const totalEarnedPoints = totalAcceleration + totalCert2025 + totalCert2026;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Total Mechanics */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Mechanic (2026)
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
            {totalCount.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500">
            orang {selectedSite !== 'ALL' ? `(${selectedSite})` : 'semua site'}
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>
            Active: <strong className="font-mono tabular-nums text-slate-900">{activeCount}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            In Active: <strong className="font-mono tabular-nums text-slate-500">{totalCount - activeCount}</strong>
          </span>
        </div>
      </div>

      {/* KPI 2: Current Point & Average */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Rata-rata & Total Poin
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
            {avgPoints}
          </span>
          <span className="text-xs text-slate-500">poin / mechanic</span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>Akumulasi:</span>
          <span className="font-mono tabular-nums font-semibold text-slate-900">
            {totalPoints.toLocaleString()} pts
          </span>
        </div>
      </div>

      {/* KPI 3: Promosi 2026 Candidates */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Kandidat Promosi 2026
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
            {promosiCount}
          </span>
          <span className="text-xs text-slate-500">
            mechanic ({totalCount > 0 ? ((promosiCount / totalCount) * 100).toFixed(1) : 0}%)
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>Status:</span>
          <span className="text-amber-700 font-medium">Memenuhi Syarat Grade Baru</span>
        </div>
      </div>

      {/* KPI 4: Acceleration & Certification Pool */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Akselerasi & Sertifikasi
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
            {totalEarnedPoints.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500">total poin didapat</span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>
            Cert 2026: <strong className="font-mono tabular-nums text-slate-900">{totalCert2026.toLocaleString()}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Cert 2025: <strong className="font-mono tabular-nums text-slate-900">{totalCert2025.toLocaleString()}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
