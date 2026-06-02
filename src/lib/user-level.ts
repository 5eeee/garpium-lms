export function userLevelFromPoints(points: number) {
  return Math.max(1, Math.floor(points / 100) + 1);
}

export function userLevelTitle(level: number) {
  if (level >= 10) return "Эксперт";
  if (level >= 5) return "Профи";
  if (level >= 3) return "Практик";
  return "Новичок";
}
