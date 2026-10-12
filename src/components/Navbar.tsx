import React from 'react';
import { Wrench, Download, Plus, BookOpen } from 'lucide-react';

interface NavbarProps {
  activeTab: 'overview' | 'mechanics' | 'site-compare' | 'grade-matrix';
  onTabChange: (tab: 'overview' | 'mechanics' | 'site-compare' | 'grade-matrix') => void;
  onExportCsv: () => void;
  onAddMechanic: () => void;
  onOpenGradeInfo: () => void;
  totalFiltered: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onExportCsv,
  onAddMechanic,
  onOpenGradeInfo,
  totalFiltered,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Zone 1: Single text wordmark brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center shadow-sm">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
                MechanicPoint
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-mono text-slate-500">
                · All-Site Portal
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (single line, no wrapping) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => onTabChange('overview')}
              className={`transition-colors whitespace-nowrap py-1 ${
                activeTab === 'overview'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'hover:text-slate-900'
              }`}
            >
              Overview & Grafik
            </button>
            <button
              onClick={() => onTabChange('mechanics')}
              className={`transition-colors whitespace-nowrap py-1 flex items-center gap-1.5 ${
                activeTab === 'mechanics'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'hover:text-slate-900'
              }`}
            >
              <span>Daftar Mechanic</span>
              <span className="font-mono text-xs bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                {totalFiltered}
              </span>
            </button>
            <button
              onClick={() => onTabChange('site-compare')}
              className={`transition-colors whitespace-nowrap py-1 ${
                activeTab === 'site-compare'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'hover:text-slate-900'
              }`}
            >
              Analisis Komparasi Site
            </button>
            <button
              onClick={() => onOpenGradeInfo()}
              className="text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap py-1 flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Matriks Grade G1–G7</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onExportCsv}
              title="Download CSV database mechanic"
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={onAddMechanic}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Mechanic</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="md:hidden flex items-center gap-4 py-2 border-t border-slate-100 overflow-x-auto text-xs font-medium text-slate-600">
          <button
            onClick={() => onTabChange('overview')}
            className={`whitespace-nowrap ${activeTab === 'overview' ? 'text-slate-900 font-semibold' : ''}`}
          >
            Overview & Grafik
          </button>
          <button
            onClick={() => onTabChange('mechanics')}
            className={`whitespace-nowrap ${activeTab === 'mechanics' ? 'text-slate-900 font-semibold' : ''}`}
          >
            Daftar Mechanic ({totalFiltered})
          </button>
          <button
            onClick={() => onTabChange('site-compare')}
            className={`whitespace-nowrap ${activeTab === 'site-compare' ? 'text-slate-900 font-semibold' : ''}`}
          >
            Analisis Komparasi Site
          </button>
          <button
            onClick={onOpenGradeInfo}
            className="whitespace-nowrap text-amber-700"
          >
            Panduan Grade
          </button>
        </div>
      </div>
    </header>
  );
};
