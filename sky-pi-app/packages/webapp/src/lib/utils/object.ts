export const toSearchParamEntries = <
  T extends Record<string, string | number | boolean | null>,
>(
  object: T,
) => {
  return Object.entries(object).map(([key, value]) => [
    key,
    value?.toString() ?? "false",
  ]);
};
