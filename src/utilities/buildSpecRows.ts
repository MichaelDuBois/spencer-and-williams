export interface SpecRow {
  label: string
  value: string
}

/**
 * Keeps only the pairs that have a value, so a spec table renders populated
 * rows and nothing else. Callers list every possible spec; whichever ones the
 * record happens to be missing drop out here.
 */
export const buildSpecRows = (
  pairs: { label: string; value: string | undefined }[],
): SpecRow[] => pairs.filter((row): row is SpecRow => Boolean(row.value))
