import type {
  ScaleResponse,
  FormattedScaleResponse,
  DailyScales,
} from "~/types/swpcScales";
import { toZonedTime } from "date-fns-tz";

export const keyToIndex = (key: keyof FormattedScaleResponse) => {
  if (key === "previousDay") return -1;
  if (key === "currentDay") return 0;
  if (key === "nextDay") return 1;
  if (key === "day2") return 2;
  if (key === "day3") return 3;
};

export const indexToKey = (index: number): keyof FormattedScaleResponse => {
  if (index === -1) return "previousDay";
  if (index === 0) return "currentDay";
  if (index === 1) return "nextDay";
  if (index === 2) return "day2";
  if (index === 3) return "day3";
  return "currentDay";
};

const datePartsToDate = (
  dateStamp: DailyScales["DateStamp"],
  timeStamp: DailyScales["TimeStamp"],
) => {
  const [year, month, day] = dateStamp.split("-").map(Number);
  const [hour, minute, second] = timeStamp.split(":").map(Number);
  return toZonedTime(
    new Date(year!, month! - 1, day, hour, minute, second),
    "America/New_York",
  );
};

export const formatScaleResponse = (
  rawResponse: ScaleResponse,
): FormattedScaleResponse => {
  return {
    previousDay: {
      date: datePartsToDate(
        rawResponse["-1"].DateStamp,
        rawResponse["-1"].TimeStamp,
      ),
      radioBlackout: rawResponse["-1"].R,
      solarRadiation: rawResponse["-1"].S,
      geomagneticStorming: rawResponse["-1"].G,
    },
    currentDay: {
      date: datePartsToDate(
        rawResponse["0"].DateStamp,
        rawResponse["0"].TimeStamp,
      ),
      radioBlackout: rawResponse["0"].R,
      solarRadiation: rawResponse["0"].S,
      geomagneticStorming: rawResponse["0"].G,
    },
    nextDay: {
      date: datePartsToDate(
        rawResponse["1"].DateStamp,
        rawResponse["1"].TimeStamp,
      ),
      radioBlackout: rawResponse["1"].R,
      solarRadiation: rawResponse["1"].S,
      geomagneticStorming: rawResponse["1"].G,
    },
    day2: {
      date: datePartsToDate(
        rawResponse["2"].DateStamp,
        rawResponse["2"].TimeStamp,
      ),
      radioBlackout: rawResponse["2"].R,
      solarRadiation: rawResponse["2"].S,
      geomagneticStorming: rawResponse["2"].G,
    },
    day3: {
      date: datePartsToDate(
        rawResponse["3"].DateStamp,
        rawResponse["3"].TimeStamp,
      ),
      radioBlackout: rawResponse["3"].R,
      solarRadiation: rawResponse["3"].S,
      geomagneticStorming: rawResponse["3"].G,
    },
  };
};
