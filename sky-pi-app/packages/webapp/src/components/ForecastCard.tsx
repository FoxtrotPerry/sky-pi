import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type { NWSDataPoint, TemperatureRangeForecast } from "~/types/forecast";
import { format, getHours, isSameHour } from "date-fns";
import {
  MoonStar,
  CloudMoon,
  CloudSun,
  CloudRain,
  CloudMoonRain,
  CloudSunRain,
  Sun,
  Snowflake,
  CloudSnow,
  Umbrella,
} from "lucide-react";
import { percentToSkyShade } from "~/lib/utils/tailwind";
import { useCallback } from "react";
import { Cloudy } from "~/components/icons/cloudy";
import { cn } from "~/lib/utils/ui";
import type { SunRsttData } from "~/types/riseSetTransitTimes";
import type { MoonPhaseData } from "~/types/moonphase";
import type { KpForecast } from "~/types/swpc";
import { ForecastBadges } from "./ForecastBadges";
import { getMaxKpForecast } from "~/lib/utils/swpc";
import { mmToInches } from "~/lib/utils/math";

type ForecastCardProps = React.HTMLAttributes<HTMLDivElement> & {
  skyCoverData: NWSDataPoint[];
  rainChanceData: NWSDataPoint[] | undefined;
  snowfallAmount: NWSDataPoint[] | undefined;
  sunRsttData: SunRsttData | undefined;
  now: Date;
  tempForecast?: NWSDataPoint[];
  dayDistanceToNewMoon?: number;
  phaseEventOnDate?: MoonPhaseData;
  tempRangeForecast?: TemperatureRangeForecast;
  auroraForecastsForDay?: KpForecast[];
};

export const ForecastCard = ({
  className,
  skyCoverData,
  rainChanceData,
  snowfallAmount,
  sunRsttData,
  now,
  tempForecast,
  dayDistanceToNewMoon,
  phaseEventOnDate,
  tempRangeForecast,
  auroraForecastsForDay,
}: ForecastCardProps) => {
  const day = skyCoverData[0]?.validTime.date;

  if (day === undefined) return null;

  const getIcon = useCallback(
    ({
      skyCover,
      isNightTime,
      rainChance = 0,
      snowfallAmount = 0,
    }: {
      skyCover: number;
      isNightTime: boolean;
      rainChance?: number;
      snowfallAmount?: number;
    }) => {
      const imperialSnowfallAmount = mmToInches(snowfallAmount);
      // if it's near clear skies
      if (20 >= skyCover) {
        return isNightTime ? MoonStar : Sun;
      }

      // if it's partly cloudy
      if (40 >= skyCover) {
        if (rainChance >= 70) return Umbrella;
        if (rainChance >= 40) return CloudRain;
        // if we need to depict the sun or moon, check to see
        // if it's night time
        if (isNightTime) {
          if (rainChance >= 20) return CloudMoonRain;
          return CloudMoon;
        } else {
          if (rainChance >= 20) return CloudSunRain;
          return CloudSun;
        }
      }

      // check if we need to show snowfall
      if (imperialSnowfallAmount >= 1) return Snowflake;
      if (imperialSnowfallAmount >= 0.05) return CloudSnow;

      // check if we need to show rainfall
      if (rainChance >= 70) return Umbrella;
      if (rainChance >= 40) return CloudRain;

      // if we get here, then it must be just cloudy without any precipitation
      return Cloudy;
    },
    [],
  );

  const maxKpForecast = getMaxKpForecast(auroraForecastsForDay ?? []);

  const dayOfWeek = format(day, "EEEE");
  const date = format(day, "MMM do");

  // if sunRsttData is undefined, we'll just default to 0
  const sunriseHour = Number(sunRsttData?.Rise.split(":")[0] ?? -1);
  const sunsetHour = Number(sunRsttData?.Set.split(":")[0] ?? -1);

  // get all forecasts that are during night time
  const dawnSkyCoverForecasts = [];
  const duskSkyCoverForecasts = [];
  for (let i = 0; i < skyCoverData.length; i++) {
    if (i < sunriseHour) {
      dawnSkyCoverForecasts.push(skyCoverData[i]);
    } else if (i > sunsetHour) {
      duskSkyCoverForecasts.push(skyCoverData[i]);
    }
  }

  /**
   * Conditions are ideal if:
   * - majority of night time sky cover forecasts are 20% or lower
   * - there's no rain during night time
   * - it's within three days of a new moon
   */
  // const conditionsAreIdeal =

  // console.log({
  //   dayDistanceToNewMoon,
  //   rainlessNight,
  // });

  return (
    <Card className={className}>
      <CardHeader className="space-y-0.5 px-3 pb-0.5 pt-3">
        <div className="flex flex-row justify-between gap-2">
          <div className="flex flex-row gap-2">
            <CardTitle>{dayOfWeek}</CardTitle>
            <Badge className="bg-slate-900 hover:bg-slate-900">
              <h3 className="text-slate-200">{date}</h3>
            </Badge>
          </div>
          <ForecastBadges
            className="flex flex-row gap-2"
            tempForecast={tempRangeForecast}
            phaseEventOnDate={phaseEventOnDate}
            auroraForecast={maxKpForecast}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-0.5 px-3 pb-3 pt-0.5">
        <div className="flex flex-row justify-end gap-1">
          {skyCoverData.map((forecast, i) => {
            if (forecast?.value === undefined || forecast?.value === null)
              return;

            const {
              value,
              validTime: { date: forecastDate },
            } = forecast;

            const isCurrentHour = isSameHour(now, forecastDate);
            const shouldHighlight = 20 >= value;
            const hourOfDay = getHours(forecastDate);
            const duringSunRiseOrSet = [sunriseHour, sunsetHour].includes(
              hourOfDay,
            );
            const duringNightTime = sunRsttData
              ? sunriseHour > hourOfDay || hourOfDay > sunsetHour
              : false;
            const shade = percentToSkyShade(value);
            const hour = forecast.validTime ? hourOfDay : 0;

            const Icon = getIcon({
              isNightTime: duringNightTime,
              skyCover: value,
              rainChance: rainChanceData?.at(i)?.value ?? undefined,
              snowfallAmount: snowfallAmount?.at(i)?.value ?? undefined,
            });

            return (
              <div
                className={cn(
                  "flex flex-col items-center justify-end rounded-lg bg-gradient-to-t",
                  shouldHighlight && "from-white to-slate-500",
                  isCurrentHour && "from-white to-slate-900",
                )}
                key={`sky-cover-${forecastDate.valueOf()}`}
              >
                <p
                  className={cn(
                    "text-slate-500",
                    (shouldHighlight || isCurrentHour) && "text-slate-100",
                    shouldHighlight && "font-bold",
                  )}
                >
                  {hour % 12 === 0 ? 12 : hour % 12}
                </p>
                <div
                  className={cn(
                    "flex flex-col items-center rounded-lg bg-white p-0.5",
                    shouldHighlight && "bg-slate-200",
                    duringSunRiseOrSet && "bg-amber-400",
                    duringNightTime && "bg-sky-950",
                  )}
                >
                  <Icon
                    className={cn(
                      `fill-slate-${shade}`,
                      "stroke-slate-500",
                      duringNightTime && "stroke-slate-100",
                    )}
                  />
                  <p
                    className={cn(
                      "text-xs text-slate-800",
                      shouldHighlight && "font-bold",
                      duringNightTime && "text-slate-100",
                    )}
                  >
                    {value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
