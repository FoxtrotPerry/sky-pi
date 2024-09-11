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

// schema for Space Weather Prediction Center daily scales
const zSwpcDailyScales = z.object({
  DateStamp: z.string(),
  TimeStamp: z.string(),
  R: z.object({
    Scale: zStrengthNumberScale,
    Text: zStrengthTextScale,
    MinorProb: z.string().nullable(), // "0" - "100"
    MajorProb: z.string().nullable(), // "0" - "100"
  }),
  S: z.object({
    Scale: zStrengthNumberScale,
    Text: zStrengthTextScale,
    Prob: z.string().nullable(), // "0" - "100"
  }),
  G: z.object({
    Scale: zStrengthNumberScale,
    Text: zStrengthTextScale,
  }),
});

export type DailyScales = z.infer<typeof zSwpcDailyScales>;

// JSON from SWPC scales
const zScalesResponse = z.object({
  "-1": zSwpcDailyScales, // previous day predictions
  "0": zSwpcDailyScales, // current day predictions
  "1": zSwpcDailyScales, // next day predictions
  "2": zSwpcDailyScales,
  "3": zSwpcDailyScales,
});

export type ScaleResponse = z.infer<typeof zScalesResponse>;
