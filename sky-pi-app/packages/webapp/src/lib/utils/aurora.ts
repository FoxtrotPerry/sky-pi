import { addDays, addHours, parse } from "date-fns";
import type { GeomagneticSeverity, KpForecast } from "~/types/swpc";
import { kpIndexToSeverity } from "~/lib/utils/swpc";
import { utc, UTCDate } from "@date-fns/utc";

export const parseGeomagneticForecast = (text: string) => {
  // Parse the text into a more usable format
  const textLines = text?.split("\n");

  /**
   * Find the start and end of the geomagnetic activity probabilities and kp index forecasts
   */
  let [kpIndexStart, kpDatesLineIdx] = [0, 0];
  for (let i = 0; ; i++) {
    if (textLines?.at(i)?.includes("NOAA Kp index forecast")) {
      kpDatesLineIdx = i + 1;
      kpIndexStart = i + 2;
      break;
    } else if (i >= textLines.length) {
      break;
    }
  }

  const kpIndexLines = textLines.slice(kpIndexStart, -1);

  /**
   * Parse kp values from the text table
   */

  // split each hour range and kp value into an array
  const kpIndexDatesSplit = textLines[kpDatesLineIdx]!.trim().split(/\s{2,}/);

  // parse the dates into Date objects in UTC
  const kpIndexForecastDates = kpIndexDatesSplit.map((dayOfMonth) => {
    const localDate = parse(dayOfMonth, "MMM d", new Date());
    const utcDate = addDays(
      new Date(
        Date.UTC(
          localDate.getFullYear(),
          localDate.getMonth() - 1,
          localDate.getDate(),
        ),
      ),
      1,
    );
    return utcDate;
  });

  // init an array to hold the kp values for each day
  const kpUtcForecasts: KpForecast[][] | undefined = new Array(
    kpIndexForecastDates.length,
  );

  // for every line in the kp index forecast table, parse the kp values
  for (let i = 0; i < kpIndexLines.length; i++) {
    // split the line into an array of hour ranges and kp values
    const [hourRange, ...kpValues] = kpIndexLines[i]!.trim().split(/\s+/);
    // for every kp value, add the kp value and time pairs to each day in the kpUtcForecasts array
    // they belong to
    for (let j = 0; j < kpUtcForecasts.length; j++) {
      const kpValue = kpValues[j];
      if (!kpUtcForecasts[j]) {
        kpUtcForecasts[j] = [];
      }
      const newUtcDate = new Date(
        Date.UTC(
          kpIndexForecastDates[j]!.getFullYear(),
          kpIndexForecastDates[j]!.getMonth() + 1,
          kpIndexForecastDates[j]!.getDate(),
          Number(hourRange!.slice(0, 2)),
        ),
      );
      kpUtcForecasts[j]!.push({
        time: newUtcDate,
        value: Number(kpValue),
        severity: kpIndexToSeverity(Number(kpValue)),
      });
    }
  }

  return kpUtcForecasts;
};

export const parseSpaceForecast = (text: string): KpForecast[][] => {
  // Parse the text into a more usable format
  const textLines = text?.split("\n");

  /**
   * Find the start and end of the geomagnetic activity probabilities and kp index forecasts
   */
  let [kpIndexStart, kpIndexEnd, kpDatesLineIdx] = [0, 0, 0];
  for (let i = 0; ; i++) {
    if (textLines?.at(i)?.includes("NOAA Kp index breakdown")) {
      kpDatesLineIdx = i + 2;
      kpIndexStart = i + 3;
      kpIndexEnd = i + 11;
      break;
    } else if (i >= textLines.length) {
      break;
    }
  }

  const kpIndexLines = textLines.slice(kpIndexStart, kpIndexEnd);

  // split each hour range and kp value into an array
  const kpIndexDatesSplit = textLines[kpDatesLineIdx]!.trim().split(/\s{2,}/);

  // parse the dates into Date objects in UTC
  const kpIndexForecastDates = kpIndexDatesSplit.map((dayOfMonth) => {
    const utcDate = parse(dayOfMonth, "MMM d", new UTCDate());
    return utcDate;
  });

  // init an array to hold the kp values for each day
  const kpUtcForecasts: KpForecast[][] | undefined = new Array(
    kpIndexForecastDates.length,
  );

  // for every line in the kp index forecast table, parse the kp values
  for (let i = 0; i < kpIndexLines.length; i++) {
    // split the line into an array of hour ranges and kp values
    const [hourRange, ...kpValues] = kpIndexLines[i]!.trim().split(/\s{2,}/);
    // for every kp value, add the kp value and time pairs to each day in the kpUtcForecasts array
    // they belong to
    for (let j = 0; j < kpUtcForecasts.length; j++) {
      // split into the kp value and severity, only keeping
      // the kp value
      const kpValue = kpValues[j]?.split(" ")[0];
      // if the array for the day doesn't exist, create it
      if (!kpUtcForecasts[j]) {
        kpUtcForecasts[j] = [];
      }
      const actualUtcDate = addHours(
        utc(kpIndexForecastDates[j]!),
        Number(hourRange!.slice(0, 2)),
      );
      kpUtcForecasts[j]!.push({
        time: actualUtcDate,
        value: Number(kpValue),
        severity: kpIndexToSeverity(Number(kpValue)),
      });
    }
  }

  return kpUtcForecasts;
};

/**
 * Combine multiple normalized geomagnetic forecasts into a single array
 * using the highest kp value for each time interval
 */
export const combineNormalizedForecasts = (
  ...geomagneticForecasts: KpForecast[][][]
): KpForecast[][] => {
  // short circuits
  if (geomagneticForecasts.length === 0) {
    return [];
  }

  if (geomagneticForecasts.length === 1) {
    return geomagneticForecasts[0]!; // nothing to combine
  }

  // combine the forecasts using the highest kp value for each time interval

  const numOfDays = geomagneticForecasts[0]!.length;
  const numOfIntervals = geomagneticForecasts[0]?.[0]?.length ?? 0;
  const combinedForecasts: KpForecast[][] = [];

  for (let day = 0; day < numOfDays; day++) {
    const combinedDayForecasts: KpForecast[] = [];

    for (let interval = 0; interval < numOfIntervals; interval++) {
      let maxKpValue = geomagneticForecasts[0]![day]![interval]!.value;
      let maxSeverity: GeomagneticSeverity =
        geomagneticForecasts[0]![day]![interval]!.severity;

      for (let i = 0; i < geomagneticForecasts.length; i++) {
        const kpForecast = geomagneticForecasts[i]![day]![interval];

        if (kpForecast?.value && kpForecast?.value > maxKpValue) {
          maxKpValue = kpForecast.value;
          maxSeverity = kpForecast.severity;
        }
      }

      combinedDayForecasts.push({
        time: geomagneticForecasts[0]![day]![interval]!.time,
        value: maxKpValue,
        severity: maxSeverity,
      });
    }

    combinedForecasts.push(combinedDayForecasts);
  }

  return combinedForecasts;
};
