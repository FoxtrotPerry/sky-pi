import { format } from "date-fns";
import { Sunrise, Sunset } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { toFahrenheit } from "~/lib/utils/math";
import { formatMilitaryTime } from "~/lib/utils/string";
import { cn } from "~/lib/utils/ui";
import type { DayTime } from "~/types/riseSetTransitTimes";

type MiscCardProps = React.HTMLAttributes<HTMLDivElement> & {
  updateTime: Date;
  /** temp in fahrenheit */
  temperature?: number;
  sunsetToday?: DayTime;
  sunriseToday?: DayTime;
};

export const MiscCard = ({
  updateTime,
  temperature,
  className,
  sunsetToday,
  sunriseToday,
  ...props
}: MiscCardProps) => {
  const formattedTime = format(updateTime, "p");
  const updateText = `Updated at ${formattedTime}`;
  const formattedTemperature = temperature
    ? `${toFahrenheit(temperature)}°`
    : "N/A";
  const formattedSunrise = formatMilitaryTime(sunriseToday);
  const formattedSunset = formatMilitaryTime(sunsetToday);
  return (
    <Card className={cn(className)} {...props}>
      <CardContent className="flex h-full items-center justify-between space-y-0.5 px-3 py-1.5">
        <div className="flex h-full flex-col justify-around">
          {
            // TODO: Make a separate component from these two sun event divs
          }
          {sunriseToday && (
            <div className="flex items-center gap-1">
              <div className="sun-event-gradient flex size-8 items-center justify-center rounded-full">
                <Sunrise size={20} />
              </div>
              <p className="text-2xl">{formattedSunrise}</p>
            </div>
          )}
          {sunsetToday && (
            <div className="flex items-center gap-1">
              <div className="sun-event-gradient flex size-8 items-center justify-center rounded-full">
                <Sunset size={20} />
              </div>
              <p className="text-2xl">{formattedSunset}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <h2 className="text-end text-5xl font-semibold">
            {formattedTemperature}
          </h2>
          <p className="text-muted-foreground">{updateText}</p>
        </div>
      </CardContent>
    </Card>
  );
};
