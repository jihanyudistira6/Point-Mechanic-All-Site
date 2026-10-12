import React, { useState } from 'react';
import { Mechanic, calculateGrade, getNextGradeInfo, GRADE_THRESHOLDS } from '../types/mechanic';
import { X, Award, CheckCircle, Save, RotateCcw, AlertCircle } from 'lucide-react';

interface MechanicDetailModalProps {
  mechanic: Mechanic | null;
  onClose: () => void;
  onSave: (updated: Mechanic) => void;
}

export const MechanicDetailModal: React.FC<MechanicDetailModalProps> = ({
  mechanic,
  onClose,
  onSave,
}) => {
  if (!mechanic) return null;

  // Editable fields
  const [startPoint, setStartPoint] = useState(mechanic.startPoint);
  const [rank1BmcPoint, setRank1BmcPoint] = useState(mechanic.rank1BmcPoint);
  const [bmhPoint, setBmhPoint] = useState(mechanic.bmhPoint);
  const [masaKerjaPoint, setMasaKerjaPoint] = useState(mechanic.masaKerjaPoint);
  const [qccSsPoint, setQccSsPoint] = useState(mechanic.qccSsPoint);
  const [certification2025, setCertification2025] = useState(mechanic.certification2025);
  const [certification2026, setCertification2026] = useState(mechanic.certification2026);
  const [status, setStatus] = useState(mechanic.status);

  // Live calculation: In the business model, Current Point is startPoint + certification2026 (or full acceleration)
  // Let's compute simulated current point
  const simulatedCurrentPoint = startPoint + certification2026;
  const simulatedGrade = calculateGrade(simulatedCurrentPoint);
  const startGradeNum = parseInt(mechanic.startGrade.replace('G', ''), 10) || 1;
  const simGradeNum = parseInt(simulatedGrade.replace('G', ''), 10) || 1;
  const isPromoted = simGradeNum > startGradeNum;
  const nextInfo = getNextGradeInfo(simulatedCurrentPoint);

  const handleSave = () => {
    const updated: Mechanic = {
      ...mechanic,
      startPoint,
      rank1BmcPoint,
      bmhPoint,
      masaKerjaPoint,
      qccSsPoint,
      certification2025,
      certification2026,
      currentPoint: simulatedCurrentPoint,
      upgrade2026: simulatedGrade,
      promosi2026: isPromoted ? 'Promosi' : '-',
      nextGradeTarget: nextInfo.nextGrade,
      pointsToNextGrade: nextInfo.pointsNeeded,
      gradeProgressPercent: nextInfo.percent,
      totalAccelerationPoint: rank1BmcPoint + bmhPoint + masaKerjaPoint + qccSsPoint,
      status,
    };
    onSave(updated);
    onClose();
  };

  const handleReset = () => {
    setStartPoint(mechanic.startPoint);
    setRank1BmcPoint(mechanic.rank1BmcPoint);
    setBmhPoint(mechanic.bmhPoint);
    setMasaKerjaPoint(mechanic.masaKerjaPoint);
    setQccSsPoint(mechanic.qccSsPoint);
    setCertification2025(mechanic.certification2025);
    setCertification2026(mechanic.certification2026);
    setStatus(mechanic.status);
  };

  const currentGradeConfig = GRADE_THRESHOLDS.find((g) => g.grade === simulatedGrade);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                {mechanic.nama}
              </span>
              <span className="text-xs font-mono bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-medium">
                NIK: {mechanic.nik}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>Site: <strong className="text-slate-800">{mechanic.site}</strong></span>
              <span aria-hidden="true">·</span>
              <span>DOH: <strong className="text-slate-800 font-mono">{mechanic.doh || '-'}</strong> ({mechanic.tenureYears} thn)</span>
              <span aria-hidden="true">·</span>
              <span>Status: <strong className={status === 'Active' ? 'text-emerald-700' : 'text-rose-700'}>{status}</strong></span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Career & Grade Progress Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-300 font-medium">Start Grade</span>
                <div className="text-xl font-bold font-mono">{mechanic.startGrade}</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Base: {startPoint} pts
                </div>
              </div>

              <div className="text-center px-4">
                <span className="text-xs text-amber-300 font-medium uppercase tracking-wider">
                  Hasil Evaluasi 2026
                </span>
                <div className="text-3xl font-extrabold font-mono text-amber-400">
                  {simulatedGrade}
                </div>
                <div className="text-xs font-mono font-semibold text-white">
                  {simulatedCurrentPoint} pts total
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-300 font-medium">Status Promosi</span>
                <div className="mt-1">
                  {isPromoted ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-400 text-slate-950 font-bold text-xs">
                      <Award className="w-3.5 h-3.5" />
                      PROMOSI GRADE
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-300">Tetap ({simulatedGrade})</span>
                  )}
                </div>
              </div>
            </div>

            {/* Next Grade Progress Bar */}
            <div className="mt-4 pt-3 border-t border-slate-700/60">
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>
                  Target Menuju <strong>{nextInfo.nextGrade}</strong>:
                </span>
                <span className="font-mono tabular-nums">
                  {nextInfo.pointsNeeded > 0
                    ? `Kurang ${nextInfo.pointsNeeded} poin lagi`
                    : 'Poin Maksimal Tercapai'}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${nextInfo.percent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Point Breakdown & Simulator Form */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-900">
                Simulator & Rincian Komponen Poin
              </span>
              <span className="text-xs text-slate-500">
                Ubah nilai untuk melihat simulasi promosi
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Start Point */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <label className="block text-slate-700 font-medium mb-1">
                  Start Point (Historis):
                </label>
                <input
                  type="number"
                  value={startPoint}
                  onChange={(e) => setStartPoint(parseInt(e.target.value, 10) || 0)}
                  className="w-full font-mono text-sm font-semibold bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Poin dasar dari penilaian tahun sebelumnya
                </span>
              </div>

              {/* Certification 2026 */}
              <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-200">
                <label className="block text-blue-900 font-medium mb-1 flex items-center justify-between">
                  <span>Certification 2026:</span>
                  <span className="text-[10px] text-blue-600 font-normal">Aktual Ujian 2026</span>
                </label>
                <input
                  type="number"
                  value={certification2026}
                  onChange={(e) => setCertification2026(parseInt(e.target.value, 10) || 0)}
                  className="w-full font-mono text-sm font-semibold bg-white border border-blue-300 rounded px-2.5 py-1.5 text-blue-950 focus:outline-hidden focus:ring-1 focus:ring-blue-400"
                />
                <span className="text-[10px] text-blue-700 mt-0.5 block">
                  Poin kelulusan sertifikasi periode berjalan 2026
                </span>
              </div>

              {/* Rank 1 BMC */}
              <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-200">
                <label className="block text-orange-950 font-medium mb-1">
                  Rank 1 BMC (Basic Mechanic Course):
                </label>
                <input
                  type="number"
                  value={rank1BmcPoint}
                  onChange={(e) => setRank1BmcPoint(parseInt(e.target.value, 10) || 0)}
                  className="w-full font-mono text-sm font-semibold bg-white border border-orange-300 rounded px-2.5 py-1.5 text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-orange-400"
                />
                <span className="text-[10px] text-orange-800 mt-0.5 block">
                  Poin bonus bagi juara 1 kursus BMC (25–50 pts)
                </span>
              </div>

              {/* BMH */}
              <div className="bg-cyan-50/50 p-3 rounded-lg border border-cyan-200">
                <label className="block text-cyan-950 font-medium mb-1">
                  BMH (Basic Maintenance Heavy/Hyd):
                </label>
                <input
                  type="number"
                  value={bmhPoint}
                  onChange={(e) => setBmhPoint(parseInt(e.target.value, 10) || 0)}
                  className="w-full font-mono text-sm font-semibold bg-white border border-cyan-300 rounded px-2.5 py-1.5 text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-cyan-400"
                />
                <span className="text-[10px] text-cyan-800 mt-0.5 block">
                  Poin kualifikasi kursus hydraulic/alat berat (20–40 pts)
                </span>
              </div>

              {/* Masa Kerja Pts */}
              <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200">
                <label className="block text-emerald-950 font-medium mb-1">
                  Masa Kerja Poin:
                </label>
                <input
                  type="number"
                  value={masaKerjaPoint}
                  onChange={(e) => setMasaKerjaPoint(parseInt(e.target.value, 10) || 0)}
                  className="w-full font-mono text-sm font-semibold bg-white border border-emerald-300 rounded px-2.5 py-1.5 text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-400"
                />
                <span className="text-[10px] text-emerald-800 mt-0.5 block">
                  Akumulasi poin masa kerja pengabdian
                </span>
              </div>

              {/* QCC / SS */}
              <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-200">
                <label className="block text-purple-950 font-medium mb-1">
                  QCC / SS (Inovasi & Sumbang Saran):
                </label>
                <input
                  type="number"
                  value={qccSsPoint}
                  onChange={(e) => setQccSsPoint(parseInt(e.target.value, 10) || 0)}
                  className="w-full font-mono text-sm font-semibold bg-white border border-purple-300 rounded px-2.5 py-1.5 text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-purple-400"
                />
                <span className="text-[10px] text-purple-800 mt-0.5 block">
                  Poin paper inovasi gugus kendali mutu (15–35 pts)
                </span>
              </div>

              {/* Certification 2025 */}
              <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-200 sm:col-span-2">
                <label className="block text-amber-950 font-medium mb-1 flex items-center justify-between">
                  <span>Certification 2025 (Tahun Lalu):</span>
                  <span className="text-[10px] text-amber-700">Hasil Uji Sertifikasi 2025</span>
                </label>
                <input
                  type="number"
                  value={certification2025}
                  onChange={(e) => setCertification2025(parseInt(e.target.value, 10) || 0)}
                  className="w-full font-mono text-sm font-semibold bg-white border border-amber-300 rounded px-2.5 py-1.5 text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-amber-400"
                />
                <span className="text-[10px] text-amber-800 mt-0.5 block">
                  Poin sertifikasi tahun 2025 sebagai rekam jejak capaian historis
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Nilai Awal</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
