import axios from "axios";
import z from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { zWfoEnum } from "~/types/nws";
import { type PointMetadata, type GridpointForecast } from "~/types/forecast";
import { type MoonPhaseData } from "~/types/moonphase";
import { type GeoData } from "~/types/ip";

export const forecastRouter = createTRPCRouter({
  getForecast: publicProcedure
    .input(
      z.object({
        wfo: zWfoEnum,
        x: z.number(),
        y: z.number(),
      }),
    )
    .query(async ({ input }) => {
      return axios.get<GridpointForecast>(
        `https://api.weather.gov/gridpoints/${input.wfo}/${input.x},${input.y}`,
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
    const { data: nwsData } = await axios.get<PointMetadata>(
      `https://api.weather.gov/points/${geoData.latitude},${geoData.longitude}`,
    );
    const { gridId, gridX, gridY } = nwsData.properties;
    return { gridId, gridX, gridY };
  }),
});
