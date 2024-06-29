import z from "zod";

export const zGeoData = z.object({
  ip: z.string().ip({ version: "v4" }),
  success: z.boolean(),
  type: z.string(),
  continent: z.string(),
  continent_code: z.string(),
  country: z.string(),
  country_code: z.string(),
  region: z.string(),
  region_code: z.string(),
  city: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  is_eu: z.boolean(),
  postal: z.string(),
  calling_code: z.string(),
  capital: z.string(),
  borders: z.string(),
  flag: z.object({
    img: z.string().url(),
    emoji: z.string(),
    emoji_unicode: z.string(),
  }),
  connection: z.object({
    asn: z.number(),
    org: z.string(),
    isp: z.string(),
    domain: z.string(),
  }),
  timezone: z.object({
    id: z.string(),
    abbr: z.string(),
    is_dst: z.boolean(),
    offset: z.number(),
    utc: z.string(),
    current_time: z.string().datetime({ offset: true }),
  }),
});

export type GeoData = z.infer<typeof zGeoData>;
