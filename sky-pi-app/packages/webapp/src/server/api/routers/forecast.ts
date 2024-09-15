import axios from "axios";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  type PointMetadataResp,
  type GridpointForecastResp,
  zGridpointForecastParams,
  type GridpointForecastParams,
  type LocalConditions,
  type TemperatureForecast,
} from "~/types/forecast";
import type {
  MoonPhaseCycle,
  MoonPhaseData,
  RawMoonPhaseData,
} from "~/types/moonphase";
import type { GeoData } from "~/types/ip";
import { getDateTransformer } from "~/lib/utils/date";
import { addHours, isAfter, format } from "date-fns";
import { Temporal } from "temporal-polyfill";
import {
  type RiseSetTransitTimesParams,
  type RiseSetTransitTimesResp,
  type SunRsttData,
  zRiseSetTransitTimesParams,
} from "~/types/riseSetTransitTimes";
import { toSearchParamEntries } from "~/lib/utils/object";
import z from "zod";
import { dataPointsToDays } from "~/lib/utils/nws";
import { type ScaleResponse } from "~/types/swpcScales";
import { formatScaleResponse } from "~/lib/utils/swpc";

export const forecastRouter = createTRPCRouter({
  // #region getLocalConditions
  getLocalConditions: publicProcedure
    .input(
      z.object({
        forecastParams: zGridpointForecastParams,
        riseSetParams: zRiseSetTransitTimesParams.omit({ date: true }),
      }),
    )
    .query(async ({ input }): Promise<LocalConditions> => {
      const { forecastParams, riseSetParams } = input;

      const localTimeForecast = await axios.get<GridpointForecastResp>(
        `https://api.weather.gov/gridpoints/${forecastParams.wfo}/${forecastParams.gridX},${forecastParams.gridY}`,
        {
          transformResponse: getDateTransformer(forecastParams.timeZone),
        },
      );

      const skyCover = localTimeForecast.data.properties.skyCover.values;
      const chanceOfRain =
        localTimeForecast.data.properties.probabilityOfPrecipitation.values;
      const chanceOfSnow =
        localTimeForecast.data.properties.snowfallAmount.values;
      const tempForecast = localTimeForecast.data.properties.temperature.values;

      const currTemp = tempForecast.find((temp) => {
        if (!temp?.validTime.duration) return false;
        const duration = Temporal.Duration.from(temp?.validTime.duration);
        const startTime = temp?.validTime.date;
        const endTime = addHours(startTime, duration.hours);
        return isAfter(endTime, new Date());
      })?.value;

      const lastSkyCoverDate = skyCover.at(-1)?.validTime.date;
      const firstSkyCoverDate = skyCover.at(0)?.validTime.date;
      if (!firstSkyCoverDate || !lastSkyCoverDate) {
        return {
          temperature: { currTemp: 0, tempForecast: [] },
          skyCover: [],
          sunRsttData: [],
          rainChance: [],
          snowChance: [],
        };
      }

      const skyCoverByDay = dataPointsToDays(
        skyCover,
        forecastParams.timeZone,
      ).filter((dayForecasts) => !!dayForecasts);
      const rainChanceByDay = dataPointsToDays(
        chanceOfRain,
        forecastParams.timeZone,
      ).filter((dayForecasts) => !!dayForecasts);
      const snowChanceByDay = dataPointsToDays(
        chanceOfSnow,
        forecastParams.timeZone,
      ).filter((dayForecasts) => !!dayForecasts);
      const tempForecastByDay = dataPointsToDays(
        tempForecast,
        forecastParams.timeZone,
      ).filter((dayForecasts) => !!dayForecasts);

      // Get RSTT data:

      const rsttSearchParamsByDay = skyCoverByDay.map((dataPoint) => {
        const date = dataPoint.at(0)?.validTime.date;
        if (!date) {
          return new URLSearchParams();
        }
        return new URLSearchParams(
          toSearchParamEntries({
            date: format(date, "yyyy-MM-dd"),
            ...riseSetParams,
          } satisfies RiseSetTransitTimesParams),
        );
      });

      const rsttResponses = await Promise.all(
        rsttSearchParamsByDay.map((searchParams) => {
          return axios.get<RiseSetTransitTimesResp>(
            `https://aa.usno.navy.mil/api/rstt/oneday?${searchParams.toString()}`,
          );
        }),
      );

      const sunRsttData = rsttResponses.map(
        (response) =>
          Object.fromEntries(
            response.data.properties.data.sundata.map((rstt) => {
              return [rstt.phen, rstt.time];
            }),
          ) as SunRsttData,
        // Object.fromEntries() types the object keys as string regardless of input
        // so we need to cast it in order to preserve specificity
      );

      const highLowTempForecast = tempForecastByDay.map(
        (tempForecastsForDay) => {
          let high = tempForecastsForDay[0]?.value ?? 1337;
          let low = high ?? 1337;
          for (let i = 0; i < tempForecastsForDay.length; i++) {
            const temp = tempForecastsForDay.at(i)?.value ?? 1337;
            if (temp > high) {
              high = temp;
            } else if (temp < low) {
              low = temp;
            }
          }
          return {
            high,
            low,
          } satisfies TemperatureForecast;
        },
      );

      return {
        skyCover: skyCoverByDay,
        rainChance: rainChanceByDay,
        snowChance: snowChanceByDay,
        temperature: {
          currTemp: currTemp ?? 0,
          tempForecast: highLowTempForecast,
        },
        sunRsttData,
      } satisfies LocalConditions;
    }),

  // #region getMoonPhases
  getMoonPhases: publicProcedure.query(async () => {
    const now = new Date();
    const params = new URLSearchParams([
      ["date", `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`],
      ["nump", "4"],
    ]);
    const phasesResp = await axios.get<RawMoonPhaseData>(
      `https://aa.usno.navy.mil/api/moon/phases/date?${params.toString()}`,
    );

    const moonPhaseCycle: MoonPhaseCycle = {};
    let nextApexEvent: MoonPhaseData | undefined = undefined;
    phasesResp.data.phasedata.forEach((phase) => {
      const phaseName = phase.phase;
      const [hoursStr, minutesStr] = phase.time.split(":");
      const phaseTime = new Date(
        Date.UTC(
          phase.year,
          phase.month - 1,
          phase.day,
          Number(hoursStr),
          Number(minutesStr),
        ),
      );
      const phaseData: MoonPhaseData = {
        date: phaseTime,
        name: phaseName,
      };

      if (
        nextApexEvent === null &&
        (phaseData.name === "Full Moon" || phaseData.name === "New Moon")
      ) {
        nextApexEvent = phaseData;
      }

      if (phaseName === "First Quarter") {
        moonPhaseCycle.firstQuarter = phaseData;
      } else if (phaseName === "Full Moon") {
        moonPhaseCycle.fullMoon = phaseData;
      } else if (phaseName === "Last Quarter") {
        moonPhaseCycle.lastQuarter = phaseData;
      } else if (phaseName === "New Moon") {
        moonPhaseCycle.newMoon = phaseData;
      }
    });

    return { moonPhaseCycle, nextApexEvent } as {
      moonPhaseCycle: MoonPhaseCycle;
      nextApexEvent?: MoonPhaseData;
    };
  }),

  // #region getGeoData
  getGeoData: publicProcedure.query(async () => {
    const { data: geoData } = await axios.get<GeoData>(`https://ipwho.is/`);
    const nwsResponse = await axios.get<PointMetadataResp>(
      `https://api.weather.gov/points/${geoData.latitude},${geoData.longitude}`,
    );

    const nwsData = nwsResponse.data;

    const { gridId, gridX, gridY, timeZone } = nwsData.properties;
    return {
      gridpointForecastParams: {
        wfo: gridId,
        gridX,
        gridY,
        timeZone,
      } satisfies GridpointForecastParams,
      riseSetTransitTimesParams: {
        coords: `${geoData.latitude},${geoData.longitude}`,
        tz: `${geoData.timezone.offset / 60 / 60}`,
        dst: false,
      } satisfies Omit<RiseSetTransitTimesParams, "date">,
    };
  }),

  // #region getAuroraData
  getSpaceWeatherConditions: publicProcedure.query(async () => {
    const { data: spaceWeatherdata } = await axios.get<ScaleResponse>(
      `https://services.swpc.noaa.gov/products/noaa-scales.json`,
    );

    return formatScaleResponse(spaceWeatherdata);
  }),

  // #region getThreeDaySpaceWeatherForecast
  getThreeDaySpaceWeatherForecast: publicProcedure.query(async () => {
    const { data: ovationAuroraText } = await axios.get<ScaleResponse>(
      `https://services.swpc.noaa.gov/text/3-day-geomag-forecast.txt`,
    );

    console.log(ovationAuroraText);

    return ovationAuroraText;
  }),
});
