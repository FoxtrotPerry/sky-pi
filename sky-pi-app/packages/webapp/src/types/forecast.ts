import z from "zod";
import { zPhenomenon, zSignificance, zWfoEnum } from "./nws";
import type { SunRsttData } from "./riseSetTransitTimes";

export type TemperatureForecast = {
  high: number;
  low: number;
};

export type LocalConditions = {
  temperature?: {
    currTemp: number;
    tempForecast: TemperatureForecast[];
  };
  skyCover: NWSDataPoint[][];
  rainChance: NWSDataPoint[][];
  snowChance: NWSDataPoint[][];
  sunRsttData: SunRsttData[];
};

const nwsApiUrl = z
  .string()
  .url()
  .refine((val) => {
    if (typeof val !== "string") return false;
    const url = new URL(val);
    return url.hostname === "api.weather.gov";
  });

const nwsUnitCode =
  z.custom<`${"wmo:" | "uc:" | "wmoUnit:" | "nwsUnit:" | ""}${"m" | "degC" | "percent"}`>(
    (val) => {
      return typeof val === "string"
        ? /^((wmo|uc|wmoUnit|nwsUnit):)?.*$/.test(val)
        : false;
    },
  );

const nwsDataPoint = z.optional(
  z.object({
    validTime: z.object({
      date: z.date(),
      duration: z.string().duration(),
    }), // Is converted to date from ISO8601 duration string
    value: z.nullable(z.number().min(0).max(100)),
  }),
);

/**
 * ## Note
 * Unmodified data points have `validTime` as a string representing an ISO8601 duration.
 * We modify this value on deserialization into it's date and duration so that we can
 * fill in data gaps more readily.
 */
export type NWSDataPoint = z.infer<typeof nwsDataPoint>;

const nwsDataLayer = z.object({
  uom: z.optional(nwsUnitCode), // unit of measurement
  values: nwsDataPoint.array(),
});

export const zGridpointForecast = z.object({
  "@context": z.tuple([
    z.string().url(),
    z.object({
      "@version": z.string(),
      wmoUnit: z.string().url(),
      nwsUnit: z.string().url(),
    }),
  ]),
  id: nwsApiUrl,
  type: z.literal("Feature"),
  geometry: z.object({
    type: z.string(),
    coordinates: z
      .tuple([
        z.number({ description: "y coordinate" }),
        z.number({ description: "x coordinate" }),
      ])
      .array()
      .array(), // yeah it's a nested array... no idea why.
  }),
  properties: z.object({
    "@id": nwsApiUrl,
    "@type": z.literal("wx:Gridpoint"),
    updateTime: z.string(),
    validTimes: z.string().duration(),
    elevation: z.object({
      unitCode: nwsUnitCode,
      value: z.number(),
    }),
    forecastOffice: nwsApiUrl,
    gridId: zWfoEnum,
    gridX: z.string(),
    gridY: z.string(),
    temperature: nwsDataLayer,
    dewpoint: nwsDataLayer,
    maxTemperature: nwsDataLayer,
    minTemperature: nwsDataLayer,
    relativeHumidity: nwsDataLayer,
    apparentTemperature: nwsDataLayer,
    heatIndex: nwsDataLayer,
    windChill: nwsDataLayer,
    wetBulbGlobeTemperature: nwsDataLayer,
    skyCover: nwsDataLayer,
    windDirection: nwsDataLayer,
    windSpeed: nwsDataLayer,
    windGust: nwsDataLayer,
    weather: z.object({
      values: z.object({
        validTime: z.string().duration(),
        value: z.object({
          coverage: z.nullable(
            z.enum([
              "areas",
              "brief",
              "chance",
              "definite",
              "few",
              "frequent",
              "intermittent",
              "isolated",
              "likely",
              "numerous",
              "occasional",
              "patchy",
              "periods",
              "scattered",
              "slight_chance",
              "widespread",
            ]),
          ),
          weather: z.nullable(
            z.enum([
              "blowing_dust",
              "blowing_sand",
              "blowing_snow",
              "drizzle",
              "fog",
              "freezing_fog",
              "freezing_drizzle",
              "freezing_rain",
              "freezing_spray",
              "frost",
              "hail",
              "haze",
              "ice_crystals",
              "ice_fog",
              "rain",
              "rain_showers",
              "sleet",
              "smoke",
              "snow",
              "snow_showers",
              "thunderstorms",
              "volcanic_ash",
              "water_spouts",
            ]),
          ),
          intensity: z.nullable(
            z.enum(["very_light", "light", "moderate", "heavy"]),
          ),
          visibility: z.object({
            value: z.nullable(z.number()),
            maxValue: z.number(),
            minValue: z.number(),
            unitCode: nwsUnitCode,
            qualityControl: z.enum([
              "Z",
              "C",
              "S",
              "V",
              "X",
              "Q",
              "G",
              "B",
              "T",
            ]),
          }),
          attributes: z.array(
            z.enum([
              "damaging_wind",
              "dry_thunderstorms",
              "flooding",
              "gusty_wind",
              "heavy_rain",
              "large_hail",
              "small_hail",
              "tornadoes",
            ]),
          ),
        }),
      }),
    }),
    hazards: z.object({
      values: z.array(
        z.object({
          validTime: z.string().duration(),
          value: z.object({
            phenomenon: zPhenomenon,
            significance: zSignificance,
            event_number: z.number(),
          }),
        }),
      ),
    }), // Watch and advisory products in effect
    probabilityOfPrecipitation: nwsDataLayer,
    quantitativePrecipitation: nwsDataLayer,
    iceAccumulation: nwsDataLayer,
    snowfallAmount: nwsDataLayer,
    snowLevel: nwsDataLayer,
    ceilingHeight: nwsDataLayer,
    visibility: nwsDataLayer,
    transportWindSpeed: nwsDataLayer,
    transportWindDirection: nwsDataLayer,
    mixingHeight: nwsDataLayer,
    hainesIndex: nwsDataLayer,
    lightningActivityLevel: nwsDataLayer,
    twentyFootWindSpeed: nwsDataLayer,
    twentyFootWindDirection: nwsDataLayer,
    waveHeight: nwsDataLayer,
    wavePeriod: nwsDataLayer,
    waveDirection: nwsDataLayer,
    primarySwellHeight: nwsDataLayer,
    primarySwellDirection: nwsDataLayer,
    secondarySwellHeight: nwsDataLayer,
    secondarySwellDirection: nwsDataLayer,
    wavePeriod2: nwsDataLayer,
    windWaveHeight: nwsDataLayer,
    dispersionIndex: nwsDataLayer,
    pressure: nwsDataLayer, // Barometric pressure
    probabilityOfTropicalStormWinds: nwsDataLayer,
    probabilityOfHurricaneWinds: nwsDataLayer,
    potentialOf15mphWinds: nwsDataLayer,
    potentialOf25mphWinds: nwsDataLayer,
    potentialOf35mphWinds: nwsDataLayer,
    potentialOf45mphWinds: nwsDataLayer,
    potentialOf20mphWindGusts: nwsDataLayer,
    potentialOf30mphWindGusts: nwsDataLayer,
    potentialOf40mphWindGusts: nwsDataLayer,
    potentialOf50mphWindGusts: nwsDataLayer,
    potentialOf60mphWindGusts: nwsDataLayer,
    grasslandFireDangerIndex: nwsDataLayer,
    probabilityOfThunder: nwsDataLayer,
    davisStabilityIndex: nwsDataLayer,
    atmosphericDispersionIndex: nwsDataLayer,
    lowVisibilityOccurrenceRiskIndex: nwsDataLayer,
    stability: nwsDataLayer,
    redFlagThreatIndex: nwsDataLayer,
  }),
});

