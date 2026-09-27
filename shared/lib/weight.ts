export const LBS_PER_KG = 2.2046226218;

export function kgToLbs(kg: number): number {
  return kg * LBS_PER_KG;
}

export function lbsToKg(lbs: number): number {
  return lbs / LBS_PER_KG;
}

export function roundWeight(value: number): number {
  return Math.round(value * 10) / 10;
}

export function formatWeight(value: number): string {
  const rounded = roundWeight(value);

  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
