import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userQuery, siteContext, totalRecords } = req.body;
    if (!userQuery) {
      return res.status(400).json({ error: 'Query tidak boleh kosong.' });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `Pengguna menanyakan informasi mengenai database mekanik (total ${totalRecords} data mekanik di berbagai site: GAM-SKL, GBP-MLK, HOI-BPN, IPR-INF, IPR-SYR, IPR-TBG, KJA-BKJ, MSJ-SPR, TJA - BDA, TMC-BKJ, WBM-STI).
Site aktif saat ini: ${siteContext || 'Semua Site'}.

Pertanyaan pengguna: "${userQuery}"

Tolong berikan jawaban langsung, informatif, dan praktis dalam Bahasa Indonesia. Jika relevan, berikan saran filter apa yang sebaiknya digunakan (misal: Site tertentu, Grade tertentu, atau status Promosi).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.status(200).json({ answer: response.text });
  } catch (error: any) {
    console.error('Vercel serverless error in AI query:', error);
    res.status(500).json({
      error: 'Gagal memproses pertanyaan AI',
      details: error.message || String(error),
    });
  }
}
