import { ForecastCard } from "~/components/ForecastCard";
import { MiscCard } from "~/components/MiscCard";
import { MoonPhaseCard } from "~/components/MoonPhaseCard";
import { api } from "~/trpc/server";

export default async function Home() {
  const clientGeoData = await api.forecast.getGeoData();
  const [moonPhaseCycle, skyCover] = await Promise.all([
    api.forecast.getMoonPhases(),
    api.forecast.getLocalSkycover(clientGeoData),
  ]);

  const skyCoverForecasts = skyCover.slice(0, 3);

  return (
    <div className="flex h-full max-h-full flex-row justify-center p-1.5 align-middle">
      <div className="flex flex-col gap-1.5">
        {skyCoverForecasts.map((skyCoverForDay, i) => {
          return (
            <ForecastCard
              key={`forecast-card-${i}`}
              skyCoverData={skyCoverForDay}
            />
          );
        })}
        <div className="flex grow gap-1.5">
          <MoonPhaseCard moonPhaseCycle={moonPhaseCycle} className="w-1/2" />
          <MiscCard className="w-1/2" updateTime={new Date()} />
        </div>
      </div>
    </div>
  );
}
