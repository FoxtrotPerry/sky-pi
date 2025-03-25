import { format } from "date-fns";
import { MoveRight, RefreshCcw, Sunrise, Sunset } from "lucide-react";
import React from "react";
import { Card, CardContent } from "~/components/ui/card";
import { toFahrenheit } from "~/lib/utils/math";
import { removeSeconds } from "~/lib/utils/string";
import { cn } from "~/lib/utils/ui";
import type { SunPhaseRequestResponse } from "~/types/sunPhase";

type MiscCardProps = React.HTMLAttributes<HTMLDivElement> & {
  updateTime: Date;
  /** temp in fahrenheit */
  temperature?: number;
  sunPhaseTimes?: SunPhaseRequestResponse;
};

export const MiscCard = ({
  updateTime,
  temperature,
  className,
  sunPhaseTimes,
  ...props
}: MiscCardProps) => {
  const formattedTime = format(updateTime, "p");
  const formattedTemperature =
    temperature !== undefined ? `${toFahrenheit(temperature)}°` : "N/A";
  const sunset = removeSeconds(sunPhaseTimes?.results.sunset);
  const sunrise = removeSeconds(sunPhaseTimes?.results.sunrise);
  const astro_twilight_start = removeSeconds(
    sunPhaseTimes?.results.astronomical_twilight_begin,
  );
  const astro_twilight_end = removeSeconds(
    sunPhaseTimes?.results.astronomical_twilight_end,
  );

  return (
    <Card className={cn(className)} {...props}>
      <CardContent className="flex h-full items-center justify-between px-2 py-0">
        <table className="w-full table-auto">
          <tbody>
            <tr>
              <td>
                <SunEvent
                  className="astro-night-gradient"
                  icon={<Sunrise size={24} className="stroke-white" />}
                />
              </td>
              <td>
                <MoveRight size={12} />
              </td>
              <td>
                <SunEvent
                  className="sun-rise-set-gradient"
                  icon={<Sunrise size={24} />}
                />
              </td>
              <td>
                <MoveRight size={12} />
              </td>
              <td>
                <SunEvent
                  className="sun-rise-set-gradient"
                  icon={<Sunset size={24} />}
                />
              </td>
              <td>
                <MoveRight size={12} />
              </td>
              <td>
                <SunEvent
                  className="astro-night-gradient"
                  icon={<Sunset size={24} className="stroke-white" />}
                />
              </td>
            </tr>
            <tr>
              <td>
                <p className="text-center text-sm text-muted-foreground">
                  {astro_twilight_start}
                </p>
              </td>
              <td />
              <td>
                <p className="text-center text-sm text-muted-foreground">
                  {sunrise}
                </p>
              </td>
              <td />
              <td>
                <p className="text-center text-sm text-muted-foreground">
                  {sunset}
                </p>
              </td>
              <td />
              <td>
                <p className="text-center text-sm text-muted-foreground">
                  {astro_twilight_end}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="mx-2 h-full w-0.5 bg-slate-400" />
        <div className="flex flex-col">
          <h2 className="-mr-0.5 text-center text-4xl font-semibold">
            {formattedTemperature}
          </h2>
          <div className="flex items-center gap-0.5">
            <RefreshCcw
              className="stroke-muted-foreground"
              size={16}
              strokeWidth={2.5}
            />
            <p className="text-nowrap text-sm text-muted-foreground">
              {formattedTime}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SunEvent = ({
  className,
  icon,
}: {
  className?: string;
  icon: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "border-slate flex size-10 justify-center rounded-full border-2 border-slate-400",
          className,
        )}
      >
        <div className="my-1">{icon}</div>
      </div>
    </div>
  );
};
