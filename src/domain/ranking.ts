export interface RankedRow {
  studentId: string;
  name: string;
  points: number;
  pages: number;
}

export interface RankedResult extends RankedRow {
  rank: number | null;
}

export function rankStudents(rows: RankedRow[]): RankedResult[] {
  if (rows.length === 0) return [];

  const sorted = [...rows].sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;
    if (a.pages !== b.pages) return b.pages - a.pages;
    return a.name.localeCompare(b.name, 'tr-TR', { sensitivity: 'base' });
  });

  const results: RankedResult[] = [];
  let currentRank = 1;

  for (let i = 0; i < sorted.length; i++) {
    const row = sorted[i];
    
    if (row.points <= 0) {
      results.push({ ...row, rank: null });
      continue;
    }

    if (i > 0) {
      const prev = sorted[i - 1];
      if (prev.points !== row.points) {
        currentRank = i + 1;
      }
    }

    results.push({ ...row, rank: currentRank });
  }

  return results;
}
