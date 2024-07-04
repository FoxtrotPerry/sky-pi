import axios from "axios";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { type PointMetadataResp, type GridpointForecastResp, zGridpointForecastParams, type GridpointForecastParams } from "~/types/forecast";
import { type MoonPhaseData } from "~/types/moonphase";
import { type GeoData } from "~/types/ip";
import { toZonedTime } from "date-fns-tz";
import { separateDuration } from "~/lib/utils/date";

export const forecastRouter = createTRPCRouter({
  getForecast: publicProcedure
    .input(zGridpointForecastParams)
    .query(async ({ input }) => {
      return axios.get<GridpointForecastResp>(
        `https://api.weather.gov/gridpoints/${input.wfo}/${input.gridX},${input.gridY}`,
        {
          transformResponse: (data: string) => {
            let resp;
            try {
              resp = JSON.parse(data, (key, value: string | number | boolean | null) => {
                if (key !== 'validTime') return value;
                if (typeof value !== 'string') return value;
                const [timestamp] = separateDuration(value);
                return toZonedTime(timestamp, input.timeZone);
              }) as GridpointForecastResp;
            } catch (error) {
              throw Error(`Error parsing forecast data in transformResponse - ${JSON.stringify(error)}`)
            }
            return resp;
          }
        }
      );
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
