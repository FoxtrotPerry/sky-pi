import { toZonedTime } from "date-fns-tz";
import type { GeomagneticSeverity, KpForecast } from "~/types/swpc";
import type { DailyScales } from "~/types/swpcScales";

export const kpIndexToSeverity = (kp: number): GeomagneticSeverity => {
  if (kp >= 9) return { text: "Extreme", scale: "G5" };
  if (kp >= 8) return { text: "Severe", scale: "G4" };
  if (kp >= 7) return { text: "Strong", scale: "G3" };
  if (kp >= 6) return { text: "Moderate", scale: "G2" };
  if (kp >= 5) return { text: "Minor", scale: "G1" };
  return { text: "Active", scale: "G0" };
};

export const getMaxKpForecast = (forecasts: KpForecast[]) => {
  let maxKpForecast = forecasts[0];
  for (let i = 1; i < forecasts.length; i++) {
    const forecast = forecasts[i];
    if (forecast && forecast.value > maxKpForecast!.value) {
      maxKpForecast = forecasts[i];
    }
  }
  return maxKpForecast;
};

export const datePartsToDate = (
  dateStamp: DailyScales["DateStamp"],
  timeStamp: DailyScales["TimeStamp"],
) => {
  const [year, month, day] = dateStamp.split("-").map(Number);
  const [hour, minute, second] = timeStamp.split(":").map(Number);
  return toZonedTime(
    new Date(year!, month! - 1, day, hour, minute, second),
    "America/New_York",
  );
};
