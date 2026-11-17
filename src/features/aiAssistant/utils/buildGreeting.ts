import type { PersonalizationMode } from '@/hooks/usePersonalization'
import type { OrderHistoryEntry } from '@/stores/orderHistory'
import type { SelectableProfile } from '@/types'

interface BuildGreetingTextArgs {
  mode: PersonalizationMode
  persona: SelectableProfile | null
  latestOrder: OrderHistoryEntry | null
  fallback: string
  starters?: 'affinity' | 'curated'
}

interface BuildStarterQuestionsArgs {
  mode: PersonalizationMode
  persona: SelectableProfile | null
  hasOrders: boolean
  fallback: string[]
  starters?: 'affinity' | 'curated'
}

const MAX_STARTER_QUESTIONS = 4
const ORDER_QUESTION = "Where's my last order?"
const FAQ_QUESTION = "What's your return policy?"

const BRAND_AFFINITY_KEY = 'brand'

/**
 * Display form of an affinity value: for a hierarchical path ("A > B > Leaf")
 * take the trimmed leaf segment; otherwise return the value unchanged.
 */
const formatAffinityValue = (value: string): string => {
  if (!value.includes('>')) return value
  const segments = value.split('>')
  return segments[segments.length - 1].trim()
}

/**
 * Affinity values ordered brand-first (brands read best as "Show me Nike"),
 * then the remaining keys, each formatted to its display leaf and de-duplicated.
 */
const getFormattedAffinityValues = (
  affinities: Record<string, string[]>,
): string[] => {
  const brandValues = affinities[BRAND_AFFINITY_KEY] ?? []
  const otherValues = Object.entries(affinities)
    .filter(([key]) => key !== BRAND_AFFINITY_KEY)
    .flatMap(([, values]) => values)

  const ordered: string[] = []
  for (const value of [...brandValues, ...otherValues]) {
    const formatted = formatAffinityValue(value)
    if (formatted && !ordered.includes(formatted)) ordered.push(formatted)
  }
  return ordered
}

/** Top (brand-first) formatted affinity value, or null when there are none. */
const getTopAffinity = (affinities: Record<string, string[]>): string | null =>
  getFormattedAffinityValues(affinities)[0] ?? null

/** Up to `count` distinct formatted affinity values, brand-first. */
const getTopAffinityValues = (
  affinities: Record<string, string[]>,
  count: number,
): string[] => getFormattedAffinityValues(affinities).slice(0, count)

/**
 * Warm, preference-aware empty-state line for a persona; the vertical's
 * `fallback` text unchanged for anonymous/realtime shoppers.
 *
 * When `starters === 'curated'` (content verticals), persona mode personalizes
 * only the greeting — `Welcome back, {label} 👋 {fallback}` — with no affinity
 * or order clause; anonymous/realtime still return the `fallback` unchanged.
 */
export const buildGreetingText = ({
  mode,
  persona,
  latestOrder,
  fallback,
  starters,
}: BuildGreetingTextArgs): string => {
  if (starters === 'curated') {
    if (mode === 'persona' && persona && persona.type !== 'customerGroup') {
      return `Welcome back, ${persona.label} 👋 ${fallback}`
    }
    return fallback
  }

  if (mode !== 'persona' || !persona || persona.type === 'customerGroup')
    return fallback

  const topAffinity = getTopAffinity(persona.affinities)
  const findClause = topAffinity
    ? ` I can help you find ${topAffinity}`
    : ' I can help you find what you need'
  const orderClause = latestOrder ? ' or check on your recent order.' : '.'

  return `Welcome back, ${persona.label} 👋${findClause}${orderClause}`
}

/**
 * Persona → 3-4 starter chips auto-derived from affinities, plus an order chip
 * (when `hasOrders`) and one FAQ chip, capped at 4. Anonymous/realtime → the
 * vertical's `fallback` questions unchanged.
 *
 * When `starters === 'curated'` (content verticals), a persona's own
 * `assistantPrompts` replace the vertical's `fallback` questions; without them,
 * and for every other mode, the `fallback` is kept unchanged.
 */
export const buildStarterQuestions = ({
  mode,
  persona,
  hasOrders,
  fallback,
  starters,
}: BuildStarterQuestionsArgs): string[] => {
  if (starters === 'curated') {
    if (
      mode === 'persona' &&
      persona?.type !== 'customerGroup' &&
      persona?.assistantPrompts?.length
    ) {
      return persona.assistantPrompts.slice(0, MAX_STARTER_QUESTIONS)
    }
    return fallback
  }

  if (mode !== 'persona' || !persona || persona.type === 'customerGroup')
    return fallback

  // The order (when applicable) and FAQ chips always make the cut; affinity
  // chips fill whatever slots remain up to the cap.
  const fixedQuestions = [...(hasOrders ? [ORDER_QUESTION] : []), FAQ_QUESTION]
  const affinitySlots = Math.max(
    0,
    MAX_STARTER_QUESTIONS - fixedQuestions.length,
  )
  const affinityQuestions = getTopAffinityValues(
    persona.affinities,
    affinitySlots,
  ).map((value) => `Show me ${value}`)

  return [...affinityQuestions, ...fixedQuestions]
}
