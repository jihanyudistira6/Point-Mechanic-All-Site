import React, { useState } from 'react';
import { Mechanic } from '../types/mechanic';
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  Lightbulb,
  FileText,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';

interface AiAssistantPanelProps {
  selectedSite: string;
  mechanics: Mechanic[];
  onApplySiteFilter?: (site: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const AiAssistantPanel: React.FC<AiAssistantPanelProps> = ({
  selectedSite,
  mechanics,
  onApplySiteFilter,
  isOpen,
  onToggle,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Quick prompt presets
  const PRESET_PROMPTS = [
    `Analisis kesiapan promosi mekanik di site ${selectedSite === 'ALL' ? 'seluruh site' : selectedSite}`,
    `Rekomendasi prioritas pelatihan (BMH & Rank 1 BMC) untuk percepatan grade`,
    `Evaluasi mekanik grade G1 dan G2 yang berpotensi promosi tahun 2026`,
    `Ringkasan kesenjangan poin sertifikasi 2025 vs 2026`,
  ];

  const handleAskAi = async (questionToAsk?: string) => {
    const finalQuestion = questionToAsk || query;
    if (!finalQuestion.trim()) return;

    setIsLoading(true);
    setAiResponse(null);

    try {
      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: finalQuestion,
          siteContext: selectedSite,
          totalRecords: mechanics.length,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal memproses respon AI');
      }

      setAiResponse(data.answer);
      if (!questionToAsk) setQuery('');
    } catch (err: any) {
      setAiResponse(`Terjadi kesalahan: ${err.message || 'Tidak dapat terhubung ke server AI.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSiteExecutiveAnalysis = async () => {
    setIsLoading(true);
    setAiResponse(null);

    try {
      const activeCount = mechanics.filter((m) => m.status === 'Active').length;
      const promotedCount = mechanics.filter((m) => m.promosi2026 === 'Promosi').length;
      const totalPoints = mechanics.reduce((acc, m) => acc + m.currentPoint, 0);
      const avgPoints = mechanics.length > 0 ? Math.round(totalPoints / mechanics.length) : 0;

      const gradeCounts: Record<string, number> = {};
      mechanics.forEach((m) => {
        const g = m.upgrade2026 || m.startGrade;
        gradeCounts[g] = (gradeCounts[g] || 0) + 1;
      });

      const response = await fetch('/api/ai/site-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site: selectedSite === 'ALL' ? 'Seluruh Site Operasional' : selectedSite,
          totalMechanics: mechanics.length,
          activeCount,
          promotedCount,
          avgPoints,
          gradeCounts,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal membuat ringkasan eksekutif');
      }

      setAiResponse(data.summary);
    } catch (err: any) {
      setAiResponse(`Terjadi kendala saat menganalisis site: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden transition-all">
      {/* Header Bar */}
      <div
        onClick={onToggle}
        className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight">
                AI Mechanic Assistant & Insight Engine
              </span>
              <span className="text-[10px] font-mono bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded border border-indigo-400/30">
                Gemini 3.8
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Analisis cerdas karir mekanik, suksesi promosi grade, dan rekam jejak sertifikasi berbasis AI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="hidden sm:inline">
            {isOpen ? 'Sembunyikan Panel AI' : 'Buka Asisten AI'}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Expandable Body */}
      {isOpen && (
        <div className="p-4 sm:p-5 border-t border-slate-100 space-y-4">
          {/* Quick AI Presets */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Pertanyaan Cepat Rekomendasi:</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAskAi(p)}
                  disabled={isLoading}
                  className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg px-2.5 py-1.5 transition-colors text-left disabled:opacity-50"
                >
                  {p}
                </button>
              ))}
              <button
                onClick={handleSiteExecutiveAnalysis}
                disabled={isLoading}
                className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg px-2.5 py-1.5 font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Buat Ringkasan Eksekutif Site AI</span>
              </button>
            </div>
          </div>

          {/* Prompt Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskAi();
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Tanyakan analisis mekanik, rekomendasi promosi, atau gap sertifikasi..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isLoading}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-3 pr-8 py-2 text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-500"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Kirim Pertanyaan</span>
            </button>
          </form>

          {/* AI Response Display */}
          {isLoading && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3 text-xs text-slate-600 animate-pulse">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              <span>Sedang memproses dan menganalisis database mekanik dengan Gemini AI...</span>
            </div>
          )}

          {aiResponse && !isLoading && (
            <div className="p-4 bg-indigo-50/50 border border-indigo-200/80 rounded-xl relative">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-100 mb-3">
                <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-950">
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <span>Hasil Analisis AI:</span>
                </div>
                <button
                  onClick={() => setAiResponse(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600"
                  title="Tutup Hasil"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-sans">
                {aiResponse}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
