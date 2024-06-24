import { Button } from "~/components/ui/button";
import { api } from "~/trpc/server";

export default async function Home() {
  const forecastQuery = await api.forecast.get();

  console.log(forecastQuery.data);

  return (
    <main>
      <Button>Press to shoo clouds away</Button>
    </main>
  );
}
