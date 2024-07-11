import axios from "axios";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { type PointMetadataResp, type GridpointForecastResp, zGridpointForecastParams, type GridpointForecastParams, type NWSDataPoint } from "~/types/forecast";
import type { MoonPhaseData } from "~/types/moonphase";
import type { GeoData } from "~/types/ip";
import { getDateTransformer } from "~/lib/utils/date";
import { toZonedTime } from "date-fns-tz";
import { isBefore, subHours, differenceInCalendarDays } from "date-fns";

export const forecastRouter = createTRPCRouter({
  getForecast: publicProcedure
    .input(zGridpointForecastParams)
    .query(async ({ input }) => {
      const transformer = getDateTransformer(input.timeZone);
      return axios.get<GridpointForecastResp>(
        `https://api.weather.gov/gridpoints/${input.wfo}/${input.gridX},${input.gridY}`,
        {
          transformResponse: transformer
        }
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
        transformResponse: getDateTransformer(input.timeZone)
      }
    );
    const skyCover = localTimeForecast.data.properties.skyCover.values;
    // matrix comprised of forecast data for each day. each elem is
    // an array of that day's forecasts.
    const skyCoverByDay: NWSDataPoint[][] = [];
    for (let i = 0; i < skyCover.length; i++ ) {
      const forecastTime = skyCover[i]?.validTime;
      if (!forecastTime || isBefore(forecastTime, timeOneHourAgo)) continue;
      // figure out which index to insert the forecast into
      const dayDiff = differenceInCalendarDays(forecastTime, timeOneHourAgo);
      if (skyCoverByDay?.at(dayDiff) === undefined) {
        skyCoverByDay[dayDiff] = [skyCover[i]];
      } else {
        skyCoverByDay[dayDiff]?.push(skyCover[i]);
      }
    }
    return skyCoverByDay.filter(dayForecasts => !!dayForecasts);
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
    return { wfo: gridId, gridX, gridY, timeZone } satisfies GridpointForecastParams;
  }),
});
