import { ForecastCard } from "~/components/ForecastCard";
import { MiscCard } from "~/components/MiscCard";
import { MoonPhaseCard } from "~/components/MoonPhaseCard";
import { api } from "~/trpc/server";

export default async function Home() {
  const clientGeoData = await api.forecast.getGeoData();
  const [moonPhaseCycle, skyCover] = await Promise.all([
    api.forecast.getMoonPhases(),
    api.forecast.getLocalSkyCover(clientGeoData),
  ]);

  const skyCoverForecasts = skyCover.slice(0, 3);

  return (
    <div className="flex max-h-full w-full items-center justify-center align-middle">
      <div className="flex min-h-e-ink-height flex-col gap-1.5 p-1.5">
        {skyCoverForecasts.map((skyCoverForDay, i) => {
          return (
            <ForecastCard
              key={`forecast-card-${i}`}
              skyCoverData={skyCoverForDay}
            />
          );
        })}
        <div className="flex max-h-24 grow gap-1.5">
          <MoonPhaseCard moonPhaseCycle={moonPhaseCycle} className="w-1/2" />
          <MiscCard className="w-1/2" updateTime={new Date()} />
        </div>
      </div>
    </div>
  );
}
