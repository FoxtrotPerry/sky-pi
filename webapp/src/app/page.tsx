import { Button } from "~/components/ui/button";
import { api } from "~/trpc/server";

export default async function Home() {
  const forecastQuery = await api.forecast.get({ wfo: "BGM", x: 52, y: 104 });
  const moonPhaseQuery = await api.moonPhase.get();

  console.log(forecastQuery.data.properties.skyCover.values);
  console.log(moonPhaseQuery.data);

  return (
    <main>
      <Button>Press to shoo clouds away</Button>
    </main>
  );
}
