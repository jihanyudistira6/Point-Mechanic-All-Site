import React, { useState } from 'react';
import { Mechanic, calculateGrade, getNextGradeInfo } from '../types/mechanic';
import { X, UserPlus, Check } from 'lucide-react';

interface AddMechanicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newMech: Mechanic) => void;
  allSites: string[];
  nextNo: number;
}

export const AddMechanicModal: React.FC<AddMechanicModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  allSites,
  nextNo,
}) => {
  if (!isOpen) return null;

  const [nik, setNik] = useState('');
  const [nama, setNama] = useState('');
  const [site, setSite] = useState(allSites[0] || 'GAM-SKL');
  const [doh, setDoh] = useState('2024-01-15');
  const [startGrade, setStartGrade] = useState('G1');
  const [startPoint, setStartPoint] = useState(0);
  const [cert2026, setCert2026] = useState(0);
  const [rank1Bmc, setRank1Bmc] = useState(0);
  const [bmh, setBmh] = useState(0);
  const [qccSs, setQccSs] = useState(0);
  const [cert2025, setCert2025] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !nik.trim()) return;

    const currentPoint = startPoint + cert2026;
    const upgrade2026 = calculateGrade(currentPoint);
    const startGradeNum = parseInt(startGrade.replace('G', ''), 10) || 1;
    const upGradeNum = parseInt(upgrade2026.replace('G', ''), 10) || 1;
    const isPromoted = upGradeNum > startGradeNum;
    const nextInfo = getNextGradeInfo(currentPoint);

    const newMechanic: Mechanic = {
      no: nextNo,
      nik: nik.trim(),
      nama: nama.trim(),
      site,
      doh,
      tenureYears: 2.0,
      startGrade,
      startPoint,
      status: 'Active',
      masaKerjaPoint: 10,
      rank1BmcPoint: rank1Bmc,
      bmhPoint: bmh,
      qccSsPoint: qccSs,
      certification2025: cert2025,
      certification2026: cert2026,
      totalAccelerationPoint: 10 + rank1Bmc + bmh + qccSs,
      currentPoint,
      upgrade2026,
      promosi2026: isPromoted ? 'Promosi' : '-',
      nextGradeTarget: nextInfo.nextGrade,
      pointsToNextGrade: nextInfo.pointsNeeded,
      gradeProgressPercent: nextInfo.percent,
    };

    onAdd(newMechanic);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900">Tambah Data Mechanic Baru</span>
              <p className="text-xs text-slate-500">Input mekanik baru ke dalam database point</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">NIK (Nomor Induk):</label>
              <input
                type="text"
                required
                placeholder="Contoh: 25060868"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-mono text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Site Lokasi:</label>
              <select
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              >
                {allSites.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap:</label>
            <input
              type="text"
              required
              placeholder="Nama mekanik..."
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">DOH (Hire Date):</label>
              <input
                type="date"
                value={doh}
                onChange={(e) => setDoh(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 font-mono text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Start Grade:</label>
              <select
                value={startGrade}
                onChange={(e) => setStartGrade(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 font-bold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              >
                <option value="G1">G1</option>
                <option value="G2">G2</option>
                <option value="G3">G3</option>
                <option value="G4">G4</option>
                <option value="G5">G5</option>
                <option value="G6">G6</option>
                <option value="G7">G7</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Start Point:</label>
              <input
                type="number"
                value={startPoint}
                onChange={(e) => setStartPoint(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 font-mono text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <span className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
              Poin Akselerasi & Sertifikasi Awal:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-slate-600 mb-0.5">Cert 2026:</label>
                <input
                  type="number"
                  placeholder="0"
                  value={cert2026}
                  onChange={(e) => setCert2026(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-blue-50/50 border border-blue-200 rounded px-2 py-1 font-mono text-blue-900"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-0.5">Rank 1 BMC:</label>
                <input
                  type="number"
                  placeholder="0"
                  value={rank1Bmc}
                  onChange={(e) => setRank1Bmc(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-orange-50/50 border border-orange-200 rounded px-2 py-1 font-mono text-orange-900"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-0.5">BMH:</label>
                <input
                  type="number"
                  placeholder="0"
                  value={bmh}
                  onChange={(e) => setBmh(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-cyan-50/50 border border-cyan-200 rounded px-2 py-1 font-mono text-cyan-900"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-0.5">QCC / SS:</label>
                <input
                  type="number"
                  placeholder="0"
                  value={qccSs}
                  onChange={(e) => setQccSs(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-purple-50/50 border border-purple-200 rounded px-2 py-1 font-mono text-purple-900"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-0.5">Cert 2025:</label>
                <input
                  type="number"
                  placeholder="0"
                  value={cert2025}
                  onChange={(e) => setCert2025(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-amber-50/50 border border-amber-200 rounded px-2 py-1 font-mono text-amber-900"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-slate-600 hover:text-slate-800 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Mekanik</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
