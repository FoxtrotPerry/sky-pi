import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type { NWSDataPoint } from "~/types/forecast";
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
} from "lucide-react";
import { percentToSkyShade } from "~/lib/utils/tailwind";
import { useCallback } from "react";
import { Cloudy } from "~/components/icons/cloudy";
import { cn } from "~/lib/utils/ui";
import { SunRsttData } from "~/types/riseSetTransitTimes";

type ForecastCardProps = React.HTMLAttributes<HTMLDivElement> & {
  skyCoverData: NWSDataPoint[];
  rainChanceData: NWSDataPoint[] | undefined;
  sunRsttData: SunRsttData | undefined;
  now: Date;
};

export const ForecastCard = ({
  skyCoverData,
  rainChanceData,
  sunRsttData,
  className,
  now,
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
        <div className="flex flex-row gap-2">
          <CardTitle>{dayOfWeek}</CardTitle>
          <Badge className="bg-slate-900 hover:bg-slate-900">
            <h3 className="text-slate-200">{date}</h3>
          </Badge>
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
                  isCurrentHour && "bg-slate-900",
                )}
                key={`sky-cover-${forecastDate.valueOf()}`}
              >
                <p
                  className={cn(
                    "text-slate-500",
                    isCurrentHour && "text-slate-100",
                  )}
                >
                  {hour === 0 ? 12 : hour}
                </p>
                <div
                  className={cn(
                    "flex flex-col items-center rounded-lg border-2",
                    shouldHighlight && "border-slate-400 bg-slate-200",
                    !shouldHighlight && "border-transparent",
                    duringSunRiseOrSet && "bg-amber-400",
                    duringNightTime && "bg-cyan-800",
                    duringNightTime &&
                      shouldHighlight &&
                      "border-purple-500 bg-cyan-950",
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
