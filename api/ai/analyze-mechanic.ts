import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mechanic } = req.body;
    if (!mechanic) {
      return res.status(400).json({ error: 'Data mekanik tidak ditemukan.' });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

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

    res.status(200).json({ analysis: response.text });
  } catch (error: any) {
    console.error('Vercel serverless error analyzing mechanic:', error);
    res.status(500).json({
      error: 'Gagal menjalankan analisis AI',
      details: error.message || String(error),
    });
  }
}
