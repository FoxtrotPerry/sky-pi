import { isSameDay } from "date-fns";
import { ForecastCard } from "~/components/ForecastCard";
import { MiscCard } from "~/components/MiscCard";
import { MoonPhaseCard } from "~/components/MoonPhaseCard";
import { api } from "~/trpc/server";
import { MoonPhaseData } from "~/types/moonphase";

export default async function Home() {
  const clientGeoData = await api.forecast.getGeoData();
  const [
    { moonPhaseCycle, nextApexEvent },
    { rainChance, skyCover, snowChance, sunRsttData, temperature },
  ] = await Promise.all([
    api.forecast.getMoonPhases(),
    api.forecast.getLocalConditions({
      forecastParams: clientGeoData.gridpointForecastParams,
      riseSetParams: clientGeoData.riseSetTransitTimesParams,
    }),
  ]);

  const skyCoverForecasts = skyCover.slice(0, 3);

  const now = new Date();

  return (
    <div className="flex max-h-full w-full items-center justify-center align-middle">
      <div className="flex min-h-e-ink-height flex-col gap-1.5 p-1.5">
        {skyCoverForecasts.map((skyCoverForDay, i) => {
          let phaseEventOnDate: MoonPhaseData | undefined = undefined;
          if (nextApexEvent) {
            phaseEventOnDate = isSameDay(
              nextApexEvent.date,
              skyCoverForDay[0]?.validTime.date as Date,
            )
              ? phaseEventOnDate
              : undefined;
          }
          return (
            <ForecastCard
              key={`forecast-card-${i}`}
              skyCoverData={skyCoverForDay}
              rainChanceData={rainChance[i]}
              sunRsttData={sunRsttData[i]}
              phaseEventOnDate={phaseEventOnDate}
              now={now}
              tempForecast={temperature?.tempForecast[i]}
              className="border-2 border-slate-400 shadow-none"
            />
          );
        })}
        <div className="flex max-h-24 grow gap-1.5">
          <MoonPhaseCard
            moonPhaseCycle={moonPhaseCycle}
            className="w-1/2 border-2 border-slate-400 shadow-none"
          />
          <MiscCard
            className="w-1/2 border-2 border-slate-400 shadow-none"
            temperature={temperature?.currTemp}
            updateTime={new Date()}
          />
        </div>
      </div>
    </div>
  );
}
