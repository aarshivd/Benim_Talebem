import type { RankedResult } from './ranking';

export interface RewardRule {
  id: string;
  scope: 'daily' | 'term';
  kind: 'points' | 'rank';
  targetPoints: number | null;
  rankTop: number | null;
}

export function evaluateRewards(
  rewards: RewardRule[],
  rankedRows: RankedResult[],
  scope: 'daily' | 'term'
): Record<string, string[]> {
  const results: Record<string, string[]> = {};
  
  for (const row of rankedRows) {
    results[row.studentId] = [];
  }

  const applicableRewards = rewards.filter(r => r.scope === scope);

  for (const row of rankedRows) {
    if (row.points <= 0) continue;

    for (const reward of applicableRewards) {
      if (reward.kind === 'points' && reward.targetPoints !== null) {
        if (row.points >= reward.targetPoints) {
          results[row.studentId].push(reward.id);
        }
      } else if (reward.kind === 'rank' && reward.rankTop !== null && row.rank !== null) {
        if (row.rank <= reward.rankTop) {
          results[row.studentId].push(reward.id);
        }
      }
    }
  }

  return results;
}
