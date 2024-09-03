import { z } from "zod";

const zDayOfMonth = z.number().gte(1).lte(31);
const zMonthOfYear = z.number().gte(1).lte(12);

const moonPhases = [
  "New Moon",
  "First Quarter",
  "Full Moon",
  "Last Quarter",
] as const;

export type MoonPhase = (typeof moonPhases)[number];

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
      phase: z.enum(moonPhases),
      time: z.string(),
      year: z.number(),
    }),
  ),
});

export type RawMoonPhaseData = z.infer<typeof zRawMoonPhaseData>;

export type MoonPhaseData = {
  date: Date;
  name: string;
};

export type MoonPhaseCycle = {
  newMoon?: MoonPhaseData;
  firstQuarter?: MoonPhaseData;
  fullMoon?: MoonPhaseData;
  lastQuarter?: MoonPhaseData;
};
