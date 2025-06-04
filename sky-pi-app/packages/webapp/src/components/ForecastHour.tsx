import { cn } from "~/lib/utils/ui";

export const ForecastHour = ({
  className,
  forecastDate,
  shouldHighlight,
  isCurrentHour,
  auroraKp = 0,
  hour,
  value,
  shade,
  duringSunRiseOrSet,
  duringNightTime,
  Icon,
}: {
  className?: string;
  forecastDate: Date;
  shouldHighlight: boolean;
  isCurrentHour: boolean;
  auroraKp?: number;
  hour: number;
  value: number;
  shade: number;
  duringSunRiseOrSet?: boolean;
  duringNightTime?: boolean;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) => {
  const hasAuroraActivity = auroraKp > 5;

  // Determine the intensity of the glow
  let auroraClass = "";
  if (hasAuroraActivity) {
    const intensity = Math.round(auroraKp);
    if (intensity >= 9) {
      auroraClass = "aurora-intensity-kp9";
    } else {
      auroraClass = `aurora-intensity-kp${intensity}`;
    }
  }

  return (
    <div
      key={`sky-cover-${forecastDate.valueOf()}`}
      className={cn("flex flex-col items-center gap-1.5", className)}
    >
      <div
        className={cn(
          "flex flex-col items-center justify-end rounded-lg bg-gradient-to-t",
          shouldHighlight && "from-white to-slate-500",
          isCurrentHour && "from-white to-slate-900",
        )}
      >
        <p
          className={cn(
            "text-slate-500",
            (shouldHighlight || isCurrentHour) && "text-slate-100",
            shouldHighlight && "font-bold",
          )}
        >
          {hour % 12 === 0 ? 12 : hour % 12}
        </p>
        <div
          className={cn(
            "flex flex-col items-center rounded-lg bg-white p-0.5",
            shouldHighlight && "bg-slate-200",
            duringSunRiseOrSet && "bg-amber-400",
            duringNightTime && "bg-sky-950",
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
      {/* Aurora Chip */}
      <div
        className={cn(
          "h-2 w-full rounded-sm",
          hasAuroraActivity
            ? auroraClass
            : "border-2 border-gray-400 bg-gray-200",
          auroraKp === 0 && "bg-none",
        )}
      />
    </div>
  );
};
