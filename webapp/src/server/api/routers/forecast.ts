import axios from "axios";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const forecastRouter = createTRPCRouter({
  get: publicProcedure.query(() => {
    return axios.get("https://api.weather.gov/gridpoints/BGM/52,103/forecast");
  }),
});
