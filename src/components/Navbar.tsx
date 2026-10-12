import React from 'react';
import {
  Wrench,
  Download,
  Plus,
  BookOpen,
  FileSpreadsheet,
  Sparkles,
  BarChart2,
  Table,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'table' | 'site-compare';
  onTabChange: (tab: 'table' | 'site-compare') => void;
  onExportCsv: () => void;
  onAddMechanic: () => void;
  onOpenGradeInfo: () => void;
  onOpenSpreadsheetModal: () => void;
  onToggleAiPanel: () => void;
  isAiPanelOpen: boolean;
  totalFiltered: number;
  totalMechanics: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onExportCsv,
  onAddMechanic,
  onOpenGradeInfo,
  onOpenSpreadsheetModal,
  onToggleAiPanel,
  isAiPanelOpen,
  totalFiltered,
  totalMechanics,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4 sm:gap-8">
          {/* Zone 1: Single text wordmark brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center shadow-xs">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
                MechanicPoint
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-mono text-slate-500">
                · AI & Spreadsheet Fleet DB
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
            {/* Primary view: Tabel Data & Filter (Replaces Overview & Grafik) */}
            <button
              onClick={() => onTabChange('table')}
              className={`transition-colors whitespace-nowrap py-1 flex items-center gap-1.5 ${
                activeTab === 'table'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'hover:text-slate-900'
              }`}
            >
              <Table className="w-4 h-4 text-slate-500" />
              <span>Tabel Database & Filter</span>
              <span className="font-mono text-xs bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                {totalFiltered}
              </span>
            </button>

            {/* Cross-site comparison */}
            <button
              onClick={() => onTabChange('site-compare')}
              className={`transition-colors whitespace-nowrap py-1 flex items-center gap-1.5 ${
                activeTab === 'site-compare'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-4 h-4 text-slate-500" />
              <span>Komparasi Site</span>
            </button>

            {/* Grade Matrix reference */}
            <button
              onClick={onOpenGradeInfo}
              className="text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap py-1 flex items-center gap-1 text-xs"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Matriks Grade</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions (Spreadsheet Sync + AI Assistant + Add Mech) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Spreadsheet Database Connector Status */}
            <button
              onClick={onOpenSpreadsheetModal}
              title="Kelola & Hubungkan Database Spreadsheet"
              className="px-2.5 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Spreadsheet</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {/* AI Assistant Toggle Button */}
            <button
              onClick={onToggleAiPanel}
              title="Buka / Tutup Asisten AI"
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap border ${
                isAiPanelOpen
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Asisten</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={onExportCsv}
              title="Download CSV database mechanic"
              className="hidden lg:flex px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors items-center gap-1 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            {/* Add Mechanic */}
            <button
              onClick={onAddMechanic}
              className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tambah</span>
            </button>
          </div>
        </div>

        {/* Mobile Submenu Bar */}
        <div className="md:hidden flex items-center gap-4 py-2 border-t border-slate-100 overflow-x-auto text-xs font-medium text-slate-600">
          <button
            onClick={() => onTabChange('table')}
            className={`whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'table' ? 'text-slate-900 font-bold' : ''
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Tabel & Filter ({totalFiltered})</span>
          </button>
          <button
            onClick={() => onTabChange('site-compare')}
            className={`whitespace-nowrap ${
              activeTab === 'site-compare' ? 'text-slate-900 font-bold' : ''
            }`}
          >
            Komparasi Site
          </button>
          <button
            onClick={onOpenGradeInfo}
            className="whitespace-nowrap text-amber-700"
          >
            Matriks Grade
          </button>
          <button
            onClick={onOpenSpreadsheetModal}
            className="whitespace-nowrap text-emerald-700 flex items-center gap-1"
          >
            <FileSpreadsheet className="w-3 h-3" />
            <span>Spreadsheet</span>
          </button>
        </div>
      </div>
    </header>
  );
};
