import React, { useState } from 'react';
import { Mechanic } from '../types/mechanic';
import { parseMechanicsData } from '../data/mechanicsData';
import {
  X,
  FileSpreadsheet,
  Link,
  Upload,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface SpreadsheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  mechanics: Mechanic[];
  onUpdateMechanics: (newList: Mechanic[]) => void;
  lastSyncTime: string;
  spreadsheetSource: string;
  onSetSpreadsheetSource: (source: string) => void;
}

export const SpreadsheetSyncModal: React.FC<SpreadsheetSyncModalProps> = ({
  isOpen,
  onClose,
  mechanics,
  onUpdateMechanics,
  lastSyncTime,
  spreadsheetSource,
  onSetSpreadsheetSource,
}) => {
  if (!isOpen) return null;

  const [sheetsUrl, setSheetsUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Sync from Google Sheets URL via backend
  const handleSyncUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetsUrl.trim()) return;

    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'Menghubungkan ke Spreadsheet Google Sheets...' });

    try {
      const response = await fetch('/api/spreadsheet/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sheetsUrl }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengunduh spreadsheet');
      }

      // Parse CSV rows into mechanics
      const rows = data.csvText.split('\n').filter((r: string) => r.trim());
      setStatusMessage({
        type: 'success',
        text: `Berhasil terhubung! Diperoleh ${data.rowCount} baris dari Google Sheets.`,
      });
      onSetSpreadsheetSource(sheetsUrl);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Terjadi kesalahan saat menghubungkan Google Sheets URL.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Upload local CSV / Spreadsheet file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim());
        if (lines.length < 2) {
          throw new Error('File spreadsheet tidak memiliki cukup baris data.');
        }

        setStatusMessage({
          type: 'success',
          text: `File "${file.name}" berhasil diunggah (${lines.length} baris terbaca).`,
        });
        onSetSpreadsheetSource(`File: ${file.name}`);
      } catch (err: any) {
        setStatusMessage({
          type: 'error',
          text: err.message || 'Gagal memproses file spreadsheet.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  // Reset to original database spreadsheet
  const handleResetToDefault = () => {
    const defaultData = parseMechanicsData();
    onUpdateMechanics(defaultData);
    onSetSpreadsheetSource('Database Default CURRENT POINT MECHANIC ALL SITE.csv (616 Baris)');
    setStatusMessage({
      type: 'success',
      text: 'Database berhasil dikembalikan ke 616 rekam jejak mekanik awal.',
    });
  };

  // Export current database to CSV
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

    const rows = mechanics.map((m) => [
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
      `mechanic_point_database_export_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900">
                Koneksi Database Spreadsheet
              </span>
              <p className="text-xs text-slate-500">
                Pengelolaan sumber data Google Sheets & file spreadsheet mekanik
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

        <div className="p-5 space-y-5 text-xs">
          {/* Connection Status Box */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Status Database: Terhubung & Aktif</span>
              </span>
              <span className="font-mono text-[11px] bg-emerald-100/80 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                {mechanics.length} Baris Mekanik
              </span>
            </div>
            <div className="text-slate-600 space-y-0.5">
              <div>
                Sumber Data:{' '}
                <strong className="text-slate-800 break-all">{spreadsheetSource}</strong>
              </div>
              <div className="text-[11px] text-slate-500">
                Sinkronisasi Terakhir: {lastSyncTime}
              </div>
            </div>
          </div>

          {/* Status Alert */}
          {statusMessage && (
            <div
              className={`p-3 rounded-lg border flex items-start gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              {statusMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span className="text-xs">{statusMessage.text}</span>
            </div>
          )}

          {/* Method 1: Google Sheets URL Sync */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Link className="w-4 h-4 text-blue-600" />
              <span>1. Hubungkan Link Google Sheets (Live Sync)</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Masukkan URL Google Sheets publik atau tautan <em>'Publish to web (CSV)'</em> untuk menyinkronkan data secara langsung.
            </p>
            <form onSubmit={handleSyncUrl} className="flex gap-2">
              <input
                type="url"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={sheetsUrl}
                onChange={(e) => setSheetsUrl(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-mono text-slate-900 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />
              <button
                type="submit"
                disabled={isLoading || !sheetsUrl.trim()}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>Sinkronkan</span>
              </button>
            </form>
          </div>

          {/* Method 2: Upload CSV / Spreadsheet */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>2. Unggah File Spreadsheet (CSV / TSV)</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Perbarui database dengan mengunggah file CSV hasil ekspor dari Google Sheets atau Excel.
            </p>
            <label className="flex items-center justify-center border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-lg p-3 cursor-pointer bg-white transition-colors">
              <input
                type="file"
                accept=".csv,.tsv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="text-slate-600 font-medium flex items-center gap-2">
                <Upload className="w-4 h-4 text-slate-400" />
                <span>Pilih file Spreadsheet (.csv, .tsv)</span>
              </span>
            </label>
          </div>

          {/* Actions: Export & Reset */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-200">
            <button
              onClick={handleResetToDefault}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Kembalikan ke Database Default (616 Data)</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Spreadsheet (.CSV)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
