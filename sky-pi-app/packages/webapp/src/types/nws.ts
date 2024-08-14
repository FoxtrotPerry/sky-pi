import z from "zod";

/**
 * All currently available weather forecast offices
 */
const wfoOptions = [
  "AKQ",
  "ALY",
  "BGM",
  "BOX",
  "BTV",
  "BUF",
  "CAE",
  "CAR",
  "CHS",
  "CLE",
  "CTP",
  "GSP",
  "GYX",
  "ILM",
  "ILN",
  "LWX",
  "MHX",
  "OKX",
  "PBZ",
  "PHI",
  "RAH",
  "RLX",
  "RNK",
  "ABQ",
  "AMA",
  "BMX",
  "BRO",
  "CRP",
  "EPZ",
  "EWX",
  "FFC",
  "FWD",
  "HGX",
  "HUN",
  "JAN",
  "JAX",
  "KEY",
  "LCH",
  "LIX",
  "LUB",
  "LZK",
  "MAF",
  "MEG",
  "MFL",
  "MLB",
  "MOB",
  "MRX",
  "OHX",
  "OUN",
  "SHV",
  "SJT",
  "SJU",
  "TAE",
  "TBW",
  "TSA",
  "ABR",
  "APX",
  "ARX",
  "BIS",
  "BOU",
  "CYS",
  "DDC",
  "DLH",
  "DMX",
  "DTX",
  "DVN",
  "EAX",
  "FGF",
  "FSD",
  "GID",
  "GJT",
  "GLD",
  "GRB",
  "GRR",
  "ICT",
  "ILX",
  "IND",
  "IWX",
  "JKL",
  "LBF",
  "LMK",
  "LOT",
  "LSX",
  "MKX",
  "MPX",
  "MQT",
  "OAX",
  "PAH",
  "PUB",
  "RIW",
  "SGF",
  "TOP",
  "UNR",
  "BOI",
  "BYZ",
  "EKA",
  "FGZ",
  "GGW",
  "HNX",
  "LKN",
  "LOX",
  "MFR",
  "MSO",
  "MTR",
  "OTX",
  "PDT",
  "PIH",
  "PQR",
  "PSR",
  "REV",
  "SEW",
  "SGX",
  "SLC",
  "STO",
  "TFX",
  "TWC",
  "VEF",
  "AER",
  "AFC",
  "AFG",
  "AJK",
  "ALU",
  "GUM",
  "HPA",
  "HFO",
  "PPG",
  "STU",
  "NH1",
  "NH2",
  "ONA",
  "ONP",
] as const;

export const zWfoEnum = z.enum(wfoOptions);

/**
 * All currently available weather forecast offices
 */
export type wfo = z.infer<typeof zWfoEnum>;

export const zPhenomenon = z.enum([
  "BZ", // Blizzard
  "WS", // Winter Storm
  "WW", // Winter Weather
  "LE", // Lake Effect Snow
  "IS", // Ice Storm
  "WC", // Wind Chill
  "SQ", // Snow Squall
  "DU", // Blowing Dust
  "DS", // Dust Storm
  "WI", // Wind
  "HW", // High Wind
  "LW", // Lake Wind
  "SM", // Dense Smoke (land)
  "FG", // Dense Fog (land)
  "ZF", // Freezing Fog
  "HZ", // Hard Freeze
  "FZ", // Freeze
  "FR", // Frost
  "HT", // Heat
  "EH", // Excessive Heat
  "EC", // Extreme Cold
  "AS", // Air Stagnation
  "AF", // Ashfall (land)
  "DF", // Debris Flow
  "FL", // Flood (Forecast Point)
  "FA", // Flood
  "FF", // Flash Flood
  "HY", // Hydrologic
  "SV", // Severe Thunderstorm
  "TO", // Tornado
  "BH", // Beach Hazard
  "BW", // Brisk Wind
  "CF", // Coastal Flood
  "EW", // Extreme Wind
  "FW", // Fire Weather
  "GL", // Gale
  "HF", // Hurricane Force Wind
  "HU", // Hurricane
  "LO", // Low Water
  "LS", // Lakeshore Flood
  "MA", // Marine
  "ZY", // Freezing Spray
  "UP", // Heavy Freezing Spray
  "SC", // Small Craft
  "SE", // Hazardous Seas
  "SR", // Storm
  "SU", // High Surf
  "TS", // Tsunami
  "MF", // Dense Fog
  "MS", // Dense Smoke
  "MH", // Ashfall
  "RP", // Rip Current Risk
  "TR", // Tropical Storm
  "TY", // Typhoon
  "SS", // Storm Surge
  "ZR", // Freezing Rain
]);

/**
 * All available NWS P-VTEC Phenomenon codes
 *
 * @see https://www.weather.gov/media/directives/010_pdfs/pd01017003curr.pdf (page #34 or A-2)
 */
export type Phenomenon = z.infer<typeof zPhenomenon>;

export const zSignificance = z.enum([
  "W", //Warning
  "A", //Watch
  "Y", //Advisory
  "S", //Statement
  "F", //Forecast
  "O", //Outlook
]);

/**
 * All available NWS P-VTEC Significance codes
 *
 * @see https://www.weather.gov/media/directives/010_pdfs/pd01017003curr.pdf (page #35 or A-3)
 */
export type Significance = z.infer<typeof zSignificance>;
