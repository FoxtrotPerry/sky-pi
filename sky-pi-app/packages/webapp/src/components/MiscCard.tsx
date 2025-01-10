import { format, isToday } from "date-fns";
import { Card, CardContent } from "~/components/ui/card";
import { toFahrenheit } from "~/lib/utils/math";
import { cn } from "~/lib/utils/ui";

type MiscCardProps = React.HTMLAttributes<HTMLDivElement> & {
  updateTime: Date;
  /** temp in fahrenheit */
  temperature?: number;
};

export const MiscCard = ({
  updateTime,
  temperature,
  className,
  ...props
}: MiscCardProps) => {
  const updateFromToday = isToday(updateTime);
  const updateText = `${updateFromToday ? "Today" : "Yesterday"}, at ${format(updateTime, "p")}`;
  const formattedTemperature = temperature
    ? `${toFahrenheit(temperature)}°`
    : "N/A";
  return (
    <Card className={cn(className)} {...props}>
      <CardContent className="flex h-full items-center justify-between space-y-0.5 px-3 py-1.5">
        <div className="flex h-full flex-col justify-center">
          <h3 className="text-xl">Updated At</h3>
          <p className="text-muted-foreground">{updateText}</p>
        </div>
        <div>
          <h2 className="text-5xl font-semibold">{formattedTemperature}</h2>
        </div>
      </CardContent>
    </Card>
  );
};
