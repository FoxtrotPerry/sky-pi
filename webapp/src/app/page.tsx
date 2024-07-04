import { ForecastCard } from "~/components/ForecastCard";
import { api } from "~/trpc/server";
import { Temporal } from 'temporal-polyfill';

export default async function Home() {

  const clientGeoData = await api.forecast.getGeoData();
  const [forecastQuery, moonPhaseQuery] = await Promise.all([
    api.forecast.getForecast(clientGeoData),
    api.forecast.getMoonPhases(),
  ]);

  // console.log(
  //   forecastQuery.data.properties.skyCover.values.slice(0,10)
  // );

  // console.log(parseISO('2024-06-30T05:00:00+00:00/PT3H'));
  const duration = Temporal.Duration.from('PT3H');
  const instant = Temporal.Instant.from('2024-06-30T05:00:00+00:00');
  const newInstant = instant.add(duration);
  console.log(instant.toString(), newInstant.toString())

  return (
    <main className="flex h-full max-h-full flex-row justify-center space-x-4 space-y-4 p-4">
      <ForecastCard />
    </main>
  );
}
