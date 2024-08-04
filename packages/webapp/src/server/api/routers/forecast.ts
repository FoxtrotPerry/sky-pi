import axios from "axios";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  type PointMetadataResp,
  type GridpointForecastResp,
  zGridpointForecastParams,
  type GridpointForecastParams,
  type NWSDataPoint,
} from "~/types/forecast";
import type {
  MoonPhaseCycle,
  MoonPhaseData,
  RawMoonPhaseData,
} from "~/types/moonphase";
import type { GeoData } from "~/types/ip";
import { getDateTransformer } from "~/lib/utils/date";
import { toZonedTime } from "date-fns-tz";
import {
  isBefore,
  differenceInCalendarDays,
  addHours,
  getHours,
  startOfDay,
} from "date-fns";
import { Temporal } from "temporal-polyfill";

export const forecastRouter = createTRPCRouter({
  getLocalSkyCover: publicProcedure
    .input(zGridpointForecastParams)
    .query(async ({ input }) => {
      const localNow = toZonedTime(new Date(), input.timeZone);
      const startOfToday = startOfDay(localNow);
      const localTimeForecast = await axios.get<GridpointForecastResp>(
        `https://api.weather.gov/gridpoints/${input.wfo}/${input.gridX},${input.gridY}`,
        {
          transformResponse: getDateTransformer(input.timeZone),
        },
      );
      const skyCover = localTimeForecast.data.properties.skyCover.values;
      // matrix comprised of forecast data for each day. each elem is
      // an array of that day's forecasts.
      const lastSkyCoverDate = skyCover.at(-1)?.validTime.date;
      const firstSkyCoverDate = skyCover.at(0)?.validTime.date;
      if (!firstSkyCoverDate || !lastSkyCoverDate) return [];
      const skyCoverByDay: NWSDataPoint[][] = [[]] as NWSDataPoint[][];
      // ISO8601 Duration encoding for a one hour duration
      const oneHourIsoDuration = "PT1H";
      for (let i = 0; i < skyCover.length; i++) {
        const forecastTime = skyCover[i]?.validTime.date;
        const duration = Temporal.Duration.from(
          skyCover[i]?.validTime.duration ?? oneHourIsoDuration,
        );
        // if the forecase doesn't have a time or the time is before
        // the start of today, then skip this data point.
        if (!forecastTime || isBefore(forecastTime, startOfToday)) continue;
        // figure out which day index to insert the forecast into
        const dayDiff = differenceInCalendarDays(forecastTime, startOfToday);

        const newSkyCoverItems = [skyCover[i]];

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
            value: skyCover[i]?.value ?? null,
            validTime: { date: newDate, duration: oneHourIsoDuration },
          };
          if (getHours(newDate) > getHours(forecastTime)) {
            newSkyCoverItems.push(newEntry);
          } else {
            // initialize the next day's array before pushing
            if (skyCoverByDay[dayDiff + 1] === undefined) {
              skyCoverByDay[dayDiff + 1] = [];
            }
            skyCoverByDay[dayDiff + 1]?.push(newEntry);
          }
        }

        // if the day array we're about to insert into doesn't exist yet,
        if (skyCoverByDay?.at(dayDiff) === undefined) {
          // then assign our new array elems to it
          skyCoverByDay[dayDiff] = newSkyCoverItems;
        } else {
          // otherwise, push the new array elems to what already exists there
          skyCoverByDay[dayDiff]?.push(...newSkyCoverItems);
        }
      }

      return skyCoverByDay.filter((dayForecasts) => !!dayForecasts);
    }),

  getMoonPhases: publicProcedure.query(async () => {
    const now = new Date();
    const params = new URLSearchParams([
      ["date", `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`],
      ["nump", "4"],
    ]);
    const phasesResp = await axios.get<RawMoonPhaseData>(
      `https://aa.usno.navy.mil/api/moon/phases/date?${params.toString()}`,
    );

    const moonPhaseCycle: MoonPhaseCycle = {};
    phasesResp.data.phasedata.forEach((phase) => {
      const phaseName = phase.phase;
      const [hoursStr, minutesStr] = phase.time.split(":");
      const phaseTime = new Date(
        Date.UTC(
          phase.year,
          phase.month - 1,
          phase.day,
          Number(hoursStr),
          Number(minutesStr),
        ),
      );
      const phaseData: MoonPhaseData = {
        date: phaseTime,
        name: phaseName,
      };

      if (phaseName === "First Quarter") {
        moonPhaseCycle.firstQuarter = phaseData;
      } else if (phaseName === "Full Moon") {
        moonPhaseCycle.fullMoon = phaseData;
      } else if (phaseName === "Last Quarter") {
        moonPhaseCycle.lastQuarter = phaseData;
      } else if (phaseName === "New Moon") {
        moonPhaseCycle.newMoon = phaseData;
      }
    });

    return moonPhaseCycle;
  }),

  getGeoData: publicProcedure.query(async () => {
    const { data: ipData } = await axios.get<{ ip: string }>(
      "https://api.ipify.org?format=json",
    );
    const { data: geoData } = await axios.get<GeoData>(
      `https://ipwho.is/${ipData.ip}`,
    );
    const { data: nwsData } = await axios.get<PointMetadataResp>(
      `https://api.weather.gov/points/${geoData.latitude},${geoData.longitude}`,
    );
    const { gridId, gridX, gridY, timeZone } = nwsData.properties;
    return {
      wfo: gridId,
      gridX,
      gridY,
      timeZone,
    } satisfies GridpointForecastParams;
  }),
});
