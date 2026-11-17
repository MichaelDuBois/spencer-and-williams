/** Narrows an unknown value to a keyed object so its fields can be read. */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null
