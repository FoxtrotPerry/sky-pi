import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "./ui/button";
import type { NWSDataPoint } from "~/types/forecast";
import { format } from "date-fns";
import { Square } from "lucide-react";
import { percentToSkyShade } from "~/lib/utils/tailwind";

type ForecastCardProps = {
  skyCoverData: NWSDataPoint[];
};

export const ForecastCard = ({ skyCoverData }: ForecastCardProps) => {
  const day = skyCoverData[0]?.validTime.date;
  if (day === undefined) return;
  const dayOfWeek = format(day, "EEEE");
  const date = format(day, "yyyy / MM / dd");
  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>{dayOfWeek}</CardTitle>
        <CardDescription>{date}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 gap-x-6">
          {skyCoverData.map((forecast) => {
            const shade = percentToSkyShade(forecast?.value ?? 50);
            return (
              <Square
                key={`sky-cover-${forecast?.validTime.date.valueOf()}`}
                className={`fill-slate-${shade}`}
              />
            );
          })}
        </div>
      </CardContent>
      <CardFooter>
        <Button>Shoo clouds away</Button>
      </CardFooter>
    </Card>
  );
};
