import { ForecastCard } from "~/components/ForecastCard";
import { api } from "~/trpc/server";

export default async function Home() {
  const [forecastQuery, moonPhaseQuery] = await Promise.all([
    api.forecast.getForecast({
      wfo: "BGM",
      x: 52,
      y: 104,
    }),
    api.forecast.getMoonPhases(),
  ]);

  // console.log(
  //   forecastQuery.data.properties.skyCover.values,
  //   moonPhaseQuery.data.phasedata,
  // );

  return (
    <main className="flex h-full max-h-full flex-row justify-center space-x-4 space-y-4 p-4">
      <ForecastCard />
    </main>
  );
}
