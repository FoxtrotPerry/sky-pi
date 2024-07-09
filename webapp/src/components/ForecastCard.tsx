import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Button } from "./ui/button";

// type ForecastCardProps = {

// }

export const ForecastCard = () => {
  return (
    <Card className="p-4">
      <CardTitle>Forecast</CardTitle>
      <CardContent>
        <Button>Shoo clouds away</Button>
      </CardContent>
    </Card>
  );
};
