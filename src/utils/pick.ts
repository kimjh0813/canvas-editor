import { pickBy } from "lodash";

export function pickDefinedByType<T extends object>(obj: T): T {
  return pickBy(obj, (v) => v !== undefined) as T;
}
