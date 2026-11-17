import { isRecommendRail } from '@/app/media-entertainment/_utils/recommendRail'
import type {
  MediaHomepageRailConfig,
  MediaRailConfig,
  MediaRailShape,
} from '@/app/media-entertainment/types'
import type { AlgoliaRule } from '@/lib/algoliaRules'

export interface ParsedRailDescription {
  title?: string
  shape?: MediaRailShape
}

interface MergeHomepageRailsArgs {
  configured: MediaHomepageRailConfig[]
  /** `null` means the rules could not be read — not that there are none. */
  rules: AlgoliaRule[] | null
  prefix: string
  maxDiscovered: number
  /**
   * Contexts under `prefix` that belong to some other homepage feature (e.g.
   * the billboard) rather than a rail. Excluded from discovery so creating
   * that rule in the dashboard can't spawn a duplicate rail.
   */
  reservedContexts?: string[]
}

/**
 * Shapes a rule may claim for itself with a `[shape=…]` token. `'top10'` is
 * deliberately absent: the numbered row is page structure rather than a rail
 * treatment, and a second numbered rail would wreck the page.
 */
export const DISCOVERABLE_RAIL_SHAPES: readonly MediaRailShape[] = [
  'poster',
  'backdrop',
  'spotlight',
]

/** Matched globally, so a token anywhere in the description is read and removed. */
const TOKEN_PATTERN = /\[([a-z0-9_-]+)=([^\]]*)\]/gi
const RAIL_PREFIX_PATTERN = /^\s*homepage\s+rail\s*:\s*/i
const TRAILING_PARENTHETICAL_PATTERN = /\s*\([^()]*\)\s*$/

/**
 * Reads a rail title — and optionally a shape — out of a rule's description, so
 * the dashboard field that already documents the rule doubles as the row's
 * label. The counts the descriptions carry (`(~1,502 titles)`) are notes to
 * whoever maintains the rule, never part of the title.
 */
export const parseRailDescription = (
  description?: string,
): ParsedRailDescription => {
  if (!description) return {}

  const tokens = new Map<string, string>()

  // Every token is stripped, not just the ones we understand, so a token added
  // to a description later never leaks into a title.
  const withoutTokens = description.replace(
    TOKEN_PATTERN,
    (_match, key: string, value: string) => {
      tokens.set(key.toLowerCase(), value.trim())

      return ' '
    },
  )

  const shape = tokens.get('shape')

  const title = withoutTokens
    .replace(/\s+/g, ' ')
    .replace(RAIL_PREFIX_PATTERN, '')
    .replace(TRAILING_PARENTHETICAL_PATTERN, '')
    .trim()

  return {
    ...(title ? { title } : {}),
    ...(isDiscoverableShape(shape) ? { shape } : {}),
  }
}

/** Whether a rule selects a homepage rail, as opposed to answering a query. */
export const isHomepageRailRule = (
  rule: AlgoliaRule,
  prefix: string,
): boolean => {
  // An author disabling a rule in the dashboard is the supported way to retire
  // a rail without deleting it.
  if (rule.enabled === false) return false

  // Exactly one: a rail is selected by its context alone, so a rule that ANDs a
  // second condition in is answering some other question.
  if (rule.conditions?.length !== 1) return false

  const [condition] = rule.conditions

  if (
    typeof condition.context !== 'string' ||
    !condition.context.startsWith(prefix)
  ) {
    return false
  }

  // A rule that also matches a pattern fires on what the visitor typed. The
  // rails browse with an empty query, so it would never apply to them.
  if (condition.pattern) return false

  // Without a consequence there is no server-side `filters`, so the rail it
  // claims to select would render an unfiltered slice of the whole index.
  return !!(rule.consequence?.params || rule.consequence?.promote)
}

export const getRailContext = (
  rule: AlgoliaRule,
  prefix: string,
): string | null => {
  const context = rule.conditions?.[0]?.context

  return typeof context === 'string' && context.startsWith(prefix)
    ? context
    : null
}

