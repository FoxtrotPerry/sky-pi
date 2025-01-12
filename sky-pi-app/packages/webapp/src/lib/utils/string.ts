import type { DayTime } from "~/types/riseSetTransitTimes";
import { type FormattedDayTime } from "~/types/sunPhase";

export const upperCaseFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Formats military time strings to AM/PM time
 */
export const formatMilitaryTime = (time?: DayTime) => {
  if (!time) return null;
  const splitTime = time.split(":");
  const hour = Number(splitTime[0]);
  const minute = splitTime[1];
  if (hour > 0 && hour < 13) {
    return `${hour}:${minute} AM`;
  } else {
    return `${hour - 12}:${minute} PM`;
  }
};

export const removeSeconds = (dayTime?: FormattedDayTime) => {
  if (!dayTime) return null;
  const splitDayTime = dayTime.split(":");
  const [hour, minute] = splitDayTime;
  const amOrPm = splitDayTime.at(-1)?.slice(-2);
  return `${hour}:${minute} ${amOrPm}`;
};
