import { Mechanic, GRADE_THRESHOLDS } from '../types/mechanic';

// Client-side fallback generation if server API is unavailable (e.g. GitHub Pages static deployment)
export async function analyzeMechanicWithAi(mechanic: Mechanic): Promise<string> {
  try {
    const res = await fetch('/api/ai/analyze-mechanic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mechanic }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.analysis) return data.analysis;
    }
  } catch (err) {
    console.warn('Backend API unavailable, using resilient local intelligence engine:', err);
  }

  // Resilient Domain Intelligence Fallback (Guaranteed to work 100% on GitHub Pages & offline)
  const currentGradeNum = parseInt(mechanic.upgrade2026.replace('G', ''), 10) || 1;
  const startGradeNum = parseInt(mechanic.startGrade.replace('G', ''), 10) || 1;
  const isPromoted = currentGradeNum > startGradeNum;
  const nextTarget = mechanic.nextGradeTarget;
  const gap = mechanic.pointsToNextGrade;

  let readiness = '';
  if (isPromoted) {
    readiness = `Mekanik telah resmi memenuhi kualifikasi poin untuk PROMOSI ke jenjang ${mechanic.upgrade2026}. Performa akumulasi poin melampaui ambang batas minimum.`;
  } else if (gap <= 25) {
    readiness = `Mekanik berada di zona sangat dekat promosi (hanya kekurangan ${gap} poin menuju ${nextTarget}). Peluang promosi terbuka lebar di periode evaluasi mendatang.`;
  } else {
    readiness = `Mekanik saat ini berada di jenjang ${mechanic.upgrade2026} dan membutuhkan ${gap} poin tambahan untuk dapat dipertimbangkan naik ke ${nextTarget}.`;
  }

  const recommendations: string[] = [];
  if (mechanic.certification2026 === 0) {
    recommendations.push(
      'Prioritas Utama: Ikuti evaluasi Ujian Sertifikasi 2026 untuk mengamankan 50–120 poin kelulusan kompetensi teknis.'
    );
  }
  if (mechanic.rank1BmcPoint === 0) {
    recommendations.push(
      'Akselerasi BMC: Tingkatkan pemahaman materi dasar alat berat untuk mengejar predikat Rank 1 di batch kursus berikutnya (+25–50 poin).'
    );
  }
  if (mechanic.bmhPoint === 0) {
    recommendations.push(
      'Kualifikasi Hidrolik (BMH): Ajukan keikutsertaan pelatihan Basic Maintenance Hydraulic/Heavy equipment (+20–40 poin).'
    );
  }
  if (mechanic.qccSsPoint === 0) {
    recommendations.push(
      'Inovasi Lapangan (QCC/SS): Susun ide perbaikan gugus kendali mutu atau sumbang saran perbaikan tools/metode kerja (+15–35 poin).'
    );
  }
  if (recommendations.length === 0) {
    recommendations.push(
      'Pertahankan ritme sertifikasi berkala dan bimbing mekanik junior sebagai bagian dari penilaian leadership teknis.'
    );
  }

  return `📊 **1. Ringkasan Status & Performa Mekanik**
${mechanic.nama} (NIK: ${mechanic.nik}) di site ${mechanic.site} memiliki masa kerja ${mechanic.tenureYears} tahun dengan akumulasi saat ini ${mechanic.currentPoint} poin. Rekam jejak menunjukkan konsistensi di grade ${mechanic.upgrade2026}.

🎯 **2. Analisis Kesiapan Promosi Grade**
${readiness}
- Ambang Poin Saat Ini: ${mechanic.currentPoint} poin
- Target Grade Berikutnya: ${nextTarget} (Kekurangan: ${gap} poin)
- Rekam Jejak Sertifikasi 2026: ${mechanic.certification2026 > 0 ? `Aktif (${mechanic.certification2026} poin)` : 'Belum Terdata'}

🚀 **3. Rekomendasi Rencana Aksi Akselerasi Poin**
${recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

⏱️ **4. Estimasi Timeline Kenaikan Grade**
Dengan asumsi mekanik menuntaskan program sertifikasi dan minimal 1 akselerasi inovasi/kualifikasi hidrolik, target grade ${nextTarget} diproyeksikan dapat tercapai dalam 3 hingga 6 bulan ke depan.`;
}

// Client-side fallback query assistant
export async function queryAiAssistant(
  userQuery: string,
  siteContext: string,
  mechanics: Mechanic[]
): Promise<string> {
  try {
    const res = await fetch('/api/ai/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userQuery,
        siteContext,
        totalRecords: mechanics.length,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.answer) return data.answer;
    }
  } catch (err) {
    console.warn('Backend API unavailable, using resilient local search engine:', err);
  }

  // Local Intelligent Search & Analysis Fallback
  const q = userQuery.toLowerCase();
  const total = mechanics.length;
  const activeCount = mechanics.filter((m) => m.status === 'Active').length;
  const promotedCount = mechanics.filter((m) => m.promosi2026 === 'Promosi').length;

  if (q.includes('promosi') || q.includes('kandidat')) {
    const promoted = mechanics.filter((m) => m.promosi2026 === 'Promosi');
    const top3 = promoted.slice(0, 3).map((m) => `${m.nama} (${m.site}, ${m.currentPoint} pts -> ${m.upgrade2026})`).join(', ');
    return `Berdasarkan database saat ini, terdapat **${promoted.length} mekanik** yang berstatus **Promosi** di periode 2026 (${((promoted.length / total) * 100).toFixed(1)}% dari total mekanik).
Beberapa kandidat teratas antara lain: ${top3}.
Gunakan tombol filter 'Hanya Promosi 26' pada tabel untuk menampilkan daftar lengkapnya.`;
  }

  if (q.includes('sertifikasi') || q.includes('cert')) {
    const certified2026 = mechanics.filter((m) => m.certification2026 > 0);
    const avgCert = Math.round(
      certified2026.reduce((acc, m) => acc + m.certification2026, 0) / (certified2026.length || 1)
    );
    return `Terdapat **${certified2026.length} mekanik** yang telah memiliki poin Certification 2026 dengan rata-rata nilai perolehan **${avgCert} poin**.
Bagi mekanik yang belum terdata, disarankan segera dijadwalkan sesi uji kompetensi teknis di site masing-masing.`;
  }

  return `Database mencatat total **${total} mekanik** (Aktif: ${activeCount}) di site ${siteContext === 'ALL' ? 'seluruh site operasional' : siteContext}.
Terdapat **${promotedCount} kandidat promosi grade** di tahun 2026. Anda dapat menggunakan kolom pencarian dan filter di atas tabel untuk menyaring mekanik berdasarkan site, grade (G1–G7), atau status promosi secara spesifik.`;
}
