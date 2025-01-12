export interface SunPhaseRequestParams {
  lat: string;
  lng: string;
  /**
   * Ex: America/New_York
   */
  tzid: string;
  /**
   * format: YYYY-MM-DD
   */
  date: string;
  /**
   * 0 or 1. (1 is default)
   * Time values in response will be expressed following ISO 8601 and day_length will be expressed in seconds.
   */
  formatted?: string;
}

export type FormattedDayTime = `${number}:${number}:${number} ${"AM" | "PM"}`;
type StatusCode =
  | "OK"
  | "INVALID_REQUEST"
  | "INVALID_DATE"
  | "UNKNOWN_ERROR"
  | "INVALID_TZID";

/**
 * @example
 *{
    "results": {
      "sunrise": "7:32:55 AM",
      "sunset": "4:52:27 PM",
      "solar_noon": "12:12:41 PM",
      "day_length": "09:19:32",
      "civil_twilight_begin": "7:02:55 AM",
      "civil_twilight_end": "5:22:27 PM",
      "nautical_twilight_begin": "6:27:38 AM",
      "nautical_twilight_end": "5:57:44 PM",
      "astronomical_twilight_begin": "5:53:29 AM",
      "astronomical_twilight_end": "6:31:53 PM"
    },
    "status": "OK",
    "tzid": "America/New_York"
  }
 */
export interface SunPhaseRequestResponse {
  results: {
    sunrise: FormattedDayTime;
    sunset: FormattedDayTime;
    solar_noon: FormattedDayTime;
    day_length: `${number}:${number}:${number}`;
    civil_twilight_begin: FormattedDayTime;
    civil_twilight_end: FormattedDayTime;
    nautical_twilight_begin: FormattedDayTime;
    nautical_twilight_end: FormattedDayTime;
    astronomical_twilight_begin: FormattedDayTime;
    astronomical_twilight_end: FormattedDayTime;
  };
  status: StatusCode;
  tzid: string;
}
