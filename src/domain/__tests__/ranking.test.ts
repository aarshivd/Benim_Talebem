import { rankStudents } from '../ranking';

describe('Domain: ranking', () => {
  it('returns empty array for empty input', () => {
    expect(rankStudents([])).toEqual([]);
  });

  it('ranks students correctly with ties and skips ranks', () => {
    const rows = [
      { studentId: '4', name: 'D', points: 5, pages: 10 },
      { studentId: '1', name: 'A', points: 10, pages: 20 },
      { studentId: '2', name: 'B', points: 8, pages: 15 },
      { studentId: '3', name: 'C', points: 8, pages: 15 },
    ];

    const result = rankStudents(rows);
    
    expect(result).toEqual([
      { studentId: '1', name: 'A', points: 10, pages: 20, rank: 1 },
      { studentId: '2', name: 'B', points: 8, pages: 15, rank: 2 },
      { studentId: '3', name: 'C', points: 8, pages: 15, rank: 2 },
      { studentId: '4', name: 'D', points: 5, pages: 10, rank: 4 },
    ]);
  });

  it('sorts by pages when points are equal', () => {
    const rows = [
      { studentId: '1', name: 'A', points: 8, pages: 10 },
      { studentId: '2', name: 'B', points: 8, pages: 20 },
    ];

    const result = rankStudents(rows);
    
    expect(result).toEqual([
      { studentId: '2', name: 'B', points: 8, pages: 20, rank: 1 },
      { studentId: '1', name: 'A', points: 8, pages: 10, rank: 1 },
    ]);
  });

  it('sorts by name (Turkish) when points and pages are equal', () => {
    const rows = [
      { studentId: '1', name: 'Şamil', points: 8, pages: 10 },
      { studentId: '2', name: 'Cemal', points: 8, pages: 10 },
      { studentId: '3', name: 'Çetin', points: 8, pages: 10 },
    ];

    const result = rankStudents(rows);
    
    // In Turkish, C comes before Ç, and S comes before Ş.
    // C, Ç, S, Ş.
    expect(result.map(r => r.name)).toEqual(['Cemal', 'Çetin', 'Şamil']);
    expect(result.map(r => r.rank)).toEqual([1, 1, 1]);
  });

  it('assigns null rank to students with 0 points and places them at the bottom', () => {
    const rows = [
      { studentId: '1', name: 'A', points: 0, pages: 10 },
      { studentId: '2', name: 'B', points: 5, pages: 10 },
      { studentId: '3', name: 'C', points: 0, pages: 20 },
    ];

    const result = rankStudents(rows);
    
    expect(result).toEqual([
      { studentId: '2', name: 'B', points: 5, pages: 10, rank: 1 },
      // Between 0 points, the one with more pages is placed higher
      { studentId: '3', name: 'C', points: 0, pages: 20, rank: null },
      { studentId: '1', name: 'A', points: 0, pages: 10, rank: null },
    ]);
  });

  it('handles a single student', () => {
    const rows = [
      { studentId: '1', name: 'A', points: 10, pages: 10 },
    ];
    expect(rankStudents(rows)).toEqual([{ studentId: '1', name: 'A', points: 10, pages: 10, rank: 1 }]);
  });
});
