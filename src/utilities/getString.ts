/** Returns the value only when it is a non-empty string. */
export const getString = (value: unknown): string | undefined =>
  typeof value === 'string' && value !== '' ? value : undefined
