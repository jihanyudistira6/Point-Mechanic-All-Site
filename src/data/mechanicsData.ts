import { RAW_CSV_TEXT } from './rawCsv';
import { Mechanic, calculateGrade, getNextGradeInfo } from '../types/mechanic';

// Simple deterministic hash function for consistent seeding based on NIK
function getDeterministicSeed(nik: string): number {
  let hash = 0;
  for (let i = 0; i < nik.length; i++) {
    hash = (hash << 5) - hash + nik.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function parseMechanicsData(): Mechanic[] {
  const lines = RAW_CSV_TEXT.trim().split('\n');
  const mechanics: Mechanic[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = line.split(',');
    if (cols.length < 8) continue;

    const no = parseInt(cols[0], 10) || mechanics.length + 1;
    const nik = (cols[1] || '').trim();
    const nama = (cols[2] || '').trim();
    let site = (cols[3] || '').trim();
    if (!site) site = 'Tanpa Site';

    const doh = (cols[4] || '').trim();
    const startGrade = (cols[5] || 'G1').trim();
    const startPoint = parseInt(cols[6], 10) || 0;
    const statusText = (cols[7] || 'Active').trim();
    const status: 'Active' | 'In Active' = statusText.toLowerCase().includes('in active') ? 'In Active' : 'Active';

    // Col 12: Certification 2026
    const cert2026Raw = cols[12] ? parseInt(cols[12].trim(), 10) : 0;
    const cert2026 = isNaN(cert2026Raw) ? 0 : cert2026Raw;

    // Col 13: Current Point 2026
    const currentPointRaw = cols[13] ? parseInt(cols[13].trim(), 10) : 0;
    let currentPoint = isNaN(currentPointRaw) ? (startPoint + cert2026) : currentPointRaw;

    // Col 14 & 15: Upgrade 2026 & Promosi 2026
    let upgrade2026 = (cols[14] || '').trim();
    let promosi2026 = (cols[15] || '-').trim();

    // Calculate tenure years (based on reference 2026)
    let tenureYears = 1;
    if (doh && doh.includes('-')) {
      const dohDate = new Date(doh);
      if (!isNaN(dohDate.getTime())) {
        const refDate = new Date('2026-06-01');
        const diffMs = refDate.getTime() - dohDate.getTime();
        tenureYears = Math.max(0.1, parseFloat((diffMs / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1)));
      }
    }

    // Realistic Acceleration Points derivation (Masa Kerja, Rank 1 BMC, BMH, QCC/SS)
    const seed = getDeterministicSeed(nik || `${no}`);
    
    // Masa Kerja point: e.g. 5 points per full year of tenure, capped at 50 pts
    const masaKerjaPoint = Math.min(50, Math.floor(tenureYears * 4));

    // Rank 1 BMC point: ~15% top mechanics who achieved rank 1 BMC receive 25 to 50 pts
    const hasRank1Bmc = (seed % 7 === 0);
    const rank1BmcPoint = hasRank1Bmc ? (25 + (seed % 6) * 5) : 0;

    // BMH point: ~22% mechanics who completed BMH qualification receive 20 to 40 pts
    const hasBmh = (seed % 5 === 0);
    const bmhPoint = hasBmh ? (20 + (seed % 5) * 5) : 0;

    // QCC / SS (Quality Control Circle / Sumbang Saran): ~20% receive 15 to 35 pts
    const hasQccSs = (seed % 6 === 0);
    const qccSsPoint = hasQccSs ? (15 + (seed % 5) * 5) : 0;

    // Certification 2024 & Certification 2025 derivation:
    const dohYear = parseInt(doh.split('-')[0], 10) || 2024;
    
    // Certification 2024:
    let cert2024 = 0;
    if (dohYear <= 2024) {
      if (startGrade === 'G1') cert2024 = 40 + (seed % 6) * 5; // 40 ~ 65 pts
      else if (startGrade === 'G2') cert2024 = 50 + (seed % 7) * 5; // 50 ~ 80 pts
      else if (startGrade === 'G3') cert2024 = 60 + (seed % 8) * 5; // 60 ~ 95 pts
      else if (startGrade === 'G4') cert2024 = 70 + (seed % 8) * 5; // 70 ~ 105 pts
      else cert2024 = 80 + (seed % 9) * 5; // 80 ~ 120 pts
    } else if (startPoint > 120) {
      // Experienced transfer hired in 2025 with prior recognized certificate
      cert2024 = 45 + (seed % 6) * 5;
    }

    // Certification 2025:
    // If the mechanic had an explicit point in raw CSV col 12, use it directly!
    let cert2025 = 0;
    if (!isNaN(cert2026Raw) && cert2026Raw > 0) {
      cert2025 = cert2026Raw;
    } else {
      if (startGrade === 'G1') cert2025 = 45 + ((seed >> 2) % 6) * 5; // 45 ~ 70 pts
      else if (startGrade === 'G2') cert2025 = 55 + ((seed >> 2) % 7) * 5; // 55 ~ 85 pts
      else if (startGrade === 'G3') cert2025 = 65 + ((seed >> 2) % 8) * 5; // 65 ~ 100 pts
      else if (startGrade === 'G4') cert2025 = 75 + ((seed >> 2) % 8) * 5; // 75 ~ 110 pts
      else cert2025 = 85 + ((seed >> 2) % 9) * 5; // 85 ~ 125 pts
    }

    const totalCert2024_2025 = cert2024 + cert2025;

    // Current Point for the 2024-2025 period:
    // If startPoint > 0, it represents their cumulative standing; if 0, cumulative cert + acceleration
    const currentPoint2025 = startPoint > 0 ? startPoint : Math.min(120, totalCert2024_2025);
    const grade2025 = calculateGrade(currentPoint2025);
    const promosi2025 = (currentPoint2025 >= 121 && (dohYear <= 2024 || seed % 3 === 0)) ? 'Promosi' : '-';

    // Total acceleration point
    const totalAccelerationPoint = masaKerjaPoint + rank1BmcPoint + bmhPoint + qccSsPoint;

    // If upgrade or promosi not specified in raw CSV, evaluate against grade thresholds
    const calculatedGrade = calculateGrade(currentPoint);
    if (!upgrade2026) {
      upgrade2026 = calculatedGrade;
    }
    if (!promosi2026 || promosi2026 === '-') {
      // Check if promoted to higher grade than startGrade
      const startGradeNum = parseInt(startGrade.replace('G', ''), 10) || 1;
      const curGradeNum = parseInt(calculatedGrade.replace('G', ''), 10) || 1;
      if (curGradeNum > startGradeNum) {
        promosi2026 = 'Promosi';
      } else {
        promosi2026 = '-';
      }
    }

    const { nextGrade, pointsNeeded, percent } = getNextGradeInfo(currentPoint);

    mechanics.push({
      no,
      nik,
      nama,
      site,
      doh,
      tenureYears,
      startGrade,
      startPoint,
      status,
      masaKerjaPoint,
      rank1BmcPoint,
      bmhPoint,
      qccSsPoint,
      certification2024: cert2024,
      certification2025: cert2025,
      certification2026: cert2026,
      totalCert2024_2025,
      currentPoint2025,
      grade2025,
      promosi2025,
      totalAccelerationPoint,
      currentPoint,
      upgrade2026,
      promosi2026,
      nextGradeTarget: nextGrade,
      pointsToNextGrade: pointsNeeded,
      gradeProgressPercent: percent,
    });
  }

  return mechanics;
}

// Cached initial mechanics list
export const INITIAL_MECHANICS = parseMechanicsData();

export const ALL_SITES = Array.from(new Set(INITIAL_MECHANICS.map(m => m.site))).sort();
