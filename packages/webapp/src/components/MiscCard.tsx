import { format, isToday } from "date-fns";
import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils/ui";

type MiscCardProps = React.HTMLAttributes<HTMLDivElement> & {
  updateTime: Date;
};

export const MiscCard = ({
  updateTime,
  className,
  ...props
}: MiscCardProps) => {
  const updateFromToday = isToday(updateTime);
  const updateText = `${updateFromToday ? "Today" : "Yesterday"}, at ${format(updateTime, "p")}`;
  return (
    <Card className={cn("grow", className)} {...props}>
      <CardContent className="flex h-full items-center space-y-0.5 px-3 py-1.5">
        <div className="flex h-full flex-col justify-center">
          <h3 className="text-xl">Updated At</h3>
          <p className="text-muted-foreground">{updateText}</p>
        </div>
      </CardContent>
    </Card>
  );
};
