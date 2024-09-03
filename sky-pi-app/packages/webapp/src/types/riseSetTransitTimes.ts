import z from "zod";
import { MoonPhase } from "./moonphase";

type TzOffset = `${number}`;

export const zRiseSetTransitTimesParams = z.object({
  date: z.string().date(),
  coords: z.string(),
  tz: z.string(),
  dst: z.boolean(),
});

export type RiseSetTransitTimesParams = z.infer<
  typeof zRiseSetTransitTimesParams
>;

// export type RiseSetTransitTimesParams = {
//   /** Ex: 2024-09-02 */
//   date: `${number}-${number}-${number}`;
//   /**
//    * Latitude, Longitude
//    * @example 44.18270462193836, -73.96617121784084
//    * */
//   coords: `${number},${number}`;
//   /**
//    * Timezone
//    * @example "-4"
//    */
//   tz: TzOffset;
//   dst: boolean;
// };

type DayTime = `${number}:${number}`;

type MoonTransitEvent = "Rise" | "Upper Transit" | "Set";

type SunTransitEvent =
  | MoonTransitEvent
  | "Begin Civil Twilight"
  | "End Civil Twilight";

export type RiseSetTransitTimesResp = {
  apiversion: string;
  geometry: {
    coordinates: [number, number];
    type: "Point";
  };
  properties: {
    data: {
      closestphase: {
        day: number;
        month: number;
        phase: MoonPhase;
        time: DayTime;
        year: number;
      };
      curphase: MoonPhase;
      day: number;
      day_of_week: "Monday";
      fracillum: `${number}%`;
      isdst: boolean;
      label: null;
      month: number;
      moondata: {
        phen: MoonTransitEvent;
        time: DayTime;
      }[];
      sundata: {
        phen: SunTransitEvent;
        time: DayTime;
      }[];
      tz: TzOffset;
      year: number;
    };
  };
  type: string;
};
