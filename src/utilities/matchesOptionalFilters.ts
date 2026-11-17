import { getByPath } from '@/utilities/getByPath'
import { parseOptionalFilters } from '@/utilities/parseOptionalFilters'

const QUOTED_VALUE_REGEX = /^"(.*)"$/

const unquote = (value: string): string =>
  value.replace(QUOTED_VALUE_REGEX, '$1')

const hasValue = (
  hit: Record<string, unknown>,
  attribute: string,
  value: string,
): boolean => {
  const hitValue = getByPath<unknown>(hit, attribute)
  const hitValues = Array.isArray(hitValue) ? hitValue : [hitValue]
  const isCaseSensitive = attribute === '_tags'
  const expectedValue = isCaseSensitive ? value : value.toLowerCase()
  return hitValues.some(
    (entry) =>
      (typeof entry === 'string' ||
        typeof entry === 'number' ||
        typeof entry === 'boolean') &&
      (isCaseSensitive ? String(entry) : String(entry).toLowerCase()) ===
        expectedValue,
  )
}

/**
 * Whether the hit carries at least one value boosted by the given optional
 * filters (`attribute:value<score=N>`). Negated filters (`attribute:-value`)
 * demote rather than boost, so they never count as a match.
 */
export const matchesOptionalFilters = (
  hit: Record<string, unknown>,
  optionalFilters: string[],
): boolean =>
  Object.entries(parseOptionalFilters(optionalFilters)).some(
    ([attribute, values]) =>
      !attribute.startsWith('-') &&
      Object.keys(values).some((value) => {
        const unquotedValue = unquote(value)
        if (unquotedValue.startsWith('-')) return false

        return hasValue(hit, attribute, unquotedValue.replace(/^\\-/, '-'))
      }),
  )
