import axios from "axios";
import z from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { zWfoEnum } from "~/types/nws";
import { type GridpointForecast } from "~/types/forecast";

export const forecastRouter = createTRPCRouter({
  get: publicProcedure
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
});
