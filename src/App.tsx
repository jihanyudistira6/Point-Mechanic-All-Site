import React, { useState, useMemo } from 'react';
import { INITIAL_MECHANICS, ALL_SITES } from './data/mechanicsData';
import { Mechanic } from './types/mechanic';
import { Navbar } from './components/Navbar';
import { KpiCards } from './components/KpiCards';
import { SiteCategoryCharts } from './components/SiteCategoryCharts';
import { MechanicTable } from './components/MechanicTable';
import { SiteComparisonView } from './components/SiteComparisonView';
import { MechanicDetailModal } from './components/MechanicDetailModal';
import { GradeMatrixModal } from './components/GradeMatrixModal';
import { AddMechanicModal } from './components/AddMechanicModal';
import {
  MapPin,
  Trophy,
  BarChart3,
  ListFilter,
  Sparkles,
  ArrowRight,
  Shield,
  Clock,
  Layers,
} from 'lucide-react';

export default function App() {
  const [mechanics, setMechanics] = useState<Mechanic[]>(INITIAL_MECHANICS);
  const [selectedSite, setSelectedSite] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'overview' | 'mechanics' | 'site-compare' | 'grade-matrix'>('overview');

  // Modals
  const [viewingMechanic, setViewingMechanic] = useState<Mechanic | null>(null);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Available unique sites
  const allSites = useMemo(() => {
    return ALL_SITES;
  }, []);

  // Filtered mechanics based on selected site
  const siteFilteredMechanics = useMemo(() => {
    if (selectedSite === 'ALL') return mechanics;
    return mechanics.filter((m) => m.site === selectedSite);
  }, [mechanics, selectedSite]);

  // Top 5 Leaderboard mechanics
  const topMechanics = useMemo(() => {
    return [...siteFilteredMechanics]
      .sort((a, b) => b.currentPoint - a.currentPoint)
      .slice(0, 5);
  }, [siteFilteredMechanics]);

  // Update a mechanic (from simulator modal)
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
      {/* 1. Top Bar Contract */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'grade-matrix') {
            setIsGradeModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onExportCsv={handleExportCsv}
        onAddMechanic={() => setIsAddModalOpen(true)}
        onOpenGradeInfo={() => setIsGradeModalOpen(true)}
        totalFiltered={siteFilteredMechanics.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Site Quick Filter Bar & Header Title */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Mechanic Point & Acceleration System
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  · Periode Evaluasi 2026
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600">
                Monitoring capaian akumulasi poin seluruh mekanik: akselerasi (Rank 1 BMC, BMH, Masa Kerja, QCC/SS) dan perbandingan Sertifikasi 2025 vs 2026 di seluruh site operasional.
              </p>
            </div>

            {/* Selected site active pill */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Filter Site Aktif:</span>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg font-medium shadow-xs">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{selectedSite === 'ALL' ? 'Semua Site Operasional' : `Site: ${selectedSite}`}</span>
                {selectedSite !== 'ALL' && (
                  <button
                    onClick={() => setSelectedSite('ALL')}
                    className="ml-1 text-[10px] text-slate-300 hover:text-white underline"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Site Segmented Selector */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1">
              <ListFilter className="w-3 h-3 text-slate-400" />
              <span>Pilih Site Operasional:</span>
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

        {/* 2. KPI Cards */}
        <KpiCards
          mechanics={siteFilteredMechanics}
          selectedSite={selectedSite}
        />

        {/* 3. Primary Views based on Active Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Charts Section: Primary requirement requested by user */}
            <SiteCategoryCharts
              mechanics={mechanics}
              selectedSite={selectedSite}
              onSelectSite={(site) => setSelectedSite(site)}
              allSites={allSites}
            />

            {/* Quick Leaderboard Strip */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-bold text-slate-900">
                    Top 5 Mekanik Tertinggi Poin ({selectedSite === 'ALL' ? 'Seluruh Site' : `Site ${selectedSite}`})
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('mechanics')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  <span>Lihat Seluruh {siteFilteredMechanics.length} Mekanik</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                {topMechanics.map((m, idx) => (
                  <div
                    key={m.nik}
                    onClick={() => setViewingMechanic(m)}
                    className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-blue-50/40 hover:border-blue-200 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-mono font-bold text-slate-900">#{idx + 1}</span>
                      <span className="bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded font-bold font-mono">
                        {m.upgrade2026}
                      </span>
                    </div>
                    <div className="mt-1 font-semibold text-slate-900 text-xs truncate" title={m.nama}>
                      {m.nama}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {m.site} · NIK {m.nik}
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Current:</span>
                      <span className="font-bold font-mono text-slate-900 tabular-nums">
                        {m.currentPoint} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Complete Data Table */}
            <MechanicTable
              mechanics={siteFilteredMechanics}
              allSites={allSites}
              selectedSite={selectedSite}
              onSelectSite={(site) => setSelectedSite(site)}
              onViewMechanic={(m) => setViewingMechanic(m)}
            />
          </div>
        )}

        {activeTab === 'mechanics' && (
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

        {activeTab === 'site-compare' && (
          <div className="space-y-6">
            {/* Visual Charts */}
            <SiteCategoryCharts
              mechanics={mechanics}
              selectedSite={selectedSite}
              onSelectSite={(site) => setSelectedSite(site)}
              allSites={allSites}
            />

            {/* In-depth Matrix Comparison Table */}
            <SiteComparisonView
              mechanics={mechanics}
              allSites={allSites}
              onSelectSite={(site) => {
                setSelectedSite(site);
                setActiveTab('overview');
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">MechanicPoint Dashboard</span>
            <span>· Sistem Manajemen Poin & Akselerasi Grade Mekanik</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Total: <strong>{mechanics.length} Data Mekanik</strong></span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsGradeModalOpen(true)}
              className="hover:text-slate-800 underline"
            >
              Standar Matriks Grade (G1–G7)
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
    </div>
  );
}
