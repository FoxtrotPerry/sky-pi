import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type { NWSDataPoint } from "~/types/forecast";
import { format, getHours } from "date-fns";
import { MoonStar, CloudMoon } from "lucide-react";
import { percentToSkyShade } from "~/lib/utils/tailwind";
import { useCallback } from "react";
import { Cloudy } from "~/components/icons/cloudy";
import { cn } from "~/lib/utils/ui";
import { SunRsttData } from "~/types/riseSetTransitTimes";

type ForecastCardProps = React.HTMLAttributes<HTMLDivElement> & {
  skyCoverData: NWSDataPoint[];
  sunRsttData: SunRsttData | undefined;
};

export const ForecastCard = ({
  skyCoverData,
  sunRsttData,
  className,
}: ForecastCardProps) => {
  const day = skyCoverData[0]?.validTime.date;

  if (day === undefined || sunRsttData === undefined) return;

  const getIcon = useCallback((value: number) => {
    if (20 >= value) return MoonStar;
    if (40 >= value) return CloudMoon;
    return Cloudy;
  }, []);

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
          {skyCoverData.map((forecast) => {
            if (forecast?.value === undefined || forecast?.value === null)
              return;

            const value = forecast.value;
            const shouldHighlight = 20 >= value;
            const hourOfDay = getHours(forecast.validTime.date);
            const duringSunRiseOrSet = [sunriseHour, sunsetHour].includes(
              hourOfDay,
            );
            const duringNighttime =
              sunriseHour > hourOfDay || hourOfDay > sunsetHour;
            const shade = percentToSkyShade(value);
            const hour = forecast.validTime ? hourOfDay : 0;
            const Icon = getIcon(value);

            return (
              <div
                className={cn("flex flex-col items-center justify-end")}
                key={`sky-cover-${forecast?.validTime.date.valueOf()}`}
              >
                <p className="text-slate-500">{hour}</p>
                <div
                  className={cn(
                    "flex flex-col items-center rounded-lg border-2",
                    shouldHighlight && "border-slate-300 bg-slate-100",
                    !shouldHighlight && "border-transparent",
                    duringSunRiseOrSet && "bg-amber-400",
                    duringNighttime && "bg-cyan-900",
                    duringNighttime && shouldHighlight && "bg-cyan-700",
                  )}
                >
                  <Icon
                    className={cn(
                      `fill-slate-${shade}`,
                      "stroke-slate-500",
                      duringNighttime && "stroke-slate-100",
                    )}
                  />
                  <p
                    className={cn(
                      "text-xs text-slate-800",
                      shouldHighlight && "font-bold",
                      duringNighttime && "text-slate-100",
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
