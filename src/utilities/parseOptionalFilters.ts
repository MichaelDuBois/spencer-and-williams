export type AffinitiesMap = Record<string, Record<string, number>>

const SCORE_REGEX = /<score=(\d+)>$/

export const parseOptionalFilters = (filters: string[]): AffinitiesMap => {
  const result: AffinitiesMap = {}
  for (const filter of filters) {
    const scoreMatch = filter.match(SCORE_REGEX)
    const score = scoreMatch ? Number(scoreMatch[1]) : 1
    const raw = filter.replace(SCORE_REGEX, '')
    const colonIdx = raw.indexOf(':')
    if (colonIdx === -1) continue
    const facet = raw.slice(0, colonIdx)
    const value = raw.slice(colonIdx + 1)
    result[facet] ??= {}
    result[facet][value] = score
  }
  return result
}
