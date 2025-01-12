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
  const formattedTemperature = temperature
    ? `${toFahrenheit(temperature)}°`
    : "N/A";
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
        <div className="flex h-full flex-grow items-center justify-around">
          {astro_twilight_start && (
            <>
              <SunEvent
                className="astro-night-gradient"
                icon={<Sunrise size={20} className="stroke-white" />}
                text={astro_twilight_start}
              />
              <MoveRight size={10} />
            </>
          )}
          {sunrise && (
            <>
              <SunEvent
                className="sun-rise-set-gradient"
                icon={<Sunrise size={20} />}
                text={sunrise}
              />
              <MoveRight size={10} />
            </>
          )}
          {sunset && (
            <>
              <SunEvent
                className="sun-rise-set-gradient"
                icon={<Sunset size={20} />}
                text={sunset}
              />
              <MoveRight size={10} />
            </>
          )}
          {astro_twilight_end && (
            <SunEvent
              className="astro-night-gradient"
              icon={<Sunrise size={20} className="stroke-white" />}
              text={astro_twilight_end}
            />
          )}
        </div>
        <div className="mx-2 h-full w-0.5 bg-slate-400" />
        <div className="flex flex-col">
          <h2 className="text-end text-4xl font-semibold">
            {formattedTemperature}
          </h2>
          <div className="flex items-center gap-0.5">
            <RefreshCcw className="stroke-muted-foreground" size={12} />
            <p className="text-sm text-muted-foreground">{formattedTime}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SunEvent = ({
  className,
  text,
  icon,
}: {
  className?: string;
  text: string;
  icon: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "flex size-7 items-center justify-center rounded-full",
          className,
        )}
      >
        {icon}
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
};
