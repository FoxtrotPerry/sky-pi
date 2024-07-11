import { ForecastCard } from "~/components/ForecastCard";
import { api } from "~/trpc/server";

export default async function Home() {
  const clientGeoData = await api.forecast.getGeoData();
  const [forecastQuery, moonPhaseQuery, skyCover] = await Promise.all([
    api.forecast.getForecast(clientGeoData),
    api.forecast.getMoonPhases(),
    api.forecast.getLocalSkycover(clientGeoData),
  ]);

  const threeDayForecast = skyCover.slice(0, 3);

  return (
    <main className="flex h-full max-h-full flex-row justify-center space-x-4 p-4 pt-4">
      {threeDayForecast.map((dayForecasts, i) => {
        return (
          <ForecastCard
            key={`forecast-card-${i}`}
            dayForecasts={dayForecasts}
          />
        );
      })}
    </main>
  );
}
