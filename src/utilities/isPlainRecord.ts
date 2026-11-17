import { isRecord } from '@/utilities/isRecord'

/** Narrows an unknown value to a keyed object, excluding arrays. */
export const isPlainRecord = (
  value: unknown,
): value is Record<string, unknown> => isRecord(value) && !Array.isArray(value)
