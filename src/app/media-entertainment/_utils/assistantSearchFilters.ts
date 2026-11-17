import type { MediaEntertainmentHitTemplate } from '@/app/media-entertainment/types'

/**
 * Baseline filters the assistant's searches always carry, whatever the agent asks
 * for. Kept separate from the agent's own filter expression because the agent's
 * half is droppable — a malformed or over-narrow expression gets retried without
 * it — and these must survive that retry. See `useMediaEntertainmentSearch`.
 */

/**
 * Certifications that must never reach a restricted profile.
 *
 * `media_ns` mixes two dozen national rating schemes, so this cannot be the US
 * codes alone — `18`, `16`, `15` and `18A` are all present and all adult.
 *
 * `NR` is in the list and is the load-bearing entry. It is the single largest
 * value in the index, and excluding only the rated adult codes leaves unrated
 * adult horror reachable: verified against the index, "extremely violent gory
 * horror for adults" returned Terrifier, The Wretched and Mad God, all `NR`.
 */
const ADULT_CERTIFICATIONS = [
  'R',
  'NC-17',
  'TV-MA',
  'TV-14',
  'NR',
  'X',
  'A',
  'M',
  'S',
  '18',
  '18+',
  '18A',
  '19',
  '16',
  '16+',
  '15',
  '14',
  '14A',
  '13+',
  '12',
  '12A',
  '12+',
  'B-15',
] as const

/**
 * Genres excluded for a restricted profile. Certification alone is not enough
 * because an unrated or leniently-rated title can still be a horror film.
 */
const ADULT_GENRES = ['Horror', 'Thriller', 'War', 'War & Politics', 'Crime']

/** Quoted so values containing a space, ampersand or hyphen match literally. */
const negate = (attribute: string, values: readonly string[]): string[] =>
  values.map((value) => `NOT ${attribute}:"${value}"`)

const and = (clauses: string[]): string => clauses.join(' AND ')

/**
 * A template value may map to several index paths (they get requested together);
 * a filter clause needs exactly one, so take the first.
 */
export const filterAttribute = (path: string | readonly string[]): string =>
  typeof path === 'string' ? path : path[0]

export interface BaselineFilterArgs {
  /** Source of the index attribute paths — never hardcode them here. */
  template: MediaEntertainmentHitTemplate
  /** Rating-count floor — keeps the long tail of unrated records out. */
  qualityFloor: number
  /** True when the active profile is one config marks as restricted. */
  isRestrictedProfile: boolean
}

/**
 * The always-on clause. Returns a single expression; never empty, since the
 * quality floor applies to every profile.
 */
export const buildBaselineFilters = ({
  template,
  qualityFloor,
  isRestrictedProfile,
}: BaselineFilterArgs): string => {
  const { ratingCount, maturityRating, genres } = template.attributes

  const clauses = [`${filterAttribute(ratingCount)} >= ${qualityFloor}`]

  if (isRestrictedProfile) {
    clauses.push(
      // Index-only field, so it stays a literal: there is no
      // `MediaEntertainmentTitleHitValues` equivalent for the template to map.
      // Movie-only too — shows have no `adult` field, so this would drop every
      // series if it were required rather than optional-by-absence. It reads as
      // a facet filter, and Algolia treats a missing attribute as
      // non-matching, so it is combined as a negation of the positive case.
      'NOT adult:true',
      ...negate(filterAttribute(maturityRating), ADULT_CERTIFICATIONS),
      ...negate(filterAttribute(genres), ADULT_GENRES),
    )
  }

  return and(clauses)
}

/**
 * Combines the baseline with whatever the agent sent. The agent's expression is
 * parenthesised so an `OR` inside it cannot escape the baseline's `AND` — without
 * the brackets, `baseline AND a OR b` would match `b` alone and the guard would
 * be bypassed by a filter the agent wrote innocently.
 */
export const withBaselineFilters = (
  baseline: string,
  agentFilters?: string,
): string => {
  const trimmed = agentFilters?.trim()

  return trimmed ? and([baseline, `(${trimmed})`]) : baseline
}
