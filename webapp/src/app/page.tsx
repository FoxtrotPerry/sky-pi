import { ForecastCard } from "~/components/ForecastCard";
import { api } from "~/trpc/server";

export default async function Home() {
  const clientGeoData = await api.forecast.getGeoData();
  const [moonPhaseQuery, skyCover] = await Promise.all([
    api.forecast.getMoonPhases(),
    api.forecast.getLocalSkycover(clientGeoData),
  ]);

  const skyCoverForecasts = skyCover.slice(0, 3);

  return (
    <main className="flex h-full max-h-full flex-row justify-center p-4 align-middle">
      <div className="grid grid-rows-3 gap-4">
        {skyCoverForecasts.map((skyCoverForDay, i) => {
          return (
            <ForecastCard
              key={`forecast-card-${i}`}
              skyCoverData={skyCoverForDay}
            />
          );
        })}
      </div>
    </main>
  );
}
