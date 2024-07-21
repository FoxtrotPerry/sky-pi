import { Circle } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { type RawMoonPhaseData } from "~/types/moonphase";

type MoonPhaseCardProps = {
  phaseData: RawMoonPhaseData["phasedata"];
};

export const MoonPhaseCard = ({ phaseData }: MoonPhaseCardProps) => {
  return (
    <Card className="grow">
      <CardContent className="space-y-0.5 px-3 py-1.5">
        <Circle className="fill-slate-700 stroke-slate-500" />
      </CardContent>
    </Card>
  );
};
