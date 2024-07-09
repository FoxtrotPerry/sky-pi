import { ForecastCard } from "~/components/ForecastCard";
import { api } from "~/trpc/server";

export default async function Home() {

  const clientGeoData = await api.forecast.getGeoData();
  const [forecastQuery, moonPhaseQuery, skyCoverQuery] = await Promise.all([
    api.forecast.getForecast(clientGeoData),
    api.forecast.getMoonPhases(),
    api.forecast.getLocalSkycover(clientGeoData),
  ]);

  return (
    <main className="flex h-full max-h-full flex-row justify-center space-x-4 space-y-4 p-4">
      <ForecastCard />
      <ForecastCard />
      <ForecastCard />
    </main>
  );
}
