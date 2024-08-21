import { format, isToday } from "date-fns";
import { Card, CardContent } from "~/components/ui/card";
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
  return (
    <Card className={cn("flex-grow", className)} {...props}>
      <CardContent className="flex h-full items-center justify-between space-y-0.5 px-3 py-1.5">
        <div className="flex h-full flex-col justify-center">
          <h3 className="text-xl">Updated At</h3>
          <p className="text-muted-foreground">{updateText}</p>
        </div>
        <div>
          <h2 className="text-5xl font-semibold">
            {temperature ? `${Math.round(temperature * 1.8 + 32)}°` : "N/A"}
          </h2>
        </div>
      </CardContent>
    </Card>
  );
};