export type GridpointForecastResp = z.infer<typeof zGridpointForecast>;

export const zGridpointForecastParams = z.object({
  wfo: zWfoEnum,
  gridX: z.number(),
  gridY: z.number(),
  timeZone: z.string(),
});

export type GridpointForecastParams = z.infer<typeof zGridpointForecastParams>;

export const zPointMetadata = z.object({
  "@context": z.tuple([
    z.string().url(),
    z.object({
      "@version": z.string(),
      wx: z.string().url(),
      s: z.string().url(),
      geo: z.string().url(),
      unit: z.string().url(),
      "@vocab": z.string().url(),
      geometry: z.object({
        "@id": z.string(),
        "@type": z.string(),
      }),
      city: z.string(),
      state: z.string(),
      distance: z.object({
        "@id": z.string(),
        "@type": z.string(),
      }),
      bearing: z.object({
        "@type": z.string(),
      }),
      value: z.object({
        "@id": z.string(),
      }),
      unitCode: z.object({
        "@id": z.string(),
        "@type": z.string(),
      }),
      forecastOffice: z.object({
        "@type": z.string(),
      }),
      forecastGridData: z.object({
        "@type": z.string(),
      }),
      publicZone: z.object({
        "@type": z.string(),
      }),
      county: z.object({
        "@type": z.string(),
      }),
    }),
  ]),
  id: z.string().url(),
  type: z.string(),
  geometry: z.object({
    type: z.string(),
    coordinates: z.array(z.number()).length(2),
  }),
  properties: z.object({
    "@id": z.string().url(),
    "@type": z.string(),
    cwa: z.string(),
    forecastOffice: z.string().url(),
    gridId: zWfoEnum,
    gridX: z.number(),
    gridY: z.number(),
    forecast: z.string().url(),
    forecastHourly: z.string().url(),
    forecastGridData: z.string().url(),
    observationStations: z.string().url(),
    relativeLocation: z.object({
      type: z.string(),
      geometry: z.object({
        type: z.string(),
        coordinates: z.array(z.number()).length(2),
      }),
      properties: z.object({
        city: z.string(),
        state: z.string(),
        distance: z.object({
          unitCode: z.string(),
          value: z.number(),
        }),
        bearing: z.object({
          unitCode: z.string(),
          value: z.number(),
        }),
      }),
    }),
    forecastZone: z.string().url(),
    county: z.string().url(),
    fireWeatherZone: z.string().url(),
    timeZone: z.string(),
    radarStation: z.string(),
  }),
});

export type PointMetadataResp = z.infer<typeof zPointMetadata>;
