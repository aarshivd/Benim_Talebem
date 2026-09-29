export function calcReadingPoints(params: {
  dailyPages: number;
  pagesPerPoint: number;
  goalPages: number;
  goalBonus: number;
}): number {
  const { dailyPages, pagesPerPoint, goalPages, goalBonus } = params;
  if (dailyPages <= 0 || pagesPerPoint <= 0) return 0;
  
  let points = Math.floor(dailyPages / pagesPerPoint);
  
  if (goalPages > 0 && dailyPages >= goalPages) {
    points += Math.max(0, goalBonus);
  }
  
  return points;
}

export function validateManualPoints(params: {
  points: number;
  allowNegative: boolean;
}): boolean {
  if (params.points === 0) return false;
  if (!params.allowNegative && params.points < 0) return false;
  return true;
}