/**
 * Lets the Rules list decide which rails exist while config keeps owning their
 * order and shape. `configured` is the registry — array position is row order,
 * and each row is keyed to a rule by its first `filterRuleContexts` entry — so
 * a rule appearing in the dashboard adds a row and a rule disappearing removes
 * one, without either side owning both halves.
 */
export const mergeHomepageRails = ({
  configured,
  rules,
  prefix,
  maxDiscovered,
  reservedContexts = [],
}: MergeHomepageRailsArgs): MediaHomepageRailConfig[] => {
  // A failed read must not empty the homepage: with no list in hand we cannot
  // tell a retired rule from an unreadable one, so config stands unchanged.
  if (!rules) return configured

  const railRules = collectRailRules({ rules, prefix })

  const pinned = configured.flatMap<MediaHomepageRailConfig>((rail) => {
    // The Recommend row is fetched from Recommend, so no rule gates it.
    if (isRecommendRail(rail)) return [rail]

    const context = rail.filterRuleContexts?.[0]

    // Nothing to gate on — a rail carrying its own `filters` needs no rule.
    if (!context) return [rail]

    const rule = railRules.get(context)

    // Dropped rather than left in place: without its rule there is no
    // server-side `filters`, so the row would render the whole index.
    if (!rule) return []

    // Title can come from the rule, shape never does — where a row sits in the
    // page's rhythm is a design decision, not a dashboard edit.
    const { title } = parseRailDescription(rule.description)

    return [{ ...rail, title: title ?? rail.title }]
  })

  // Built from every context a rail declares, not just the first, so a rail
  // listing two contexts doesn't get its second one re-discovered as a new row.
  const configuredContexts = new Set(
    configured.flatMap((rail) =>
      isRecommendRail(rail) ? [] : (rail.filterRuleContexts ?? []),
    ),
  )

  const excludedContexts = new Set([...configuredContexts, ...reservedContexts])

  const discovered = [...railRules.entries()]
    .filter(([context]) => !excludedContexts.has(context))
    // Oldest first, so the rule an author just created lands at the bottom of
    // the page rather than displacing the rails already there.
    .sort(
      ([, ruleA], [, ruleB]) =>
        (ruleA._metadata?.lastUpdate ?? 0) -
          (ruleB._metadata?.lastUpdate ?? 0) ||
        ruleA.objectID.localeCompare(ruleB.objectID),
    )
    .slice(0, maxDiscovered)
    .map(([context, rule]) => toDiscoveredRail({ context, rule, prefix }))

  return [...pinned, ...discovered]
}

const isDiscoverableShape = (value?: string): value is MediaRailShape =>
  DISCOVERABLE_RAIL_SHAPES.some((shape) => shape === value)

/** Rail rules keyed by context, first occurrence winning. */
const collectRailRules = ({
  rules,
  prefix,
}: {
  rules: AlgoliaRule[]
  prefix: string
}): Map<string, AlgoliaRule> => {
  const railRules = new Map<string, AlgoliaRule>()

  for (const rule of rules) {
    if (!isHomepageRailRule(rule, prefix)) continue

    const context = getRailContext(rule, prefix)

    if (!context || railRules.has(context)) continue

    railRules.set(context, rule)
  }

  return railRules
}

/** `homepage_me_award_winners` -> `Award Winners`, for a rule with no description. */
const humanizeRailContext = ({
  context,
  prefix,
}: {
  context: string
  prefix: string
}): string =>
  context
    .slice(prefix.length)
    .split('_')
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ')

/**
 * A discovered rail is an ordinary `MediaRailConfig` — no new type, and no
 * `hitsPerPage`, so `DEFAULT_RAIL_HITS_PER_PAGE` applies.
 */
const toDiscoveredRail = ({
  context,
  rule,
  prefix,
}: {
  context: string
  rule: AlgoliaRule
  prefix: string
}): MediaRailConfig => {
  const { title, shape } = parseRailDescription(rule.description)

  return {
    id: context,
    title: title ?? humanizeRailContext({ context, prefix }),
    filterRuleContexts: [context],
    shape: shape ?? 'poster',
  }
}
