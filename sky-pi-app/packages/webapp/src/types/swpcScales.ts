import z from "zod";

const strengthTextScale = [
  "none",
  "minor",
  "moderate",
  "strong",
  "severe",
  "extreme",
] as const;
const strengthNumberScale = ["0", "1", "2", "3", "4", "5"] as const;

const zStrengthTextScale = z.enum(strengthTextScale).nullable();
const zStrengthNumberScale = z.enum(strengthNumberScale).nullable();

const zRadioBlackoutScale = z.object({
  Scale: zStrengthNumberScale,
  Text: zStrengthTextScale,
  MinorProb: z.string().nullable(), // "0" - "100"
  MajorProb: z.string().nullable(), // "0" - "100"
});

const zSolarRadiationScale = z.object({
  Scale: zStrengthNumberScale,
  Text: zStrengthTextScale,
  Prob: z.string().nullable(), // "0" - "100"
});

const zGeomagneticStormingScale = z.object({
  Scale: zStrengthNumberScale,
  Text: zStrengthTextScale,
});

// schema for Space Weather Prediction Center daily scales
const zSwpcDailyScales = z.object({
  DateStamp: z.custom<`${number}-${number}-${number}`>(),
  TimeStamp: z.custom<`${number}:${number}:${number}`>(),
  R: zRadioBlackoutScale,
  S: zSolarRadiationScale,
  G: zGeomagneticStormingScale,
});

export type DailyScales = z.infer<typeof zSwpcDailyScales>;

// JSON from SWPC scales
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const zScalesResponse = z.object({
  "-1": zSwpcDailyScales, // previous day predictions
  "0": zSwpcDailyScales, // current day predictions
  "1": zSwpcDailyScales, // next day predictions
  "2": zSwpcDailyScales,
  "3": zSwpcDailyScales,
});

export type ScaleResponse = z.infer<typeof zScalesResponse>;

const zSwpcDailyScalesFormatted = z.object({
  date: z.date(),
  radioBlackout: zRadioBlackoutScale,
  solarRadiation: zSolarRadiationScale,
  geomagneticStorming: zGeomagneticStormingScale,
});

export type DailyScalesFormatted = z.infer<typeof zSwpcDailyScalesFormatted>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const zScalesFormattedResponse = z.object({
  previousDay: zSwpcDailyScalesFormatted,
  currentDay: zSwpcDailyScalesFormatted,
  nextDay: zSwpcDailyScalesFormatted,
  day2: zSwpcDailyScalesFormatted,
  day3: zSwpcDailyScalesFormatted,
});

export type FormattedScaleResponse = z.infer<typeof zScalesFormattedResponse>;
