import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "./ui/button";
import { type NWSDataPoint } from "~/types/forecast";
import { format } from "date-fns";

type ForecastCardProps = {
  dayForecasts: NWSDataPoint[];
};

export const ForecastCard = ({dayForecasts}: ForecastCardProps) => {
  const day = dayForecasts[0]?.validTime;
  if (day === undefined) return;
  const dayOfWeek = format(day, 'EEEE');
  const date = format(day, 'yyyy / MM / dd');
  return (
    <Card className="p-4">
      <CardHeader>
      <CardTitle>{dayOfWeek}</CardTitle>
      <CardDescription>{date}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button>Shoo clouds away</Button>
      </CardContent>
    </Card>
  );
};
