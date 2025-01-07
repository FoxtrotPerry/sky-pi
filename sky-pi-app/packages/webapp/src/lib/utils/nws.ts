import {
  addHours,
  differenceInCalendarDays,
  isBefore,
  startOfDay,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Temporal } from "temporal-polyfill";
import type { NWSDataPoint } from "~/types/forecast";

// ISO8601 Duration encoding for a one hour duration
const oneHourIsoDuration = "PT1H";

/**
 * Takes in [`NWSDataPoint[]`](../../types/forecast.ts) and returns a matrix containing a forecast value for each hour of
 * each day.
 *
 * **NOTE: Durations are broken up to ensure each hour has it's own forecast data point.**
 */
export const dataPointsToDays = (
  nwsDataPoints: NWSDataPoint[],
  timezone: string,
) => {
  /**
   * Step 1: Break down durations in the data points into hour by hour data
   */
  let extrapolatedData: NWSDataPoint[] = [];

  for (let i = 0; i < nwsDataPoints.length; i++) {
    const dataPoint = nwsDataPoints[i];
    if (dataPoint === undefined) {
      continue;
    }
    const duration = Temporal.Duration.from(
      dataPoint.validTime.duration ?? oneHourIsoDuration,
    );
    const infillData: NWSDataPoint[] = [];

    const hoursInDuration = duration.hours + duration.days * 24;

    // for every hour past 1 the duration covers, add to the infillData
    // that many entries
    for (let j = 1; j < hoursInDuration; j++) {
      const infillEntry: NWSDataPoint = {
        ...dataPoint,
        validTime: {
          date: addHours(dataPoint.validTime.date, j),
        },
      };
      infillData.push(infillEntry);
    }
    extrapolatedData = extrapolatedData.concat(dataPoint).concat(infillData);
  }

  /*
   * Step 2: Take the extrapolated data and group it by days
   */
  const localNow = toZonedTime(new Date(), timezone);
  const startOfToday = startOfDay(localNow);

  const dataGroupedByDay: NWSDataPoint[][] = [[]];

  for (let i = 0; i < extrapolatedData.length; i++) {
    const dataPoint = extrapolatedData[i];
    if (!dataPoint) {
      continue;
    }
    const forecastTime = dataPoint.validTime.date;
    const dayDiff = differenceInCalendarDays(forecastTime, startOfToday);
    if (typeof dataGroupedByDay[dayDiff] === "undefined") {
      dataGroupedByDay[dayDiff] = [dataPoint];
    } else {
      dataGroupedByDay[dayDiff].push(dataPoint);
    }
  }

  /*
   * Step 3: Ensure we're not returning data from yesterday
   */

  if (isBefore(dataGroupedByDay[0]![0]!.validTime.date, startOfToday)) {
    return dataGroupedByDay.slice(1);
  } else {
    return dataGroupedByDay;
  }
};
