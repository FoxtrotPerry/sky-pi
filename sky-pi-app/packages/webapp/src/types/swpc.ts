export type GeomagneticSeverity = {
  text: "Active" | "Minor" | "Moderate" | "Strong" | "Severe" | "Extreme";
  scale: `G${0 | 1 | 2 | 3 | 4 | 5}`;
};

export type KpForecast = {
  time: Date;
  value: number;
  severity: GeomagneticSeverity;
};

export type GeomagneticProbability = {
  time: Date;
  probabilities: Array<{
    severity: "Active" | "Minor" | "Moderate" | "Strong";
    probability: number;
  }>;
};
