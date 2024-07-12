import axios from "axios";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  type PointMetadataResp,
  type GridpointForecastResp,
  zGridpointForecastParams,
  type GridpointForecastParams,
  type NWSDataPoint,
} from "~/types/forecast";
import type { MoonPhaseData } from "~/types/moonphase";
import type { GeoData } from "~/types/ip";
import { getDateTransformer } from "~/lib/utils/date";
import { toZonedTime } from "date-fns-tz";
import {
  isBefore,
  subHours,
  differenceInCalendarDays,
  addHours,
} from "date-fns";
import { Temporal } from "temporal-polyfill";

export const forecastRouter = createTRPCRouter({
  getForecast: publicProcedure
    .input(zGridpointForecastParams)
    .query(async ({ input }) => {
      return axios.get<GridpointForecastResp>(
        `https://api.weather.gov/gridpoints/${input.wfo}/${input.gridX},${input.gridY}`,
        {
          transformResponse: getDateTransformer(input.timeZone),
        },
      );
    }),

  getLocalSkycover: publicProcedure
    .input(zGridpointForecastParams)
    .query(async ({ input }) => {
      const localNow = toZonedTime(new Date(), input.timeZone);
      const timeOneHourAgo = subHours(localNow, 1);
      const localTimeForecast = await axios.get<GridpointForecastResp>(
        `https://api.weather.gov/gridpoints/${input.wfo}/${input.gridX},${input.gridY}`,
        {
          transformResponse: getDateTransformer(input.timeZone),
        },
      );
      const skyCover = localTimeForecast.data.properties.skyCover.values;
      // matrix comprised of forecast data for each day. each elem is
      // an array of that day's forecasts.
      const skyCoverByDay: NWSDataPoint[][] = [];
      // ISO8601 Duration encoding for a one hour duration
      const oneHourIsoDuration = "PT1H";
      for (let i = 0; i < skyCover.length; i++) {
        const forecastTime = skyCover[i]?.validTime.date;
        const duration = Temporal.Duration.from(
          skyCover[i]?.validTime.duration ?? oneHourIsoDuration,
        );
        if (!forecastTime || isBefore(forecastTime, timeOneHourAgo)) continue;
        const newSkyCoverItems = [skyCover[i]];
        // if the duration lasts for more than one hour, then duplicate this forecast
        // to fill in the data gaps
        if (duration.hours > 1) {
          console.log(
            `Long duration on ${forecastTime.toDateString()}: ${duration.hours}`,
          );
        }
        // FIXME: Figure out a way to ensure that each day array in the `skyCoverByDay`
        // matrix has 24 elements in it for each hour of the day. For hours where there is
        // no data, use a value of -1 so we can catch that on the front end.
        for (let j = 1; j < duration.hours; j++) {
          const newDate = addHours(forecastTime, j);
          newSkyCoverItems.push({
            value: skyCover[i]?.value ?? null,
            validTime: { date: newDate, duration: oneHourIsoDuration },
          });
        }
        // figure out which day index to insert the forecast into
        const dayDiff = differenceInCalendarDays(forecastTime, timeOneHourAgo);
        if (skyCoverByDay?.at(dayDiff) === undefined) {
          skyCoverByDay[dayDiff] = newSkyCoverItems;
        } else {
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
    return axios.get<MoonPhaseData>(
      `https://aa.usno.navy.mil/api/moon/phases/date?${params.toString()}`,
    );
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
