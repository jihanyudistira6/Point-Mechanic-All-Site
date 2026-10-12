import React, { useState, useMemo } from 'react';
import { Mechanic } from '../types/mechanic';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Award,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

interface MechanicTableProps {
  mechanics: Mechanic[];
  allSites: string[];
  selectedSite: string;
  onSelectSite: (site: string) => void;
  onViewMechanic: (mechanic: Mechanic) => void;
}

export const MechanicTable: React.FC<MechanicTableProps> = ({
  mechanics,
  allSites,
  selectedSite,
  onSelectSite,
  onViewMechanic,
}) => {
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [promotionOnly, setPromotionOnly] = useState(false);

  // Column View Mode: 'standard' vs 'detailed-breakdown'
  const [viewMode, setViewMode] = useState<'standard' | 'detailed'>('standard');

  // Sorting
  const [sortField, setSortField] = useState<keyof Mechanic>('currentPoint');
  const [sortAsc, setSortAsc] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Filtered mechanics
  const filteredList = useMemo(() => {
    return mechanics.filter((m) => {
      // Site filter
      if (selectedSite !== 'ALL' && m.site !== selectedSite) return false;

      // Grade filter
      if (selectedGrade !== 'ALL') {
        const gradeMatches = m.upgrade2026 === selectedGrade || m.startGrade === selectedGrade;
        if (!gradeMatches) return false;
      }

      // Status filter
      if (selectedStatus !== 'ALL' && m.status !== selectedStatus) return false;

      // Promosi only
      if (promotionOnly && m.promosi2026 !== 'Promosi') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNama = m.nama.toLowerCase().includes(q);
        const matchNik = m.nik.toLowerCase().includes(q);
        const matchSite = m.site.toLowerCase().includes(q);
        if (!matchNama && !matchNik && !matchSite) return false;
      }

      return true;
    });
  }, [mechanics, selectedSite, selectedGrade, selectedStatus, promotionOnly, searchQuery]);

  // Sorted list
  const sortedList = useMemo(() => {
    return [...filteredList].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comp = aVal.localeCompare(bVal);
        return sortAsc ? comp : -comp;
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [filteredList, sortField, sortAsc]);

  // Paginated list
  const totalPages = pageSize === -1 ? 1 : Math.ceil(sortedList.length / pageSize);
  const currentPage = Math.min(page, Math.max(1, totalPages));

  const displayList = useMemo(() => {
    if (pageSize === -1) return sortedList;
    const start = (currentPage - 1) * pageSize;
    return sortedList.slice(start, start + pageSize);
  }, [sortedList, currentPage, pageSize]);

  const handleSort = (field: keyof Mechanic) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // Default descending for points
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGrade('ALL');
    setSelectedStatus('ALL');
    setPromotionOnly(false);
    onSelectSite('ALL');
    setPage(1);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Table Toolbar & Filters */}
      <div className="p-4 sm:p-5 border-b border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900 tracking-tight">
                Database Point Mechanic Seluruh Site
              </span>
              <span className="text-xs text-slate-500 font-mono">
                ({filteredList.length} dari {mechanics.length} total)
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-600">
              Daftar lengkap perolehan poin mekanik, akselerasi kompetensi, status sertifikasi, dan kelayakan promosi grade 2026.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-medium self-start md:self-auto">
            <button
              onClick={() => setViewMode('standard')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                viewMode === 'standard'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tampilan Standar
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1 ${
                viewMode === 'detailed'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Rincian Lengkap Poin Akselerasi</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
          {/* 1. Site Selector Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              <span>Filter Berdasarkan Site:</span>
            </label>
            <select
              value={selectedSite}
              onChange={(e) => {
                onSelectSite(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
            >
              <option value="ALL">Semua Site ({mechanics.length} mekanik)</option>
              {allSites.map((s) => (
                <option key={s} value={s}>
                  {s} ({mechanics.filter((m) => m.site === s).length} orang)
                </option>
              ))}
            </select>
          </div>

          {/* 2. Search NIK / Nama */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1 flex items-center gap-1">
              <Search className="w-3 h-3 text-slate-400" />
              <span>Cari NIK / Nama:</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ketik NIK atau nama..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-2 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* 3. Grade Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Filter Grade:
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
            >
              <option value="ALL">Semua Grade (G1–G7)</option>
              <option value="G1">G1 (0 ~ 120)</option>
              <option value="G2">G2 (121 ~ 260)</option>
              <option value="G3">G3 (261 ~ 430)</option>
              <option value="G4">G4 (431 ~ 630)</option>
              <option value="G5">G5 (631 ~ 870)</option>
              <option value="G6">G6 (871 ~ 1150)</option>
              <option value="G7">G7 (1151+)</option>
            </select>
          </div>

          {/* 4. Status Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Status Kepegawaian:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
            >
              <option value="ALL">Semua Status</option>
              <option value="Active">Active</option>
              <option value="In Active">In Active</option>
            </select>
          </div>

          {/* 5. Promotion Candidates toggle & Reset */}
          <div className="flex items-end gap-2">
            <button
              onClick={() => {
                setPromotionOnly(!promotionOnly);
                setPage(1);
              }}
              className={`flex-1 text-xs py-2 px-2.5 rounded-lg border font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                promotionOnly
                  ? 'bg-amber-100/80 border-amber-300 text-amber-900 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Hanya Promosi '26</span>
            </button>

            {(selectedSite !== 'ALL' ||
              selectedGrade !== 'ALL' ||
              selectedStatus !== 'ALL' ||
              promotionOnly ||
              searchQuery) && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-slate-500 hover:text-slate-800 underline whitespace-nowrap py-2 px-1"
                title="Reset seluruh filter"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 select-none">
            <tr>
              <th
                onClick={() => handleSort('no')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 whitespace-nowrap w-12 text-center"
              >
                No
              </th>
              <th
                onClick={() => handleSort('nik')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>NIK</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('nama')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 whitespace-nowrap min-w-[170px]"
              >
                <div className="flex items-center gap-1">
                  <span>Nama Lengkap</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('site')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Site</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('doh')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>DOH (Hire)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('startGrade')}
                className="py-3 px-2 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-center"
              >
                Start Grade
              </th>
              <th
                onClick={() => handleSort('startPoint')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Start Point</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Detailed Breakdown Columns */}
              {viewMode === 'detailed' && (
                <>
                  <th
                    onClick={() => handleSort('rank1BmcPoint')}
                    className="py-3 px-2 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-right text-orange-700 bg-orange-50/40"
                  >
                    Rank 1 BMC
                  </th>
                  <th
                    onClick={() => handleSort('bmhPoint')}
                    className="py-3 px-2 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-right text-cyan-700 bg-cyan-50/40"
                  >
                    BMH
                  </th>
                  <th
                    onClick={() => handleSort('masaKerjaPoint')}
                    className="py-3 px-2 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-right text-emerald-700 bg-emerald-50/40"
                  >
                    Masa Kerja Pts
                  </th>
                  <th
                    onClick={() => handleSort('qccSsPoint')}
                    className="py-3 px-2 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-right text-purple-700 bg-purple-50/40"
                  >
                    QCC / SS
                  </th>
                  <th
                    onClick={() => handleSort('certification2025')}
                    className="py-3 px-2 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-right text-amber-700 bg-amber-50/40"
                  >
                    Cert 2025
                  </th>
                </>
              )}

              {/* Certification 2026 (exact from raw CSV col 12) */}
              <th
                onClick={() => handleSort('certification2026')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-right text-blue-700 bg-blue-50/50"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Cert 2026</span>
                  <ArrowUpDown className="w-3 h-3 text-blue-400" />
                </div>
              </th>

              {/* Current Point (Main focus requested by user) */}
              <th
                onClick={() => handleSort('currentPoint')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-right font-bold text-slate-900 bg-slate-100/60"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Current Point</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              <th
                onClick={() => handleSort('upgrade2026')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-center"
              >
                Grade 2026
              </th>
              <th
                onClick={() => handleSort('promosi2026')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-center"
              >
                Promosi 2026
              </th>
              <th className="py-3 px-3 text-center whitespace-nowrap">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            {displayList.length === 0 ? (
              <tr>
                <td
                  colSpan={viewMode === 'detailed' ? 16 : 11}
                  className="py-12 text-center text-slate-500 font-sans"
                >
                  <p className="text-sm font-medium text-slate-700">
                    Tidak ada mekanik yang cocok dengan kriteria filter.
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Coba ubah kata kunci pencarian atau reset filter site/grade.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-3 px-3 py-1.5 text-xs text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 font-medium"
                  >
                    Reset Filter
                  </button>
                </td>
              </tr>
            ) : (
              displayList.map((m) => {
                const isPromoted = m.promosi2026 === 'Promosi';
                return (
                  <tr
                    key={m.nik || m.no}
                    onClick={() => onViewMechanic(m)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 px-3 text-center text-slate-400 tabular-nums font-mono">
                      {m.no}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700 tabular-nums">
                      {m.nik}
                    </td>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-900 truncate max-w-[200px]">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate">{m.nama}</span>
                        {m.status === 'In Active' && (
                          <span className="text-[9px] font-sans text-rose-600 bg-rose-50 px-1 py-0.2 rounded border border-rose-200">
                            Inactive
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-700 whitespace-nowrap">
                      {m.site}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      {m.doh || '-'}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-slate-700">
                      {m.startGrade}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">
                      {m.startPoint}
                    </td>

                    {/* Detailed Columns */}
                    {viewMode === 'detailed' && (
                      <>
                        <td className="py-2.5 px-2 text-right tabular-nums text-orange-700 bg-orange-50/20">
                          {m.rank1BmcPoint > 0 ? `+${m.rank1BmcPoint}` : '-'}
                        </td>
                        <td className="py-2.5 px-2 text-right tabular-nums text-cyan-700 bg-cyan-50/20">
                          {m.bmhPoint > 0 ? `+${m.bmhPoint}` : '-'}
                        </td>
                        <td className="py-2.5 px-2 text-right tabular-nums text-emerald-700 bg-emerald-50/20">
                          {m.masaKerjaPoint > 0 ? `+${m.masaKerjaPoint}` : '-'}
                        </td>
                        <td className="py-2.5 px-2 text-right tabular-nums text-purple-700 bg-purple-50/20">
                          {m.qccSsPoint > 0 ? `+${m.qccSsPoint}` : '-'}
                        </td>
                        <td className="py-2.5 px-2 text-right tabular-nums text-amber-700 bg-amber-50/20">
                          {m.certification2025 > 0 ? m.certification2025 : '-'}
                        </td>
                      </>
                    )}

                    {/* Cert 2026 */}
                    <td className="py-2.5 px-3 text-right tabular-nums text-blue-700 font-semibold bg-blue-50/30">
                      {m.certification2026 > 0 ? `+${m.certification2026}` : '-'}
                    </td>

                    {/* Current Point */}
                    <td className="py-2.5 px-4 text-right tabular-nums font-bold text-slate-900 bg-slate-50/50 text-xs">
                      {m.currentPoint}
                    </td>

                    {/* Upgrade 2026 */}
                    <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {m.upgrade2026}
                      </span>
                    </td>

                    {/* Promosi 2026 */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap font-sans">
                      {isPromoted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-semibold text-[10px] bg-amber-100 text-amber-800 border border-amber-200">
                          <Award className="w-3 h-3 text-amber-600" />
                          <span>Promosi</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono">-</span>
                      )}
                    </td>

                    {/* Action Eye */}
                    <td className="py-2.5 px-3 text-center font-sans">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewMechanic(m);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                        title="Lihat Rincian & Simulator Point"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Footer summary */}
      <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <span>
            Menampilkan{' '}
            <strong className="font-mono text-slate-900">
              {displayList.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </strong>{' '}
            sampai{' '}
            <strong className="font-mono text-slate-900">
              {pageSize === -1
                ? sortedList.length
                : Math.min(currentPage * pageSize, sortedList.length)}
            </strong>{' '}
            dari <strong className="font-mono text-slate-900">{sortedList.length}</strong> mekanik
          </span>

          <div className="hidden sm:flex items-center gap-1.5 ml-4 text-slate-500">
            <span>Baris:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
                setPage(1);
              }}
              className="text-xs bg-white border border-slate-200 rounded px-2 py-1 font-mono text-slate-800"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={-1}>Semua ({sortedList.length})</option>
            </select>
          </div>
        </div>

        {pageSize !== -1 && totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 text-slate-700"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>
            <span className="px-3 py-1 font-mono text-slate-700 tabular-nums">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 text-slate-700"
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
