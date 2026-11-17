/**
 * Turns an underscore slug (`ditalini_pasta`, `parmesan_cheese`) into a
 * human-readable label (`ditalini pasta`). Values without underscores are
 * returned unchanged.
 */
export const humanizeSlug = (value: string): string =>
  value.replace(/_/g, ' ').trim()
