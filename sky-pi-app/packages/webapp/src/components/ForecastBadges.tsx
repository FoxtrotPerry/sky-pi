import { Badge } from "./ui/badge";
import { Moon, AudioWaveform } from "lucide-react";
import { toFahrenheit } from "~/lib/utils/math";
import { cn } from "~/lib/utils/ui";
import type { TemperatureForecast } from "~/types/forecast";
import type { MoonPhaseData } from "~/types/moonphase";
import type { KpForecast } from "~/types/swpc";

type ForecastBadgesProps = React.HTMLAttributes<HTMLDivElement> & {
  phaseEventOnDate?: MoonPhaseData;
  tempForecast?: TemperatureForecast;
  auroraForecast?: KpForecast;
};

export const ForecastBadges = ({
  className,
  phaseEventOnDate,
  tempForecast,
  auroraForecast,
}: ForecastBadgesProps) => {
  const auroraKpIndex = auroraForecast?.value ?? 0;
  const significantGeomagneticStorming = auroraKpIndex >= 6;
  const canShowAuroraNotice =
    significantGeomagneticStorming && auroraForecast?.severity;

  return (
    <div className={cn("flex flex-row gap-2", className)}>
      {phaseEventOnDate && (
        <Badge
          className={cn(
            "flex items-center gap-1 border-0 bg-gradient-to-r",
            phaseEventOnDate.name === "New Moon" && "from-indigo-500",
            phaseEventOnDate.name === "Full Moon" && "from-cyan-600",
          )}
        >
          <Moon size={16} />
          <p className="font-bold">{phaseEventOnDate.name}</p>
        </Badge>
      )}
      {canShowAuroraNotice && (
        <Badge
          className={cn(
            "from-in-lch to-in-lch flex items-center gap-1 border-0 bg-gradient-to-r",
            auroraKpIndex >= 5 && "from-purple-700 via-blue-700 to-emerald-700",
            auroraKpIndex >= 7 && "from-purple-500 via-blue-500 to-emerald-500",
          )}
        >
          <AudioWaveform size={16} />
          <p className="font-bold">
            {`${auroraForecast.severity.text} Geomagnetic Storming (${auroraForecast.severity.scale})`}
          </p>
        </Badge>
      )}
      {tempForecast && (
        <div className="flex items-center">
          <h3 className="text-xl font-semibold leading-none tracking-tight">{`${toFahrenheit(tempForecast.low)}° - ${toFahrenheit(tempForecast.high)}°`}</h3>
        </div>
      )}
    </div>
  );
};
