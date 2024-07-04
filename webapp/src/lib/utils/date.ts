/**
 * Takes an ISO8601 duration, splits it into it's two components, and returns them.
 */

const durationComponentsAreValid = (parts: string[]): parts is [string, string] => {
  return parts.length === 2 && parts.every(part => typeof part === 'string');
}

export const separateDuration = (dateStr: string) => {
  const durationComponents = dateStr.split('/');
  if (durationComponentsAreValid(durationComponents)) return durationComponents;
  throw Error(`argument given to 'separateDuration' was not valid, argument given: ${dateStr}`)
}