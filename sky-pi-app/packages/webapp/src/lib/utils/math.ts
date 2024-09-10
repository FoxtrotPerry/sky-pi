export const clamp = (num: number, lower: number, upper: number) => {
  if (num > upper) return upper;
  if (num < lower) return lower;
  return num;
};

export const toFahrenheit = (celciusTemp: number) => {
  return Math.round(celciusTemp * 1.8 + 32);
};
