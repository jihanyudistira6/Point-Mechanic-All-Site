import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_MECHANICS, ALL_SITES } from './data/mechanicsData';
import { Mechanic } from './types/mechanic';
import { Navbar } from './components/Navbar';
import { KpiCards } from './components/KpiCards';
import { MechanicTable } from './components/MechanicTable';
import { SiteComparisonView } from './components/SiteComparisonView';
import { MechanicDetailModal } from './components/MechanicDetailModal';
import { GradeMatrixModal } from './components/GradeMatrixModal';
import { AddMechanicModal } from './components/AddMechanicModal';
import { SpreadsheetSyncModal } from './components/SpreadsheetSyncModal';
import { AiAssistantPanel } from './components/AiAssistantPanel';
import {
  FileSpreadsheet,
  Sparkles,
  MapPin,
  ListFilter,
  CheckCircle2,
  RefreshCw,
  Database,
} from 'lucide-react';

const STORAGE_KEY = 'mechanic_point_database_records';
const SPREADSHEET_SOURCE_KEY = 'mechanic_point_spreadsheet_source';

export default function App() {
  // Load initial records from localStorage if present, else fallback to INITIAL_MECHANICS
  const [mechanics, setMechanics] = useState<Mechanic[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load from localStorage:', e);
    }
    return INITIAL_MECHANICS;
  });

  const [spreadsheetSource, setSpreadsheetSource] = useState<string>(() => {
    return (
      localStorage.getItem(SPREADSHEET_SOURCE_KEY) ||
      'CURRENT POINT MECHANIC ALL SITE.csv (Spreadsheet Terhubung)'
    );
  });

  const [lastSyncTime, setLastSyncTime] = useState<string>('Hari ini, Sinkron Otomatis');
  const [selectedSite, setSelectedSite] = useState<string>('ALL');
  // Default and primary tab is 'table' (Overview & Grafik removed as requested)
  const [activeTab, setActiveTab] = useState<'table' | 'site-compare'>('table');

  // AI Assistant panel toggle
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);

  // Modals
  const [viewingMechanic, setViewingMechanic] = useState<Mechanic | null>(null);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSpreadsheetModalOpen, setIsSpreadsheetModalOpen] = useState(false);

  // Persist mechanics updates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mechanics));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  }, [mechanics]);

  useEffect(() => {
    localStorage.setItem(SPREADSHEET_SOURCE_KEY, spreadsheetSource);
  }, [spreadsheetSource]);

  // Unique sites from current dataset
  const allSites = useMemo(() => {
    const list = Array.from(new Set(mechanics.map((m) => m.site))).sort();
    return list.length > 0 ? list : ALL_SITES;
  }, [mechanics]);

  // Filtered mechanics based on selected site
  const siteFilteredMechanics = useMemo(() => {
    if (selectedSite === 'ALL') return mechanics;
    return mechanics.filter((m) => m.site === selectedSite);
  }, [mechanics, selectedSite]);

  // Update a mechanic (from simulator / detail modal)
  const handleUpdateMechanic = (updated: Mechanic) => {
    setMechanics((prev) =>
      prev.map((m) => (m.nik === updated.nik || m.no === updated.no ? updated : m))
    );
  };

  // Add new mechanic
  const handleAddMechanic = (newMech: Mechanic) => {
    setMechanics((prev) => [newMech, ...prev]);
  };

  // Export CSV handler
  const handleExportCsv = () => {
    const headers = [
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

    const rows = siteFilteredMechanics.map((m) => [
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

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `mechanic_points_${selectedSite}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. Header Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onExportCsv={handleExportCsv}
        onAddMechanic={() => setIsAddModalOpen(true)}
        onOpenGradeInfo={() => setIsGradeModalOpen(true)}
        onOpenSpreadsheetModal={() => setIsSpreadsheetModalOpen(true)}
        onToggleAiPanel={() => setIsAiPanelOpen(!isAiPanelOpen)}
        isAiPanelOpen={isAiPanelOpen}
        totalFiltered={siteFilteredMechanics.length}
        totalMechanics={mechanics.length}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Spreadsheet Database Connection & AI Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Database & Point Evaluasi Mechanic
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  · Berbasis AI & Spreadsheet
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600">
                Sistem database terintegrasi spreadsheet dengan fitur filter canggih seluruh site, pemantauan poin akselerasi (Rank 1 BMC, BMH, Masa Kerja, QCC/SS, Sertifikasi 2025 & 2026), serta evaluasi karir cerdas berbasis AI.
              </p>
            </div>

            {/* Quick Spreadsheet & AI Status Pill */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsSpreadsheetModalOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Spreadsheet Terhubung</span>
                <span className="font-mono font-bold text-emerald-700 ml-1">
                  ({mechanics.length})
                </span>
              </button>

              <button
                onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
                className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-900 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isAiPanelOpen ? 'Tutup Asisten AI' : 'Buka Asisten AI'}</span>
              </button>
            </div>
          </div>

          {/* Quick Site Segmented Selector */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <ListFilter className="w-3 h-3 text-slate-400" />
                <span>Pilih Filter Site Operasional:</span>
              </div>
              {selectedSite !== 'ALL' && (
                <button
                  onClick={() => setSelectedSite('ALL')}
                  className="text-blue-600 hover:text-blue-800 underline text-[11px]"
                >
                  Tampilkan Semua Site
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedSite('ALL')}
                className={`px-3 py-1 text-xs rounded-md transition-colors whitespace-nowrap ${
                  selectedSite === 'ALL'
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Semua Site ({mechanics.length})
              </button>
              {allSites.map((site) => {
                const count = mechanics.filter((m) => m.site === site).length;
                const isSelected = selectedSite === site;
                return (
                  <button
                    key={site}
                    onClick={() => setSelectedSite(site)}
                    className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap ${
                      isSelected
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{site}</span>
                    <span className="ml-1 opacity-70 font-mono text-[10px]">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. AI Assistant Engine Panel (Expandable) */}
        <AiAssistantPanel
          selectedSite={selectedSite}
          mechanics={siteFilteredMechanics}
          isOpen={isAiPanelOpen}
          onToggle={() => setIsAiPanelOpen(!isAiPanelOpen)}
        />

        {/* 3. KPI Aggregate Metrics */}
        <KpiCards mechanics={siteFilteredMechanics} selectedSite={selectedSite} />

        {/* 4. Primary View: TABEL DATABASE YANG DAPAT DIFILTER (Replacing Overview & Grafik) */}
        {activeTab === 'table' && (
          <div className="space-y-6">
            <MechanicTable
              mechanics={siteFilteredMechanics}
              allSites={allSites}
              selectedSite={selectedSite}
              onSelectSite={(site) => setSelectedSite(site)}
              onViewMechanic={(m) => setViewingMechanic(m)}
            />
          </div>
        )}

        {/* 5. Secondary View: Komparasi Site */}
        {activeTab === 'site-compare' && (
          <div className="space-y-6">
            <SiteComparisonView
              mechanics={mechanics}
              allSites={allSites}
              onSelectSite={(site) => {
                setSelectedSite(site);
                setActiveTab('table');
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">MechanicPoint System</span>
            <span>· Database Spreadsheet & Career Acceleration Engine</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>
              Total: <strong>{mechanics.length} Data Mekanik</strong>
            </span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsSpreadsheetModalOpen(true)}
              className="hover:text-slate-800 underline flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kelola Spreadsheet</span>
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsGradeModalOpen(true)}
              className="hover:text-slate-800 underline"
            >
              Panduan Matriks Grade
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <MechanicDetailModal
        mechanic={viewingMechanic}
        onClose={() => setViewingMechanic(null)}
        onSave={handleUpdateMechanic}
      />

      <GradeMatrixModal
        isOpen={isGradeModalOpen}
        onClose={() => setIsGradeModalOpen(false)}
      />

      <AddMechanicModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddMechanic}
        allSites={allSites}
        nextNo={mechanics.length + 1}
      />

      <SpreadsheetSyncModal
        isOpen={isSpreadsheetModalOpen}
        onClose={() => setIsSpreadsheetModalOpen(false)}
        mechanics={mechanics}
        onUpdateMechanics={setMechanics}
        lastSyncTime={lastSyncTime}
        spreadsheetSource={spreadsheetSource}
        onSetSpreadsheetSource={(src) => {
          setSpreadsheetSource(src);
          setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
        }}
      />
    </div>
  );
}
