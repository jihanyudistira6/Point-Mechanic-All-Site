import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { site, totalMechanics, activeCount, promotedCount, avgPoints, gradeCounts } = req.body;

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

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

    res.status(200).json({ summary: response.text });
  } catch (error: any) {
    console.error('Vercel serverless error site summary:', error);
    res.status(500).json({
      error: 'Gagal membuat ringkasan AI untuk site',
      details: error.message || String(error),
    });
  }
}
