import { evaluateRewards, type RewardRule } from '../rewards';
import type { RankedResult } from '../ranking';

describe('Domain: rewards', () => {
  it('assigns points reward correctly (inclusive bounds)', () => {
    const rewards: RewardRule[] = [
      { id: 'r1', scope: 'daily', kind: 'points', targetPoints: 10, rankTop: null },
    ];
    
    const rows: RankedResult[] = [
      { studentId: '1', name: 'A', points: 10, pages: 10, rank: 1 },
      { studentId: '2', name: 'B', points: 9, pages: 10, rank: 2 },
    ];

    const result = evaluateRewards(rewards, rows, 'daily');
    
    expect(result['1']).toEqual(['r1']); // exact boundary
    expect(result['2']).toEqual([]);
  });

  it('assigns rank reward correctly and handles ties', () => {
    const rewards: RewardRule[] = [
      { id: 'r1', scope: 'term', kind: 'rank', targetPoints: null, rankTop: 3 },
    ];
    
    const rows: RankedResult[] = [
      { studentId: '1', name: 'A', points: 10, pages: 10, rank: 1 },
      { studentId: '2', name: 'B', points: 8, pages: 10, rank: 2 },
      { studentId: '3', name: 'C', points: 8, pages: 10, rank: 2 },
      { studentId: '4', name: 'D', points: 5, pages: 10, rank: 4 },
    ];

    const result = evaluateRewards(rewards, rows, 'term');
    
    expect(result['1']).toEqual(['r1']); // rank 1
    expect(result['2']).toEqual(['r1']); // rank 2
    expect(result['3']).toEqual(['r1']); // rank 2
    expect(result['4']).toEqual([]);     // rank 4 (missed top 3)
  });

  it('does not give rewards for 0 points', () => {
    const rewards: RewardRule[] = [
      { id: 'r1', scope: 'daily', kind: 'points', targetPoints: 0, rankTop: null }, // threshold is 0
      { id: 'r2', scope: 'daily', kind: 'rank', targetPoints: null, rankTop: 1 },
    ];
    
    const rows: RankedResult[] = [
      { studentId: '1', name: 'A', points: 0, pages: 10, rank: null },
    ];

    const result = evaluateRewards(rewards, rows, 'daily');
    
    expect(result['1']).toEqual([]); // 0 points -> no reward
  });

  it('filters rewards by scope', () => {
    const rewards: RewardRule[] = [
      { id: 'r1', scope: 'daily', kind: 'points', targetPoints: 5, rankTop: null },
      { id: 'r2', scope: 'term', kind: 'points', targetPoints: 5, rankTop: null },
    ];
    
    const rows: RankedResult[] = [
      { studentId: '1', name: 'A', points: 10, pages: 10, rank: 1 },
    ];

    const resultDaily = evaluateRewards(rewards, rows, 'daily');
    expect(resultDaily['1']).toEqual(['r1']);

    const resultTerm = evaluateRewards(rewards, rows, 'term');
    expect(resultTerm['1']).toEqual(['r2']);
  });
});
