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
import { addHours, isAfter, format, parse } from "date-fns";
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
  // TODO: Clean up this function when development is finished
  getThreeDaySpaceWeatherForecast: publicProcedure.query(async () => {
    const { data: ovationAuroraText } = await axios.get<string>(
      `https://services.swpc.noaa.gov/text/3-day-geomag-forecast.txt`,
    );

    // Parse the text into a more usable format
    const textLines = ovationAuroraText?.split("\n");

    /**
     * Find the start and end of the geomagnetic activity probabilities and kp index forecasts
     */
    let [probabilitiesStart, probabilitiesEnd, kpIndexStart, kpDatesLineIdx] = [
      0, 0, 0, 0,
    ];
    textLines.forEach((line, index) => {
      if (line.includes("NOAA Geomagnetic Activity Probabilities")) {
        probabilitiesStart = index + 1;
      } else if (line.includes("NOAA Kp index forecast")) {
        probabilitiesEnd = index - 1;
        kpDatesLineIdx = index + 1;
        kpIndexStart = index + 2;
      }
    });

    const geomagneticProbabilityLines = textLines.slice(
      probabilitiesStart,
      probabilitiesEnd,
    );
    const kpIndexLines = textLines.slice(kpIndexStart, -1);

    /**
     * Parse severity probabilities from the text
     */

    // TODO: Parse % probabilities into the following type:
    type GeomagProbabilities = Array<{
      time: Date;
      probabilities: Array<{
        severity: "Active" | "Minor" | "Moderate" | "Strong";
        probability: number;
      }>;
    }>;
    const geomagneticProbabilityDataBySeverity =
      geomagneticProbabilityLines.map((line) => {
        const [activity, probabilities] = line.split(/\s{2,}/);
        const [day1Probability, day2Probability, day3Probability] =
          probabilities!.split("/");
        return {
          severity: activity,
          probabilities: [
            Number(day1Probability),
            Number(day2Probability),
            Number(day3Probability),
          ],
        };
      });

    /**
     * Parse kp values from the text table
     */

    type KpForecast = Array<{
      time: Date;
      value: number;
    }>;

    // split each hour range and kp value into an array
    const kpIndexDatesSplit = textLines[kpDatesLineIdx]!.trim().split(/\s{2,}/);

    // parse the dates into Date objects in UTC
    const kpIndexForecastDates = kpIndexDatesSplit.map((dayOfMonth) => {
      const [month, day] = dayOfMonth.split(" ");
      const localDate = parse(`${month} ${day}`, "MMM d", new Date());
      return new Date(
        Date.UTC(
          localDate.getFullYear(),
          localDate.getMonth() - 1,
          localDate.getDate(),
        ),
      );
    });
    const kpIndexSplitLines = kpIndexLines.map((line, i) => {
      // when looking at the date line, only match on two or more spaces
      if (i === 0) return line.trim().split(/\s{2,}/);
      // otherwise, split on one or more spaces
      return line.trim().split(/\s+/);
    });

    console.log(kpIndexForecastDates);
    console.log(kpIndexSplitLines);

    return ovationAuroraText;
  }),
});

/**
:Product: Geomagnetic Forecast
:Issued: 2024 Sep 14 2205 UTC
# Prepared by the U.S. Dept. of Commerce, NOAA, Space Weather Prediction Center
#
NOAA Ap Index Forecast
Observed Ap 13 Sep 037
Estimated Ap 14 Sep 024
Predicted Ap 15 Sep-17 Sep 018-070-028

NOAA Geomagnetic Activity Probabilities 15 Sep-17 Sep
Active                40/01/20
Minor storm           15/15/25
Moderate storm        05/30/35
Strong-Extreme storm  01/55/20

NOAA Kp index forecast 15 Sep - 17 Sep
             Sep 15    Sep 16    Sep 17
00-03UT        3.33      3.33      5.67      
03-06UT        3.67      3.33      5.00      
06-09UT        3.33      5.33      4.67      
09-12UT        3.33      7.00      4.00      
12-15UT        3.33      6.67      2.67      
15-18UT        3.00      6.00      2.33      
18-21UT        3.00      6.00      2.33      
21-00UT        3.33      5.67      3.00      

 */
