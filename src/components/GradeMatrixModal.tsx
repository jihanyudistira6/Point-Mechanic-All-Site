import React from 'react';
import { GRADE_THRESHOLDS } from '../types/mechanic';
import { X, BookOpen, ShieldCheck, Award } from 'lucide-react';

interface GradeMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GRADE_DETAILS = [
  {
    grade: 'G1',
    range: '0 ~ 120',
    role: 'Junior Mechanic / Helper',
    keterangan: 'Mekanik pemula, fokus pada preventive maintenance dasar, pelumasan, dan inspeksi visual.',
  },
  {
    grade: 'G2',
    range: '121 ~ 260',
    role: 'Mechanic II / Periodic Service',
    keterangan: 'Mampu melakukan periodic service berkala (250, 500, 1000 jam) serta penggantian komponen standar.',
  },
  {
    grade: 'G3',
    range: '261 ~ 430',
    role: 'Mechanic I / Troubleshooting Basic',
    keterangan: 'Mampu membaca shop manual, skema hidrolik/elektrikal dasar, dan diagnosa trouble ringan di lapangan.',
  },
  {
    grade: 'G4',
    range: '431 ~ 630',
    role: 'Senior Mechanic / Specialist',
    keterangan: 'Mampu troubleshooting tingkat lanjut sistem powertrain, hydraulic controller, serta major component overhaul.',
  },
  {
    grade: 'G5',
    range: '631 ~ 870',
    role: 'Master Mechanic / Lead Hand',
    keterangan: 'Koordinator shift lapangan, penanggung jawab kualitas pekerjaan unit kritis, dan mentor mekanik junior.',
  },
  {
    grade: 'G6',
    range: '871 ~ 1150',
    role: 'Technical Specialist / Foreman',
    keterangan: 'Pakar teknis site, analisis kegagalan komponen (failure analysis), sertifikasi instruktur, dan optimasi MTBF/MTTR.',
  },
  {
    grade: 'G7',
    range: '1151 ~ Up',
    role: 'Expert Principal / Technical Advisor',
    keterangan: 'Tingkat tertinggi keahlian teknis armada alat berat multi-brand di seluruh site operasional.',
  },
];

export const GradeMatrixModal: React.FC<GradeMatrixModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900">
                Standar Matriks Grade & Range Poin Mekanik
              </span>
              <p className="text-xs text-slate-500">
                Pedoman jenjang karir teknis alat berat & kriteria promosi grade 2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="overflow-hidden border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 whitespace-nowrap">Grade</th>
                  <th className="py-2.5 px-3 whitespace-nowrap font-mono">Range Poin</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Tingkat Jabatan</th>
                  <th className="py-2.5 px-3">Kompetensi & Tanggung Jawab</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {GRADE_DETAILS.map((item) => {
                  const conf = GRADE_THRESHOLDS.find((g) => g.grade === item.grade);
                  return (
                    <tr key={item.grade} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3 font-bold font-mono text-slate-900 whitespace-nowrap">
                        <span
                          className="inline-block px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: conf?.color || '#0F172A' }}
                        >
                          {item.grade}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-800 whitespace-nowrap tabular-nums">
                        {item.range}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-900 whitespace-nowrap">
                        {item.role}
                      </td>
                      <td className="py-3 px-3 text-slate-600 leading-relaxed">
                        {item.keterangan}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Acceleration Rule Notes */}
          <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Ketentuan Akselerasi & Promosi Poin 2026:</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-slate-700 leading-relaxed">
              <li>
                <strong>Poin Sertifikasi (Certification 2026):</strong> Diperoleh melalui ujian teori & praktek kompetensi teknis periode tahun berjalan.
              </li>
              <li>
                <strong>Rank 1 BMC (Basic Mechanic Course):</strong> Bonus akselerasi 25 hingga 50 poin bagi peserta dengan nilai kelulusan tertinggi di batch-nya.
              </li>
              <li>
                <strong>BMH (Basic Maintenance Heavy/Hydraulic):</strong> Poin kelulusan pelatihan hidrolik & alat berat tingkat lanjut (20–40 poin).
              </li>
              <li>
                <strong>QCC / SS:</strong> Sumbangan inovasi efisiensi perbaikan atau pencegahan breakdown yang disetujui komite inovasi.
              </li>
              <li>
                <strong>Promosi Grade:</strong> Mekanik dinyatakan <em>Promosi</em> jika akumulasi <code>Current Point</code> melewati batas minimum grade berikutnya.
              </li>
            </ul>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
