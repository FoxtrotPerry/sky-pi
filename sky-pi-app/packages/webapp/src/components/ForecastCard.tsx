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
} from "lucide-react";
import { percentToSkyShade } from "~/lib/utils/tailwind";
import { useCallback } from "react";
import { Cloudy } from "~/components/icons/Cloudy";
import { Umbrella } from "~/components/icons/Umbrella";
import type { SunRsttData } from "~/types/riseSetTransitTimes";
import type { MoonPhaseData } from "~/types/moonphase";
import type { KpForecast } from "~/types/swpc";
import { ForecastBadges } from "./ForecastBadges";
import { getMaxKpForecast } from "~/lib/utils/swpc";
import { mmToInches } from "~/lib/utils/math";
import { ForecastHour } from "./ForecastHour";

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
  // tempForecast,
  // dayDistanceToNewMoon,
  phaseEventOnDate,
  tempRangeForecast,
  auroraForecastsForDay,
}: ForecastCardProps) => {
  const day = skyCoverData[0]?.validTime.date;

  if (day === undefined) return null;

  const getAuroraForecastForHour = useCallback(
    (forecastDate: Date) => {
      if (!auroraForecastsForDay?.length) return 0;

      const hour = getHours(forecastDate);
      const forecast = auroraForecastsForDay.find((f) => {
        const forecastHour = getHours(new Date(f.time));
        return forecastHour === hour;
      });

      return forecast?.value ?? 0;
    },
    [auroraForecastsForDay],
  );

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
   // TODO: Put some work into calculating "ideal" days
   * Conditions are ideal if:
   * - majority of night time sky cover forecasts are 20% or lower
   * - there's no rain during night time
   * - it's within three days of a new moon
   */

  return (
    <Card className={className}>
      <CardHeader className="space-y-0.5 px-3 pb-0.5 pt-1.5">
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
      <CardContent className="space-t-0.5 px-3 pb-1.5 pt-0.5">
        <div className="flex flex-col gap-0.5">
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

              const auroraKp = getAuroraForecastForHour(forecastDate);

              return (
                <ForecastHour
                  key={`forecast-${forecastDate.valueOf()}`}
                  forecastDate={forecastDate}
                  hour={hour}
                  value={value}
                  shade={shade}
                  Icon={Icon}
                  shouldHighlight={shouldHighlight}
                  isCurrentHour={isCurrentHour}
                  auroraKp={auroraKp}
                  duringSunRiseOrSet={duringSunRiseOrSet}
                  duringNightTime={duringNightTime}
                />
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
