import {
  addHours,
  differenceInCalendarDays,
  getHours,
  isBefore,
  startOfDay,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Temporal } from "temporal-polyfill";
import { NWSDataPoint } from "~/types/forecast";

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
  // ISO8601 Duration encoding for a one hour duration
  const oneHourIsoDuration = "PT1H";
  // matrix comprised of forecast data for each day. each elem is
  // an array of that day's forecasts.
  const nwsDataPointsByDay: NWSDataPoint[][] = [[]] as NWSDataPoint[][];

  const localNow = toZonedTime(new Date(), timezone);
  const startOfToday = startOfDay(localNow);

  for (let i = 0; i < nwsDataPoints.length; i++) {
    const forecastTime = nwsDataPoints[i]?.validTime.date;
    const duration = Temporal.Duration.from(
      nwsDataPoints[i]?.validTime.duration ?? oneHourIsoDuration,
    );
    // if the forecast doesn't have a time or the time is before
    // the start of today, then skip this data point.
    if (forecastTime === undefined || isBefore(forecastTime, startOfToday))
      continue;
    // figure out which day index to insert the forecast into
    const dayDiff = differenceInCalendarDays(forecastTime, startOfToday);

    const newNWSDataPointItems = [nwsDataPoints[i]];

    /**
     * If the forecast data point's duration is more than one hour, then add a copy
     * of the data point for every hour the duration is over.
     *
     * We deconstruct these durations so that for every day we have full data coverage
     * of, we are ensured 24 elements in that day's array.
     */
    for (let j = 1; j < duration.hours; j++) {
      const newDate = addHours(forecastTime, j);
      const newEntry: NWSDataPoint = {
        value: nwsDataPoints[i]?.value ?? null,
        validTime: { date: newDate, duration: oneHourIsoDuration },
      };
      if (getHours(newDate) > getHours(forecastTime)) {
        newNWSDataPointItems.push(newEntry);
      } else {
        // initialize the next day's array before pushing
        if (nwsDataPointsByDay[dayDiff + 1] === undefined) {
          nwsDataPointsByDay[dayDiff + 1] = [];
        }
        nwsDataPointsByDay[dayDiff + 1]?.push(newEntry);
      }
    }

    // if the day array we're about to insert into doesn't exist yet,
    if (nwsDataPointsByDay?.at(dayDiff) === undefined) {
      // then assign our new array elems to it
      nwsDataPointsByDay[dayDiff] = newNWSDataPointItems;
    } else {
      // otherwise, push the new array elems to what already exists there
      nwsDataPointsByDay[dayDiff]?.push(...newNWSDataPointItems);
    }
  }

  return nwsDataPointsByDay;
};
