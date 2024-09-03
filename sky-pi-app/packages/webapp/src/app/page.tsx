import { ForecastCard } from "~/components/ForecastCard";
import { MiscCard } from "~/components/MiscCard";
import { MoonPhaseCard } from "~/components/MoonPhaseCard";
import { api } from "~/trpc/server";

export default async function Home() {
  const clientGeoData = await api.forecast.getGeoData();
  const [moonPhaseCycle, dayData] = await Promise.all([
    api.forecast.getMoonPhases(),
    api.forecast.getLocalConditions({
      forecastParams: clientGeoData.gridpointForecastParams,
      riseSetParams: clientGeoData.riseSetTransitTimesParams,
    }),
  ]);

  const skyCoverForecasts = dayData.skyCover.slice(0, 3);
  const sunRsttData = dayData.rsttData.map(
    (rstt) => rstt.properties.data.sundata,
  );

  return (
    <div className="flex max-h-full w-full items-center justify-center align-middle">
      <div className="flex min-h-e-ink-height flex-col gap-1.5 p-1.5">
        {skyCoverForecasts.map((skyCoverForDay, i) => {
          const sunRsttDataForDay = sunRsttData[i];
          return (
            <ForecastCard
              key={`forecast-card-${i}`}
              skyCoverData={skyCoverForDay}
              sunRsttData={sunRsttDataForDay}
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
            temperature={dayData.currTemp}
            updateTime={new Date()}
          />
        </div>
      </div>
    </div>
  );
}
