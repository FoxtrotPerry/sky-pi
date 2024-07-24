export const clamp = (num: number, lower: number, upper: number) => {
  if (num > upper) return upper;
  if (num < lower) return lower;
  return num;
};
