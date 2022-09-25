export function closestMultiple(value: number, step: number) {
  const signedStep = value < 0 ? Math.abs(step) * -1 : Math.abs(step);

  if (value === 0) {
    return 0;
  }

  return value + signedStep / 2 - ((value + signedStep / 2) % signedStep);
}
