import { Button } from "~/components/ui/button";
import { Card, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/server";

export default async function Home() {
  const forecastQuery = await api.forecast.get({ wfo: "BGM", x: 52, y: 104 });
  const moonPhaseQuery = await api.moonPhase.get();

  console.log(forecastQuery.data.properties.skyCover.values);
  console.log(moonPhaseQuery.data);

  return (
    <main className="flex justify-center flex-row space-x-4 space-y-4 p-4 h-full max-h-full">
      <Button>Shoo clouds away</Button>
      <Card className="p-4">
        <CardTitle>
          Forecast
        </CardTitle>
      </Card>
    </main>
  );
}
