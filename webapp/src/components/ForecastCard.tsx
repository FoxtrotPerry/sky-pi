import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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
  const date = format(day, "yyyy / MM / dd");

  return (
    <Card>
      <CardHeader className="space-y-0.5 px-3 pb-0.5 pt-3">
        <div className="flex flex-row justify-between gap-2">
          <CardTitle>{dayOfWeek}</CardTitle>
          <h3 className="text-muted-foreground">{date}</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-0.5 px-3 pb-3 pt-0.5">
        <div className="flex flex-row justify-end gap-1">
          {skyCoverData.map((forecast) => {
            if (!forecast?.value) return;
            const value = forecast?.value;
            const highlight = 20 >= value;
            const shade = percentToSkyShade(value);
            const hour = forecast?.validTime
              ? getHours(forecast?.validTime.date) + 1
              : 0;
            // only show the hour if it's cleanly divisible by 6 or is 1
            const showHour = hour % 6 === 0 || hour === 1;
            const Icon = getIcon(value);
            return (
              <div
                className={clsx(
                  "flex flex-col items-center justify-end",
                  highlight &&
                    showHour &&
                    "gap-0 rounded-lg border-2 bg-slate-100",
                )}
                key={`sky-cover-${forecast?.validTime.date.valueOf()}`}
              >
                {showHour && <p className="text-slate-500">{hour}</p>}
                <div
                  className={clsx(
                    "flex flex-col items-center",
                    highlight &&
                      !showHour &&
                      "gap-0 rounded-lg border-2 bg-slate-100",
                  )}
                >
                  <Icon className={`fill-slate-${shade} stroke-slate-500`} />
                  <p
                    className={clsx(
                      "text-xs text-slate-500",
                      highlight && "font-bold text-slate-800",
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
