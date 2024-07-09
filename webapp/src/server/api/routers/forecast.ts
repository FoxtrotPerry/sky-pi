import axios from "axios";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { type PointMetadataResp, type GridpointForecastResp, zGridpointForecastParams, type GridpointForecastParams } from "~/types/forecast";
import type { MoonPhaseData } from "~/types/moonphase";
import type { GeoData } from "~/types/ip";
import { getDateTransformer } from "~/lib/utils/date";
import { toZonedTime } from "date-fns-tz";
import { format, isAfter, subHours } from "date-fns";

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
    const transformer = getDateTransformer(input.timeZone);
    const localNow = toZonedTime(new Date(), input.timeZone);
    const timeOneHourAgo = subHours(localNow, 1);
    const localTimeForecast = await axios.get<GridpointForecastResp>(
      `https://api.weather.gov/gridpoints/${input.wfo}/${input.gridX},${input.gridY}`,
      {
        transformResponse: transformer
      }
    );
    console.log(format(localNow, 'yyyy MM dd hh:mm bbbb x'))
    const skyCover = localTimeForecast.data.properties.skyCover.values;
    const dailySkyCover = [];
    for (let i = 0; i < skyCover.length; i++ ) {
      const forecastTime = skyCover[i]?.validTime;
      if (!forecastTime) continue;
      if (isAfter(forecastTime, timeOneHourAgo)) {
        console.log(format(forecastTime, 'yyyy MM dd hh:mm bbbb x'));
      }
    }
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
