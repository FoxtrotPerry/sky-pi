import { z } from "zod";

const zDayOfMonth = z.number().gte(1).lte(31);
const zMonthOfYear = z.number().gte(1).lte(12);

export const zRawMoonPhaseData = z.object({
  apiVersion: z.string(),
  day: zDayOfMonth,
  month: zMonthOfYear,
  year: z.number(),
  numphases: z.number(),
  phasedata: z.array(
    z.object({
      day: zDayOfMonth,
      month: zMonthOfYear,
      phase: z.enum(["New Moon", "First Quarter", "Full Moon", "Last Quarter"]),
      time: z.string(),
      year: z.number(),
    }),
  ),
});

export type RawMoonPhaseData = z.infer<typeof zRawMoonPhaseData>;
