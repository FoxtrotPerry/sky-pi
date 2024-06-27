import axios from "axios";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import type { MoonPhaseData } from "~/types/moonphase";

export const moonPhaseRouter = createTRPCRouter({
  get: publicProcedure.query(async () => {
    const now = new Date();
    const params = new URLSearchParams([
      ["date", `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`],
      ["nump", "4"],
    ]);
    // FIXME: returns as undefined for some reason, regardless of whether params
    // are passed in in the config object or not.
    return axios.get<MoonPhaseData>(
      `https://aa.usno.navy.mil/api/moon/phases/date?${params.toString()}`,
    );
  }),
});
