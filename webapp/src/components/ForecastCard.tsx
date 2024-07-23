import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type { NWSDataPoint } from "~/types/forecast";
import { format, getHours } from "date-fns";
import { MoonStar, CloudMoon } from "lucide-react";
import { percentToSkyShade } from "~/lib/utils/tailwind";
import { useCallback } from "react";
import { Cloudy } from "~/components/icons/cloudy";
import clsx from "clsx";

type ForecastCardProps = {
  skyCoverData: NWSDataPoint[];
};

export const ForecastCard = ({ skyCoverData }: ForecastCardProps) => {
  const day = skyCoverData[0]?.validTime.date;

  const getIcon = useCallback((value: number) => {
    if (20 >= value) return MoonStar;
    if (40 >= value) return CloudMoon;
    return Cloudy;
  }, []);

  if (day === undefined) return;
  const dayOfWeek = format(day, "EEEE");
  const date = format(day, "MMM do");

  return (
    <Card>
      <CardHeader className="space-y-0.5 px-3 pb-0.5 pt-3">
        <div className="flex flex-row gap-2">
          <CardTitle>{dayOfWeek}</CardTitle>
          <Badge className="bg-slate-200 hover:bg-slate-200">
            <h3 className="text-slate-700">{date}</h3>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-0.5 px-3 pb-3 pt-0.5">
        <div className="flex flex-row justify-end gap-1">
          {skyCoverData.map((forecast) => {
            if (!forecast?.value) return;
            const value = forecast?.value;
            const shouldHighlight = 20 >= value;
            const shade = percentToSkyShade(value);
            const hour = forecast?.validTime
              ? getHours(forecast?.validTime.date) + 1
              : 0;
            // only show the hour if it's cleanly divisible by 6 or is 1
            const showHour = hour % 6 === 0 || hour === 1 || shouldHighlight;
            const Icon = getIcon(value);
            return (
              <div
                className={clsx(
                  "flex flex-col items-center justify-end",
                  showHour && "justify-between",
                )}
                key={`sky-cover-${forecast?.validTime.date.valueOf()}`}
              >
                {(showHour || shouldHighlight) && (
                  <p className="text-slate-500">{hour}</p>
                )}
                <div
                  className={clsx(
                    "flex flex-col items-center rounded-lg border-2",
                    shouldHighlight && "border-2 border-slate-300 bg-slate-100",
                    !shouldHighlight && "border-transparent",
                  )}
                >
                  <Icon className={`fill-slate-${shade} stroke-slate-500`} />
                  <p
                    className={clsx(
                      "text-xs text-slate-500",
                      shouldHighlight && "font-bold text-slate-800",
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
