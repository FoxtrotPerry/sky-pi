import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type { NWSDataPoint, TemperatureForecast } from "~/types/forecast";
import { format, getHours, isSameHour } from "date-fns";
import {
  MoonStar,
  CloudMoon,
  CloudSun,
  Droplet,
  CloudRain,
  CloudMoonRain,
  CloudSunRain,
  Sun,
  Umbrella,
  Moon,
} from "lucide-react";
import { percentToSkyShade } from "~/lib/utils/tailwind";
import { useCallback } from "react";
import { Cloudy } from "~/components/icons/cloudy";
import { cn } from "~/lib/utils/ui";
import { SunRsttData } from "~/types/riseSetTransitTimes";
import { MoonPhaseData } from "~/types/moonphase";
import { toFahrenheit } from "~/lib/utils/math";

type ForecastCardProps = React.HTMLAttributes<HTMLDivElement> & {
  skyCoverData: NWSDataPoint[];
  rainChanceData: NWSDataPoint[] | undefined;
  sunRsttData: SunRsttData | undefined;
  now: Date;
  phaseEventOnDate?: MoonPhaseData;
  tempForecast?: TemperatureForecast;
};

export const ForecastCard = ({
  className,
  skyCoverData,
  rainChanceData,
  sunRsttData,
  now,
  phaseEventOnDate,
  tempForecast,
}: ForecastCardProps) => {
  const day = skyCoverData[0]?.validTime.date;

  if (day === undefined || sunRsttData === undefined) return;

  const getIcon = useCallback(
    (context: {
      skyCover: number;
      isNightTime: boolean;
      rainChance?: number;
    }) => {
      const { skyCover, isNightTime, rainChance = 0 } = context;
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

      // if it's more than 40% cloudy, then we don't need to worry about
      // showing the sun or moon in the iconography
      if (rainChance >= 70) return Umbrella;
      if (rainChance >= 40) return CloudRain;
      return Cloudy;
    },
    [],
  );

  const dayOfWeek = format(day, "EEEE");
  const date = format(day, "MMM do");

  const sunriseHour = Number(sunRsttData.Rise.split(":")[0]);
  const sunsetHour = Number(sunRsttData.Set.split(":")[0]);

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
          <div>
            <>
              {tempForecast && (
                <h3 className="text-xl font-bold leading-none">{`${toFahrenheit(tempForecast.low)}° - ${toFahrenheit(tempForecast.high)}°`}</h3>
              )}
              {phaseEventOnDate && (
                <Badge
                  className={cn(
                    "flex items-center gap-1 border-0 bg-gradient-to-r",
                    phaseEventOnDate.name === "New Moon" && "from-indigo-500",
                    phaseEventOnDate.name === "Full Moon" && "from-cyan-600",
                  )}
                >
                  <Moon size={16} />
                  {phaseEventOnDate.name}
                </Badge>
              )}
            </>
          </div>
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
            const duringNightTime =
              sunriseHour > hourOfDay || hourOfDay > sunsetHour;
            const shade = percentToSkyShade(value);
            const hour = forecast.validTime ? hourOfDay : 0;
            const Icon = getIcon({
              isNightTime: duringNightTime,
              skyCover: value,
              rainChance: rainChanceData?.at(i)?.value ?? undefined,
            });

            return (
              <div
                className={cn(
                  "flex flex-col items-center justify-end rounded-lg",
                  shouldHighlight && "bg-slate-500",
                  isCurrentHour && "bg-slate-900",
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
                  {hour === 0 ? 12 : hour}
                </p>
                <div
                  className={cn(
                    "flex flex-col items-center rounded-lg p-0.5",
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
                      (duringNightTime || isCurrentHour) && "text-slate-100",
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
