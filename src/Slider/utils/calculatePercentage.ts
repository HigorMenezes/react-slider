export function calculatePercentage(value: number, min: number, max: number) {
  if (value <= min) {
    return 0;
  }
  if (value >= max || max - min === 0) {
    return 1;
  }

  return Math.abs(value - min) / Math.abs(max - min);
}
