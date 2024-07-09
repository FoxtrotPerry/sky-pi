export type JSONKey = string | number | symbol;
export type JSONValue = string | number | boolean | null | {[key: JSONKey]: JSONValue};
