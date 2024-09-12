import { Badge } from "./ui/badge";
import { Moon, AudioWaveform } from "lucide-react";
import { toFahrenheit } from "~/lib/utils/math";
import { upperCaseFirstLetter } from "~/lib/utils/string";
import { cn } from "~/lib/utils/ui";
import type { TemperatureForecast } from "~/types/forecast";
import type { MoonPhaseData } from "~/types/moonphase";
import type { DailyScalesFormatted } from "~/types/swpcScales";

type ForecastBadgesProps = React.HTMLAttributes<HTMLDivElement> & {
  phaseEventOnDate?: MoonPhaseData;
  tempForecast?: TemperatureForecast;
  spaceWeather?: DailyScalesFormatted;
};

export const ForecastBadges = ({
  className,
  phaseEventOnDate,
  tempForecast,
  spaceWeather,
}: ForecastBadgesProps) => {
  const geomagneticStormingScale = Number(
    spaceWeather?.geomagneticStorming.Scale,
  );
  const significantGeomagneticStorming = geomagneticStormingScale >= 2;
  const canShowAuroraNotice =
    significantGeomagneticStorming && spaceWeather?.geomagneticStorming.Text;

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
            geomagneticStormingScale >= 2 &&
              "from-purple-700 via-blue-700 to-emerald-700",
            geomagneticStormingScale >= 4 &&
              "from-purple-500 via-blue-500 to-emerald-500",
          )}
        >
          <AudioWaveform size={16} />
          <p className="font-bold">
            {`${upperCaseFirstLetter(
              spaceWeather.geomagneticStorming.Text!,
            )} Geomagnetic Storming`}
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
