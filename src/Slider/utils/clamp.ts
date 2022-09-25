import { closestMultiple } from "./closestMultiple";

export function clamp(min: number, val: number, max: number, step?: number) {
  const clampedValue = Math.max(min, Math.min(val, max));

  if (step && step > 0) {
    const closestValue = closestMultiple(clampedValue - min, step) + min;

    if (closestValue < min) {
      return min;
    }

    if (closestValue > max) {
      return closestValue - Math.abs(step);
    }

    return closestValue;
  }

  return clampedValue;
}
