/**
 * Takes an ISO8601 duration, splits it into it's two components, and returns them.
 */

import { toZonedTime } from "date-fns-tz";
import type { GridpointForecastResp } from "~/types/forecast";
import type { JSONValue } from "~/types/json";

const durationComponentsAreValid = (
  parts: string[],
): parts is [string, string] => {
  return parts.length === 2 && parts.every((part) => typeof part === "string");
};

export const separateDuration = (dateStr: string) => {
  const durationComponents = dateStr.split("/");
  if (durationComponentsAreValid(durationComponents)) return durationComponents;
  throw Error(
    `argument given to 'separateDuration' was not valid, argument given: ${dateStr}`,
  );
};

export const getDateTransformer = (timezone: string) => {
  return (data: string) => {
    let resp: GridpointForecastResp | null = null;
    try {
      resp = JSON.parse(data, (key, value: JSONValue) => {
        if (key !== "validTime") return value;
        if (typeof value !== "string") return value;
        const [timestamp, duration] = separateDuration(value);
        return { date: toZonedTime(timestamp, timezone), duration };
      }) as GridpointForecastResp;
    } catch (error) {
      throw Error(
        `Error parsing forecast data in transformResponse - ${JSON.stringify(error)}`,
      );
    }
    return resp;
  };
};
