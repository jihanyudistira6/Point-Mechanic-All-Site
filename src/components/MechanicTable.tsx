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
  FileSpreadsheet,
  Download,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface MechanicTableProps {
  mechanics: Mechanic[];
  allSites: string[];
  selectedSite: string;
  onSelectSite: (site: string) => void;
  onViewMechanic: (mechanic: Mechanic) => void;
  activeSheet: '2026' | '2024-2025';
  onSheetChange: (sheet: '2026' | '2024-2025') => void;
}

export const MechanicTable: React.FC<MechanicTableProps> = ({
  mechanics,
  allSites,
  selectedSite,
  onSelectSite,
  onViewMechanic,
  activeSheet,
  onSheetChange,
}) => {
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [promotionOnly, setPromotionOnly] = useState(false);
  const [selectedCertFilter, setSelectedCertFilter] = useState('ALL');

  // Column View Mode: 'standard' vs 'detailed-breakdown'
  const [viewMode, setViewMode] = useState<'standard' | 'detailed'>('standard');

  // Sorting
  const [sortField, setSortField] = useState<keyof Mechanic>(
    activeSheet === '2024-2025' ? 'currentPoint2025' : 'currentPoint'
  );
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
        const gradeMatches =
          activeSheet === '2024-2025'
            ? m.grade2025 === selectedGrade || m.startGrade === selectedGrade
            : m.upgrade2026 === selectedGrade || m.startGrade === selectedGrade;
        if (!gradeMatches) return false;
      }

      // Status filter
      if (selectedStatus !== 'ALL' && m.status !== selectedStatus) return false;

      // Promosi only
      if (promotionOnly) {
        const isPromo =
          activeSheet === '2024-2025'
            ? m.promosi2025 === 'Promosi'
            : m.promosi2026 === 'Promosi';
        if (!isPromo) return false;
      }

      // Certification Points Filter (Specifically for Cert 2024 & Cert 2025)
      if (selectedCertFilter === 'HAS_2024' && (m.certification2024 || 0) <= 0) return false;
      if (selectedCertFilter === 'HAS_2025' && (m.certification2025 || 0) <= 0) return false;
      if (selectedCertFilter === 'HAS_BOTH' && ((m.certification2024 || 0) <= 0 || (m.certification2025 || 0) <= 0)) return false;
      if (selectedCertFilter === 'HIGH_CERT' && (m.totalCert2024_2025 || 0) < 100) return false;
      if (selectedCertFilter === 'TOP_CERT' && (m.totalCert2024_2025 || 0) < 150) return false;

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
  }, [
    mechanics,
    selectedSite,
    selectedGrade,
    selectedStatus,
    promotionOnly,
    selectedCertFilter,
    searchQuery,
    activeSheet,
  ]);

  // Aggregate stats for Sheet 2024-2025
  const certStats2024_2025 = useMemo(() => {
    const list = filteredList;
    const total2024 = list.reduce((acc, m) => acc + (m.certification2024 || 0), 0);
    const count2024 = list.filter((m) => (m.certification2024 || 0) > 0).length;
    const avg2024 = count2024 > 0 ? Math.round(total2024 / count2024) : 0;

    const total2025 = list.reduce((acc, m) => acc + (m.certification2025 || 0), 0);
    const count2025 = list.filter((m) => (m.certification2025 || 0) > 0).length;
    const avg2025 = count2025 > 0 ? Math.round(total2025 / count2025) : 0;

    const totalCombined = list.reduce((acc, m) => acc + (m.totalCert2024_2025 || 0), 0);
    const bothCount = list.filter(
      (m) => (m.certification2024 || 0) > 0 && (m.certification2025 || 0) > 0
    ).length;

    return { total2024, count2024, avg2024, total2025, count2025, avg2025, totalCombined, bothCount };
  }, [filteredList]);

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
    setSelectedCertFilter('ALL');
    onSelectSite('ALL');
    setPage(1);
  };

  // Export current sheet data to CSV
  const handleExportCurrentSheet = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (activeSheet === '2024-2025') {
      headers = [
        'No',
        'NIK',
        'Nama',
        'Site',
        'DOH',
        'Start Grade',
        'Certification 2024',
        'Certification 2025',
        'Total Cert (2024-2025)',
        'Masa Kerja Point',
        'Rank 1 BMC',
        'BMH Point',
        'QCC/SS Point',
        'Current Point 2024-2025',
        'Grade 2025',
        'Promosi 2025',
        'Status',
      ];
      rows = filteredList.map((m) => [
        m.no,
        `"${m.nik}"`,
        `"${m.nama}"`,
        `"${m.site}"`,
        m.doh,
        m.startGrade,
        m.certification2024,
        m.certification2025,
        m.totalCert2024_2025,
        m.masaKerjaPoint,
        m.rank1BmcPoint,
        m.bmhPoint,
        m.qccSsPoint,
        m.currentPoint2025,
        m.grade2025,
        m.promosi2025,
        m.status,
      ]);
    } else {
      headers = [
        'No',
        'NIK',
        'Nama',
        'Site',
        'DOH',
        'Start Grade',
        'Start Point',
        'Status',
        'Masa Kerja Point',
        'Rank 1 BMC Point',
        'BMH Point',
        'QCC/SS Point',
        'Certification 2025',
        'Certification 2026',
        'Current Point',
        'Upgrade 2026',
        'Promosi 2026',
      ];
      rows = filteredList.map((m) => [
        m.no,
        `"${m.nik}"`,
        `"${m.nama}"`,
        `"${m.site}"`,
        m.doh,
        m.startGrade,
        m.startPoint,
        m.status,
        m.masaKerjaPoint,
        m.rank1BmcPoint,
        m.bmhPoint,
        m.qccSsPoint,
        m.certification2025,
        m.certification2026,
        m.currentPoint,
        m.upgrade2026,
        m.promosi2026,
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `mechanic_points_sheet_${activeSheet}_${selectedSite}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* 1. Sheet Switcher Tab Bar (Like Excel / Google Sheets tabs) */}
      <div className="bg-slate-100/80 px-4 pt-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {/* Tab Sheet 1: Current Point 2026 */}
          <button
            onClick={() => {
              onSheetChange('2026');
              setSortField('currentPoint');
              setPage(1);
            }}
            className={`px-4 py-2.5 rounded-t-lg text-xs font-semibold flex items-center gap-2 border-t border-x transition-all select-none whitespace-nowrap ${
              activeSheet === '2026'
                ? 'bg-white text-slate-900 border-slate-200 shadow-xs -mb-px'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Sheet: Current Point 2026</span>
            <span className="font-mono text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-bold">
              Periode Berjalan
            </span>
          </button>

          {/* Tab Sheet 2: Current Point 2024-2025 (Requested by user) */}
          <button
            onClick={() => {
              onSheetChange('2024-2025');
              setSortField('currentPoint2025');
              setPage(1);
            }}
            className={`px-4 py-2.5 rounded-t-lg text-xs font-semibold flex items-center gap-2 border-t border-x transition-all select-none whitespace-nowrap ${
              activeSheet === '2024-2025'
                ? 'bg-white text-slate-900 border-slate-200 shadow-xs -mb-px'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
            <span>Sheet: Current Point 2024-2025</span>
            <span className="font-mono text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
              Cert 2024 & 2025
            </span>
          </button>
        </div>

        {/* Export button for active sheet */}
        <div className="flex items-center gap-2 pb-2 sm:pb-0">
          <button
            onClick={handleExportCurrentSheet}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Unduh {activeSheet === '2024-2025' ? 'Sheet 2024-2025' : 'Sheet 2026'} (.CSV)</span>
          </button>
        </div>
      </div>

      {/* 2. Sheet Description & Mode Toggle */}
      <div className="p-4 sm:p-5 border-b border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900 tracking-tight">
                {activeSheet === '2024-2025'
                  ? 'Sheet: Current Point 2024–2025 (Rekam Jejak Sertifikasi 2024 & 2025)'
                  : 'Sheet: Current Point 2026 (Evaluasi Periode Berjalan)'}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                ({filteredList.length} dari {mechanics.length} mekanik)
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-600">
              {activeSheet === '2024-2025'
                ? 'Menampilkan perolehan point mekanik dari Certification 2024, Certification 2025, total sertifikasi kumulatif, serta poin penutupan periode 2024–2025.'
                : 'Menampilkan evaluasi terkini: Start Point, Certification 2026, Current Point 2026, dan target kelayakan Promosi 2026.'}
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
              <span>Rincian Penuh Poin Akselerasi</span>
            </button>
          </div>
        </div>

        {/* 3. Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {/* Site Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              <span>Filter Site:</span>
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

          {/* Search NIK / Nama */}
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

          {/* Grade Filter */}
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

          {/* NEW: Filter Poin Sertifikasi 2024 & 2025 */}
          <div>
            <label className="block text-[11px] font-medium text-amber-800 mb-1 flex items-center gap-1 font-semibold">
              <Award className="w-3 h-3 text-amber-600" />
              <span>Filter Poin Sertifikasi:</span>
            </label>
            <select
              value={selectedCertFilter}
              onChange={(e) => {
                setSelectedCertFilter(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs bg-amber-50/70 border border-amber-200 rounded-lg px-2.5 py-2 font-medium text-amber-950 focus:outline-hidden focus:ring-1 focus:ring-amber-400"
            >
              <option value="ALL">Semua Poin Sertifikasi</option>
              <option value="HAS_2024">Memiliki Cert 2024 (&gt;0 pts)</option>
              <option value="HAS_2025">Memiliki Cert 2025 (&gt;0 pts)</option>
              <option value="HAS_BOTH">Lengkap Cert 2024 &amp; 2025</option>
              <option value="HIGH_CERT">Total Cert &ge; 100 pts</option>
              <option value="TOP_CERT">Top Cert &ge; 150 pts</option>
            </select>
          </div>

          {/* Status Filter */}
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

          {/* Promotion toggle & Reset */}
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
              <span>
                {activeSheet === '2024-2025' ? 'Hanya Promosi \'25' : 'Hanya Promosi \'26'}
              </span>
            </button>

            {(selectedSite !== 'ALL' ||
              selectedGrade !== 'ALL' ||
              selectedStatus !== 'ALL' ||
              selectedCertFilter !== 'ALL' ||
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

        {/* 3b. Highlight Info Strip for Sheet 2024-2025: Certification 2024 & 2025 Points */}
        {activeSheet === '2024-2025' && (
          <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-blue-50 border border-amber-200 rounded-xl p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 flex flex-wrap items-center gap-2">
                  <span>Poin Mekanik: Certification 2024 &amp; Certification 2025</span>
                  <span className="font-mono text-[10px] bg-amber-200/90 text-amber-950 px-2 py-0.5 rounded-md font-bold">
                    Sheet: Current Point 2024-2025
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    ({filteredList.length} mekanik)
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Rincian perolehan nilai uji teknis resmi Certification 2024 dan Certification 2025 seluruh mekanik berdasarkan database sheet.
                </p>
              </div>
            </div>

            {/* Quick point metric summary */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
              {/* Cert 2024 Stat */}
              <div className="bg-white border border-orange-200 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <span className="font-sans font-semibold text-orange-950">Cert 2024:</span>
                <span className="font-bold text-orange-800 tabular-nums">{certStats2024_2025.total2024.toLocaleString()} pts</span>
                <span className="text-slate-400 font-sans text-[10px]">
                  ({certStats2024_2025.count2024} org · avg {certStats2024_2025.avg2024})
                </span>
              </div>

              {/* Cert 2025 Stat */}
              <div className="bg-white border border-amber-200 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="font-sans font-semibold text-amber-950">Cert 2025:</span>
                <span className="font-bold text-amber-800 tabular-nums">{certStats2024_2025.total2025.toLocaleString()} pts</span>
                <span className="text-slate-400 font-sans text-[10px]">
                  ({certStats2024_2025.count2025} org · avg {certStats2024_2025.avg2025})
                </span>
              </div>

              {/* Total Combined Cert */}
              <div className="bg-slate-900 text-white rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 shadow-2xs">
                <span className="font-sans text-slate-300 font-medium">Total Cert (24+25):</span>
                <span className="font-bold text-amber-400 tabular-nums">+{certStats2024_2025.totalCombined.toLocaleString()} pts</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Table Content based on Active Sheet */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 select-none">
            {activeSheet === '2024-2025' ? (
              /* THEAD FOR SHEET: CURRENT POINT 2024-2025 */
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
                    <span>DOH</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('startGrade')}
                  className="py-3 px-2 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-center"
                >
                  Start Grade
                </th>

                {/* HIGHLIGHTED POINT CERTIFICATION 2024 */}
                <th
                  onClick={() => handleSort('certification2024')}
                  className="py-3 px-3 cursor-pointer hover:bg-orange-100/90 whitespace-nowrap text-right font-bold text-orange-950 bg-orange-100/60 border-x border-orange-200"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <Award className="w-3.5 h-3.5 text-orange-600" />
                    <span>Point Certification 2024</span>
                    <ArrowUpDown className="w-3 h-3 text-orange-700" />
                  </div>
                </th>

                {/* HIGHLIGHTED POINT CERTIFICATION 2025 */}
                <th
                  onClick={() => handleSort('certification2025')}
                  className="py-3 px-3 cursor-pointer hover:bg-amber-100/90 whitespace-nowrap text-right font-bold text-amber-950 bg-amber-100/60 border-r border-amber-200"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Point Certification 2025</span>
                    <ArrowUpDown className="w-3 h-3 text-amber-700" />
                  </div>
                </th>

                {/* Total Cert (2024+2025) */}
                <th
                  onClick={() => handleSort('totalCert2024_2025')}
                  className="py-3 px-3 cursor-pointer hover:bg-indigo-50 whitespace-nowrap text-right text-indigo-950 font-bold bg-indigo-50/40"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Total Cert (24-25)</span>
                    <ArrowUpDown className="w-3 h-3 text-indigo-600" />
                  </div>
                </th>

                {/* Detailed breakdown columns */}
                {viewMode === 'detailed' && (
                  <>
                    <th
                      onClick={() => handleSort('rank1BmcPoint')}
                      className="py-3 px-2 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-right text-orange-700 bg-orange-50/30"
                    >
                      BMC R1
                    </th>
                    <th
                      onClick={() => handleSort('bmhPoint')}
                      className="py-3 px-2 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-right text-cyan-700 bg-cyan-50/30"
                    >
                      BMH
                    </th>
                    <th
                      onClick={() => handleSort('masaKerjaPoint')}
                      className="py-3 px-2 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-right text-emerald-700 bg-emerald-50/30"
                    >
                      Masa Kerja Pts
                    </th>
                    <th
                      onClick={() => handleSort('qccSsPoint')}
                      className="py-3 px-2 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-right text-purple-700 bg-purple-50/30"
                    >
                      QCC / SS
                    </th>
                  </>
                )}

                {/* CURRENT POINT 2024-2025 */}
                <th
                  onClick={() => handleSort('currentPoint2025')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/80 whitespace-nowrap text-right font-bold text-slate-900 bg-slate-100"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Current Point 2024-2025</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort('grade2025')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-center"
                >
                  Grade 2025
                </th>
                <th
                  onClick={() => handleSort('promosi2025')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-center"
                >
                  Promosi '25
                </th>
                <th className="py-3 px-3 text-center whitespace-nowrap">Detail</th>
              </tr>
            ) : (
              /* THEAD FOR SHEET: CURRENT POINT 2026 */
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
                    <span>DOH</span>
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
                      BMC R1
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

                {/* Certification 2026 */}
                <th
                  onClick={() => handleSort('certification2026')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-right text-blue-700 bg-blue-50/50"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Cert 2026</span>
                    <ArrowUpDown className="w-3 h-3 text-blue-400" />
                  </div>
                </th>

                {/* Current Point 2026 */}
                <th
                  onClick={() => handleSort('currentPoint')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 whitespace-nowrap text-right font-bold text-slate-900 bg-slate-100/60"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Current Point 2026</span>
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
            )}
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            {displayList.length === 0 ? (
              <tr>
                <td
                  colSpan={viewMode === 'detailed' ? 17 : 13}
                  className="py-12 text-center text-slate-500 font-sans"
                >
                  <p className="text-sm font-medium text-slate-700">
                    Tidak ada mekanik yang cocok dengan kriteria filter pada {activeSheet === '2024-2025' ? 'Sheet 2024-2025' : 'Sheet 2026'}.
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
                const isPromoted2026 = m.promosi2026 === 'Promosi';
                const isPromoted2025 = m.promosi2025 === 'Promosi';

                if (activeSheet === '2024-2025') {
                  /* ROW FOR SHEET: CURRENT POINT 2024-2025 */
                  return (
                    <tr
                      key={m.nik || m.no}
                      onClick={() => onViewMechanic(m)}
                      className="hover:bg-amber-50/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-2.5 px-3 text-center text-slate-400 tabular-nums">
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

                      {/* CERTIFICATION 2024 */}
                      <td className="py-2.5 px-3 text-right tabular-nums bg-orange-50/50 border-x border-orange-100">
                        <div className="flex items-center justify-end">
                          {m.certification2024 > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold text-xs bg-orange-100 text-orange-950 border border-orange-300 shadow-2xs font-mono tabular-nums">
                              <Award className="w-3 h-3 text-orange-600 shrink-0" />
                              <span>{m.certification2024}</span>
                              <span className="text-[10px] text-orange-700 font-medium">pts</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px] px-2 py-0.5">0 pts</span>
                          )}
                        </div>
                      </td>

                      {/* CERTIFICATION 2025 */}
                      <td className="py-2.5 px-3 text-right tabular-nums bg-amber-50/50 border-r border-amber-100">
                        <div className="flex items-center justify-end">
                          {m.certification2025 > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold text-xs bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs font-mono tabular-nums">
                              <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>{m.certification2025}</span>
                              <span className="text-[10px] text-amber-700 font-medium">pts</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px] px-2 py-0.5">0 pts</span>
                          )}
                        </div>
                      </td>

                      {/* Total Cert 2024-2025 */}
                      <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-slate-800">
                        <div className="flex items-center justify-end">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-bold text-xs bg-indigo-50 text-indigo-950 border border-indigo-200 tabular-nums font-mono">
                            +{m.totalCert2024_2025} pts
                          </span>
                        </div>
                      </td>

                      {/* Detailed Acceleration Columns */}
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
                        </>
                      )}

                      {/* CURRENT POINT 2024-2025 */}
                      <td className="py-2.5 px-4 text-right tabular-nums">
                        <div className="flex items-center justify-end">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md font-black text-xs bg-slate-900 text-white tabular-nums shadow-xs font-mono">
                            {m.currentPoint2025 || m.startPoint} pts
                          </span>
                        </div>
                      </td>

                      {/* Grade 2025 */}
                      <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                          {m.grade2025 || m.startGrade}
                        </span>
                      </td>

                      {/* Promosi 2025 */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap font-sans">
                        {isPromoted2025 ? (
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
                          title="Lihat Detail & Simulator"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                }

                /* ROW FOR SHEET: CURRENT POINT 2026 */
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

                    {/* Current Point 2026 */}
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
                      {isPromoted2026 ? (
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
                        title="Lihat Detail & Simulator Point"
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
            dari <strong className="font-mono text-slate-900">{sortedList.length}</strong> mekanik{' '}
            <span className="text-slate-400">({activeSheet === '2024-2025' ? 'Sheet 2024-2025' : 'Sheet 2026'})</span>
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
