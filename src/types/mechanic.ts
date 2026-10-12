export interface Mechanic {
  no: number;
  nik: string;
  nama: string;
  site: string;
  doh: string; // YYYY-MM-DD
  tenureYears: number;
  startGrade: string; // G1 - G7
  startPoint: number;
  status: 'Active' | 'In Active';
  // Acceleration points
  masaKerjaPoint: number;
  rank1BmcPoint: number;
  bmhPoint: number;
  qccSsPoint: number;
  // Certification by year
  certification2024: number; // Point for 2024
  certification2025: number; // Point for 2025
  certification2026: number; // Point for 2026
  // Period 2024-2025 summary
  totalCert2024_2025: number;
  currentPoint2025: number; // Accumulated point at end of 2024-2025
  grade2025: string; // Grade achieved in 2024-2025
  promosi2025: string; // 'Promosi' | '-'
  // Period 2026 summary
  totalAccelerationPoint: number;
  currentPoint: number; // Current Point 2026
  upgrade2026: string; // G1 - G7
  promosi2026: string; // 'Promosi' | '-'
  nextGradeTarget: string;
  pointsToNextGrade: number;
  gradeProgressPercent: number;
}

export interface SiteSummary {
  site: string;
  totalMechanics: number;
  activeCount: number;
  promotedCount: number;
  totalCurrentPoints: number;
  avgCurrentPoints: number;
  // Breakdown sums
  totalMasaKerja: number;
  totalRank1Bmc: number;
  totalBmh: number;
  totalQccSs: number;
  totalCert2024: number;
  totalCert2025: number;
  totalCert2026: number;
  // Averages
  avgMasaKerja: number;
  avgRank1Bmc: number;
  avgBmh: number;
  avgQccSs: number;
  avgCert2024: number;
  avgCert2025: number;
  avgCert2026: number;
  // Grades
  gradeCounts: Record<string, number>;
}

export interface GradeThreshold {
  grade: string;
  minPoint: number;
  maxPoint: number;
  rangeText: string;
  color: string;
}

export const GRADE_THRESHOLDS: GradeThreshold[] = [
  { grade: 'G1', minPoint: 0, maxPoint: 120, rangeText: '0 ~ 120', color: '#64748B' },
  { grade: 'G2', minPoint: 121, maxPoint: 260, rangeText: '121 ~ 260', color: '#0284C7' },
  { grade: 'G3', minPoint: 261, maxPoint: 430, rangeText: '261 ~ 430', color: '#0D9488' },
  { grade: 'G4', minPoint: 431, maxPoint: 630, rangeText: '431 ~ 630', color: '#D97706' },
  { grade: 'G5', minPoint: 631, maxPoint: 870, rangeText: '631 ~ 870', color: '#E11D48' },
  { grade: 'G6', minPoint: 871, maxPoint: 1150, rangeText: '871 ~ 1150', color: '#7C3AED' },
  { grade: 'G7', minPoint: 1151, maxPoint: 9999, rangeText: '1151 ~ Up', color: '#4F46E5' },
];

export function calculateGrade(points: number): string {
  for (let i = GRADE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= GRADE_THRESHOLDS[i].minPoint) {
      return GRADE_THRESHOLDS[i].grade;
    }
  }
  return 'G1';
}

export function getNextGradeInfo(currentPoint: number): { nextGrade: string; pointsNeeded: number; percent: number } {
  const currentGrade = calculateGrade(currentPoint);
  const currentIndex = GRADE_THRESHOLDS.findIndex(g => g.grade === currentGrade);
  
  if (currentIndex === GRADE_THRESHOLDS.length - 1) {
    return { nextGrade: 'MAX (G7)', pointsNeeded: 0, percent: 100 };
  }
  
  const currentConfig = GRADE_THRESHOLDS[currentIndex];
  const nextConfig = GRADE_THRESHOLDS[currentIndex + 1];
  
  const span = nextConfig.minPoint - currentConfig.minPoint;
  const progressInGrade = Math.max(0, currentPoint - currentConfig.minPoint);
  const percent = Math.min(100, Math.round((progressInGrade / span) * 100));
  const pointsNeeded = Math.max(0, nextConfig.minPoint - currentPoint);
  
  return {
    nextGrade: nextConfig.grade,
    pointsNeeded,
    percent
  };
}
