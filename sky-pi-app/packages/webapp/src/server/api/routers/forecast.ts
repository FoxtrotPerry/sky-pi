import axios from "axios";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  type PointMetadataResp,
  type GridpointForecastResp,
  zGridpointForecastParams,
  type GridpointForecastParams,
  type LocalConditions,
  type TemperatureRangeForecast,
} from "~/types/forecast";
import type {
  MoonPhaseCycle,
  MoonPhaseData,
  RawMoonPhaseData,
} from "~/types/moonphase";
import type { GeoData } from "~/types/ip";
import { getDateTransformer } from "~/lib/utils/date";
import { addHours, isAfter, format, isSameDay } from "date-fns";
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
import type { KpForecast } from "~/types/swpc";
import { toZonedTime } from "date-fns-tz";
import {
  type SunPhaseRequestResponse,
  type SunPhaseRequestParams,
} from "~/types/sunPhase";
import {
  combineNormalizedForecasts,
  parseGeomagneticForecast,
  parseSpaceForecast,
} from "~/lib/utils/aurora";

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

      const forecastProperties = localTimeForecast.data.properties;
      const skyCover = forecastProperties.skyCover.values;
      const chanceOfRain = forecastProperties.probabilityOfPrecipitation.values;
      // snowfall amount measured in mm
      const chanceOfSnow = forecastProperties.snowfallAmount.values;
      const tempForecast = forecastProperties.temperature.values;

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
          temperature: {
            currTemp: 0,
            tempRangeForecast: [],
            tempForecastByDay: [],
          },
          skyCover: [],
          sunRsttData: [],
          rainChance: [],
          snowChance: [],
          sunPhaseData: [],
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
      console.log(chanceOfSnow);
      const snowChanceByDay = dataPointsToDays(
        chanceOfSnow,
        forecastParams.timeZone,
      ).filter((dayForecasts) => !!dayForecasts);
      const tempForecastByDay = dataPointsToDays(
        tempForecast,
        forecastParams.timeZone,
      ).filter((dayForecasts) => !!dayForecasts);

      // TODO: Decide on one of these two RSTT APIs

      // RSTT Source #1

      const sunPhaseParamsByDay = skyCoverByDay.map((dataPoint) => {
        const date = dataPoint.at(0)?.validTime.date;
        if (!date) {
          return new URLSearchParams();
        }
        return new URLSearchParams({
          lat: riseSetParams.lat.toString(),
          lng: riseSetParams.lng.toString(),
          tzid: forecastParams.timeZone,
          date: format(date, "yyyy-MM-dd"),
        } satisfies SunPhaseRequestParams);
      });

      const sunPhaseRequests = sunPhaseParamsByDay.map((params) => {
        const reqUrl = `https://api.sunrise-sunset.org/json?${params.toString()}`;
        return axios.get<SunPhaseRequestResponse>(reqUrl);
      });

      const sunPhaseResponses = await Promise.all(sunPhaseRequests).catch(
        () => {
          console.error("Failed to get Sun Phase data");
          return [];
        },
      );

      const sunPhaseData = sunPhaseResponses.map((resp) => {
        return resp.data satisfies SunPhaseRequestResponse;
      });

      // RSTT Source #2

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

      const rsttRequests = rsttSearchParamsByDay.map((searchParams) => {
        return axios.get<RiseSetTransitTimesResp>(
          `https://aa.usno.navy.mil/api/rstt/oneday?${searchParams.toString()}`,
        );
      });

      const rsttResponses = await Promise.all(rsttRequests).catch(() => {
        console.error("Failed to get RSTT data");
        return [];
      });

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
          } satisfies TemperatureRangeForecast;
        },
      );

      return {
        skyCover: skyCoverByDay,
        rainChance: rainChanceByDay,
        snowChance: snowChanceByDay,
        temperature: {
          currTemp: currTemp ?? 0,
          tempRangeForecast: highLowTempForecast,
          tempForecastByDay,
        },
        sunRsttData,
        sunPhaseData,
      } satisfies LocalConditions;
    }),
  // #endregion

  // #region getMoonPhases
  getMoonPhases: publicProcedure.query(async () => {
    const now = new Date();
    const params = new URLSearchParams([
      ["date", `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`],
      ["nump", "4"],
    ]);
    const phasesResp = await axios
      .get<RawMoonPhaseData>(
        `https://aa.usno.navy.mil/api/moon/phases/date?${params.toString()}`,
      )
      .catch(() => {
        console.error("Failed to get moon phase data");
        return null;
      });

    if (!phasesResp) return null;

    const moonPhaseCycle: MoonPhaseCycle = {};
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
        !moonPhaseCycle.nextApexEvent &&
        (phaseName === "Full Moon" || phaseName === "New Moon")
      ) {
        moonPhaseCycle.nextApexEvent = phaseData;
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

    return moonPhaseCycle;
  }),
  // #endregion

  // #region getGeoData
  getGeoData: publicProcedure.query(async () => {
    const { data: geoData, status } =
      await axios.get<GeoData>(`https://ipwho.is/`);
    if (status !== 200) {
      console.error("Failed to get geolocation data");
      return null;
    }
    const nwsResponse = await axios.get<PointMetadataResp>(
      `https://api.weather.gov/points/${geoData.latitude},${geoData.longitude}`,
    );

    if (nwsResponse.status !== 200) {
      console.error("Failed to get NWS point data");
      return null;
    }

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
        lat: geoData.latitude,
        lng: geoData.longitude,
        tz: `${geoData.timezone.offset / 60 / 60}`,
        dst: false,
      } satisfies Omit<RiseSetTransitTimesParams, "date">,
    };
  }),
  // #endregion

  // #region getThreeDayGeomagneticForecast
  getThreeDayGeomagneticForecast: publicProcedure
    .input(
      z.object({
        timezone: z.string(),
        now: z.date(),
      }),
    )
    .query(async ({ input }) => {
      const [
        { data: geomagneticForecastText },
        // { data: noaaScalesForecast },
        { data: threeDaySpaceForecastText },
      ] = await Promise.all([
        axios.get<string>(
          `https://services.swpc.noaa.gov/text/3-day-geomag-forecast.txt`,
        ),
        // axios.get<ScaleResponse>(
        //   `https://services.swpc.noaa.gov/products/noaa-scales.json`,
        // ),
        axios.get<string>(
          `https://services.swpc.noaa.gov/text/3-day-forecast.txt`,
        ),
      ]);

      const parsedGeomagneticForecast = parseGeomagneticForecast(
        geomagneticForecastText,
      );

      const parsedThreeDaySpaceForecast = parseSpaceForecast(
        threeDaySpaceForecastText,
      );

      const kpUtcForecasts = combineNormalizedForecasts(
        parsedGeomagneticForecast,
        parsedThreeDaySpaceForecast,
      );

      const kpLocalForecasts: KpForecast[][] | undefined = [];
      // init a flat array to iterate over
      let dayIndex = 0;
      for (let i = 0; i < kpUtcForecasts.length; i++) {
        for (let j = 0; j < kpUtcForecasts[i]!.length; j++) {
          const kpUtcForecast = kpUtcForecasts[i]![j];
          const kpLocalForecast = {
            time: toZonedTime(kpUtcForecast!.time, input.timezone),
            value: kpUtcForecast!.value,
            severity: kpUtcForecast!.severity,
          };

          const lastInsertedForecast = kpLocalForecasts[dayIndex]?.at(-1);
          // If the last forecast and the current forecast aren't on the same day,
          // we must be on the next day and can increment the day index
          if (
            lastInsertedForecast &&
            !isSameDay(lastInsertedForecast.time, kpLocalForecast.time)
          ) {
            dayIndex++;
          }

          if (!kpLocalForecasts[dayIndex]) {
            kpLocalForecasts[dayIndex] = [];
          }
          kpLocalForecasts[dayIndex]!.push(kpLocalForecast);
        }
      }

      return kpLocalForecasts;
    }),
  // #endregion
});
