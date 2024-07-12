import { clamp } from "./math";

/**
 * Takes a percentage value and returns the closest tailwind
 * color shade integer representation
 * @param percentage Number between 0 - 100
 * @returns Returns a valid tailwind color shade integer
 *
 * @see https://tailwindcss.com/docs/customizing-colors
 */
export const percentToSkyShade = (percentage: number): number => {
  return clamp(Math.round((100 - percentage) / 10) * 100, 50, 950);
};
