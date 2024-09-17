import { differenceInCalendarDays, isSameDay } from "date-fns";
import { ForecastCard } from "~/components/ForecastCard";
import { MiscCard } from "~/components/MiscCard";
import { MoonPhaseCard } from "~/components/MoonPhaseCard";
import { api } from "~/trpc/server";
import type { MoonPhaseData } from "~/types/moonphase";

export default async function Home() {
  const now = new Date();
  const clientGeoData = await api.forecast.getGeoData();
  const [moonPhases, localConditions, geomagneticForecast] = await Promise.all([
    clientGeoData ? api.forecast.getMoonPhases() : null,
    clientGeoData
      ? api.forecast.getLocalConditions({
          forecastParams: clientGeoData.gridpointForecastParams,
          riseSetParams: clientGeoData.riseSetTransitTimesParams,
        })
      : null,
    clientGeoData
      ? api.forecast.getThreeDayGeomagneticForecast({
          timezone: clientGeoData.gridpointForecastParams.timeZone,
          now,
        })
      : null,
  ]);

  const skyCoverForecasts = localConditions?.skyCover.slice(0, 3);

  const requestOk = {
    moonPhases: !!moonPhases,
    localConditions: !!localConditions,
    geomagneticForecast: !!geomagneticForecast,
  };

  console.log("Request OK", requestOk);

  const canShowForecastCards = !!skyCoverForecasts && !!localConditions;
  const canShowBottomCards = !!moonPhases || !!localConditions;

  // the first day of geomagnetic forecasts is not guaranteed to be today, so we need
  //  to calculate the difference so we can adjust when accessing the forecast data
  const firstGeomagneticForecastDay = geomagneticForecast?.at(0)?.at(0)?.time;
  const geomagneticForecastDayDiff = firstGeomagneticForecastDay
    ? differenceInCalendarDays(now, firstGeomagneticForecastDay)
    : 0;

  return (
    <div className="flex max-h-full w-full items-center justify-center align-middle">
      <div className="flex min-h-e-ink-height flex-col gap-1.5 p-1.5">
        {canShowForecastCards &&
          skyCoverForecasts.map((skyCoverForDay, i) => {
            let phaseEventOnDate: MoonPhaseData | undefined = undefined;
            const nextApexEvent = moonPhases?.nextApexEvent;
            if (nextApexEvent) {
              const firstSkyCoverOfDay = skyCoverForDay[0];
              if (!firstSkyCoverOfDay) {
                throw new Error("Expected sky cover data for day");
              }
              const onSameDay =
                nextApexEvent.date &&
                isSameDay(
                  nextApexEvent.date,
                  firstSkyCoverOfDay.validTime.date,
                );
              if (onSameDay) {
                phaseEventOnDate = nextApexEvent;
              }
            }

            return (
              <ForecastCard
                key={`forecast-card-${i}`}
                skyCoverData={skyCoverForDay}
                rainChanceData={localConditions.rainChance?.at(i)}
                sunRsttData={localConditions.sunRsttData?.at(i)}
                phaseEventOnDate={phaseEventOnDate}
                now={now}
                tempForecast={localConditions.temperature?.tempForecast?.at(i)}
                auroraForecastsForDay={geomagneticForecast?.at(
                  i + geomagneticForecastDayDiff,
                )}
                className="border-2 border-slate-400 shadow-none"
              />
            );
          })}
        {canShowBottomCards && (
          <div className="flex max-h-24 grow gap-1.5">
            {moonPhases && (
              <MoonPhaseCard
                moonPhaseCycle={moonPhases}
                className="w-1/2 border-2 border-slate-400 shadow-none"
              />
            )}
            {localConditions?.temperature && (
              <MiscCard
                className="w-1/2 border-2 border-slate-400 shadow-none"
                temperature={localConditions.temperature.currTemp}
                updateTime={new Date()}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
