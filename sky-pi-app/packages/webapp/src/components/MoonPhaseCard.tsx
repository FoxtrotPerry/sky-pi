import { Circle } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import type { MoonPhaseCycle, MoonPhaseData } from "~/types/moonphase";
import { format, formatDistanceStrict, intervalToDuration } from "date-fns";
import type { ReactNode } from "react";
import { cn } from "~/lib/utils/ui";

type MoonPhaseCardProps = React.HTMLAttributes<HTMLDivElement> & {
  moonPhaseCycle: MoonPhaseCycle;
};

type MoonDetailsProps = {
  phaseData: MoonPhaseData;
  children: ReactNode;
};

const PhaseDetails = ({ phaseData, children }: MoonDetailsProps) => {
  const temporalDistance = formatDistanceStrict(new Date(), phaseData.date);

  return (
    <div className="flex flex-col items-center justify-center gap-2 gap-y-0">
      <div className="flex flex-row items-center gap-x-1">
        {children}
        <h3 className="text-2xl">{phaseData.name}</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        {`${format(phaseData.date, "ccc, MMM do")} (in ${temporalDistance})`}
      </p>
    </div>
  );
};

export const MoonPhaseCard = ({
  moonPhaseCycle,
  className,
  ...props
}: MoonPhaseCardProps) => {
  const { newMoon, fullMoon } = moonPhaseCycle;

  return (
    <Card className={cn("grow", className)} {...props}>
      <CardContent className="flex h-full justify-around gap-3 space-y-0.5 px-3 py-1.5">
        {newMoon && (
          <PhaseDetails phaseData={newMoon}>
            <Circle size={24} className="fill-slate-600 stroke-slate-700" />
          </PhaseDetails>
        )}
        {fullMoon && (
          <PhaseDetails phaseData={fullMoon}>
            <Circle size={24} className="fill-slate-100 stroke-slate-700" />
          </PhaseDetails>
        )}
      </CardContent>
    </Card>
  );
};
