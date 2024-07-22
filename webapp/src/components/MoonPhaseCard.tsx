import { Circle } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import type { MoonPhaseCycle, MoonPhaseData } from "~/types/moonphase";
import { format } from "date-fns";
import type { ReactNode } from "react";

type MoonPhaseCardProps = {
  moonPhaseCycle: MoonPhaseCycle;
};

type MoonDetailsProps = {
  phaseData: MoonPhaseData;
  children: ReactNode;
};

const PhaseDetails = ({ phaseData, children }: MoonDetailsProps) => {
  return (
    <div className="flex items-center gap-2">
      {children}
      <div>
        <h3 className="text-xl">{phaseData.name}</h3>
        <p className="text-muted-foreground">
          {format(phaseData.date, "ccc, MMM do")}
        </p>
      </div>
    </div>
  );
};

export const MoonPhaseCard = ({ moonPhaseCycle }: MoonPhaseCardProps) => {
  const { newMoon, firstQuarter, fullMoon, lastQuarter } = moonPhaseCycle;

  return (
    <Card className="grow">
      <CardContent className="flex h-full justify-evenly gap-3 space-y-0.5 px-3 py-1.5">
        {newMoon && (
          <PhaseDetails phaseData={newMoon}>
            <Circle size={48} className="fill-slate-600 stroke-slate-700" />
          </PhaseDetails>
        )}
        {fullMoon && (
          <PhaseDetails phaseData={fullMoon}>
            <Circle size={48} className="fill-slate-100 stroke-slate-200" />
          </PhaseDetails>
        )}
      </CardContent>
    </Card>
  );
};
