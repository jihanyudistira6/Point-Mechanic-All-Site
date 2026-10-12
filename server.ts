import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API: AI Mechanic Evaluation & Promotion Advisor
app.post('/api/ai/analyze-mechanic', async (req, res) => {
  try {
    const { mechanic } = req.body;
    if (!mechanic) {
      return res.status(400).json({ error: 'Data mekanik tidak ditemukan.' });
    }

    const prompt = `Anda adalah seorang Lead Technical Training & Career Development Specialist untuk armada alat berat tambang dan konstruksi.
Analisis data rekam jejak mekanik berikut:
- NIK: ${mechanic.nik}
- Nama: ${mechanic.nama}
- Site: ${mechanic.site}
- DOH (Hire Date): ${mechanic.doh || '-'} (${mechanic.tenureYears || 0} tahun)
- Start Grade: ${mechanic.startGrade}
- Start Point: ${mechanic.startPoint}
- Status: ${mechanic.status}
- Poin Rank 1 BMC: ${mechanic.rank1BmcPoint}
- Poin BMH: ${mechanic.bmhPoint}
- Poin Masa Kerja: ${mechanic.masaKerjaPoint}
- Poin QCC/SS: ${mechanic.qccSsPoint}
- Poin Sertifikasi 2025: ${mechanic.certification2025}
- Poin Sertifikasi 2026: ${mechanic.certification2026}
- Current Point: ${mechanic.currentPoint}
- Target Grade 2026: ${mechanic.upgrade2026}
- Status Promosi: ${mechanic.promosi2026}
- Grade Selanjutnya: ${mechanic.nextGradeTarget} (Kekurangan: ${mechanic.pointsToNextGrade} poin)

Standar Grade Alat Berat:
G1 (0~120), G2 (121~260), G3 (261~430), G4 (431~630), G5 (631~870), G6 (871~1150), G7 (1151+).

Berikan evaluasi dalam format terstruktur dan bahasa Indonesia profesional:
1. Ringkasan Status & Performa (Singkat 2 kalimat)
2. Analisis Kesiapan Promosi Grade (Kekuatan & area pengembangan)
3. Rekomendasi Aksi Akselerasi Poin (Langkah konkrit apa yang perlu diambil mekanik ini: misal uji sertifikasi ulang, ikut program QCC/SS, kursus BMH, dsb.)
4. Estimasi Timeline Kenaikan Grade`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Berikan evaluasi teknis yang jelas, ringkas, memotivasi, dan mudah ditindaklanjuti oleh Section Head Service & HRD.',
      },
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error('Error analyzing mechanic:', error);
    res.status(500).json({
      error: 'Gagal menjalankan analisis AI',
      details: error.message || String(error),
    });
  }
});

// API: AI Site Executive Assessment
app.post('/api/ai/site-summary', async (req, res) => {
  try {
    const { site, totalMechanics, activeCount, promotedCount, avgPoints, gradeCounts, topNeeds } = req.body;

    const prompt = `Anda adalah Senior Fleet Service Operations Consultant.
Buat ringkasan eksekutif singkat untuk Site Operasional: "${site}".
Data Site:
- Total Mekanik: ${totalMechanics} orang
- Mekanik Aktif: ${activeCount} orang
- Kandidat Promosi Grade 2026: ${promotedCount} orang (${totalMechanics > 0 ? Math.round((promotedCount / totalMechanics) * 100) : 0}%)
- Rata-rata Poin Mekanik: ${avgPoints} poin
- Distribusi Grade: ${JSON.stringify(gradeCounts)}

Tuliskan dalam format ringkas (maksimal 3 paragraf singkat dengan poin bullet):
1. Gambaran Kesiapan Armada & SDM Mekanik di Site Ini
2. Rekomendasi Prioritas Pelatihan & Sertifikasi untuk Site Manager
3. Strategi Percepatan Promosi Mekanik Level G1-G3 menuju G4+`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ summary: response.text });
  } catch (error: any) {
    console.error('Error generating site summary:', error);
    res.status(500).json({
      error: 'Gagal membuat ringkasan AI untuk site',
      details: error.message || String(error),
    });
  }
});

// API: AI Natural Language Query Assistant
app.post('/api/ai/query', async (req, res) => {
  try {
    const { userQuery, siteContext, totalRecords } = req.body;
    if (!userQuery) {
      return res.status(400).json({ error: 'Query tidak boleh kosong.' });
    }

    const prompt = `Pengguna menanyakan informasi mengenai database mekanik (total ${totalRecords} data mekanik di berbagai site: GAM-SKL, GBP-MLK, HOI-BPN, IPR-INF, IPR-SYR, IPR-TBG, KJA-BKJ, MSJ-SPR, TJA - BDA, TMC-BKJ, WBM-STI).
Site aktif saat ini: ${siteContext || 'Semua Site'}.

Pertanyaan pengguna: "${userQuery}"

Tolong berikan jawaban langsung, informatif, dan praktis dalam Bahasa Indonesia. Jika relevan, berikan saran filter apa yang sebaiknya digunakan (misal: Site tertentu, Grade tertentu, atau status Promosi).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ answer: response.text });
  } catch (error: any) {
    console.error('Error in AI query:', error);
    res.status(500).json({
      error: 'Gagal memproses pertanyaan AI',
      details: error.message || String(error),
    });
  }
});

// Sync / Validate Spreadsheet URL
app.post('/api/spreadsheet/fetch-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL Spreadsheet tidak valid.' });
    }

    // Convert standard Google Sheets URL to CSV export URL if needed
    let fetchUrl = url.trim();
    if (fetchUrl.includes('docs.google.com/spreadsheets/d/')) {
      const match = fetchUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        const sheetId = match[1];
        fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      }
    }

    const response = await fetch(fetchUrl);
    if (!response.ok) {
      return res.status(400).json({
        error: `Gagal mengunduh spreadsheet dari URL (Status: ${response.status} ${response.statusText}). Pastikan Spreadsheet dibagikan ke publik atau 'Anyone with link can view'.`,
      });
    }

    const csvText = await response.text();
    res.json({ csvText, rowCount: csvText.split('\n').filter(r => r.trim()).length });
  } catch (error: any) {
    console.error('Error fetching spreadsheet url:', error);
    res.status(500).json({
      error: 'Gagal menghubungkan Spreadsheet',
      details: error.message || String(error),
    });
  }
});

// Vite Middleware for development
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Mechanic Point Server listening on port ${port}`);
});
