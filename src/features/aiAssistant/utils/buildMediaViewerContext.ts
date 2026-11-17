import type { PersonalizationMode } from '@/hooks/usePersonalization'
import type { SelectableProfile } from '@/types'

/** The minimum a title needs for the agent to reason about it by name. */
export interface ViewerContextTitle {
  title: string
  releaseYear?: string
}

export interface ViewerContextProgressTitle extends ViewerContextTitle {
  /** 0-1. Reported as a percentage so "part-way through" is legible. */
  progress: number
}

export interface BuildMediaViewerContextArgs {
  mode: PersonalizationMode
  persona: SelectableProfile | null
  myList: ViewerContextTitle[]
  continueWatching: ViewerContextProgressTitle[]
  /** True when the active profile is one config marks as restricted. */
  isRestrictedProfile: boolean
}

/**
 * How many titles from each list reach the agent. The lists are demo-seeded and
 * short, but they grow as the viewer clicks, and the context block shares a
 * budget with the conversation — a viewer who has added forty titles should not
 * push the actual question out of the window.
 */
const MAX_LISTED_TITLES = 12

const summarizeAffinities = (affinities: Record<string, string[]>): string =>
  Object.entries(affinities)
    .filter(([, values]) => values.length > 0)
    .map(([key, values]) => `${key}: ${values.join(', ')}`)
    .join('; ')

const nameWithYear = ({ title, releaseYear }: ViewerContextTitle): string =>
  releaseYear ? `${title} (${releaseYear})` : title

const summarizeList = (titles: ViewerContextTitle[]): string =>
  titles.slice(0, MAX_LISTED_TITLES).map(nameWithYear).join(', ')

const summarizeProgress = (titles: ViewerContextProgressTitle[]): string =>
  titles
    .slice(0, MAX_LISTED_TITLES)
    .map(
      (entry) =>
        `${nameWithYear(entry)} — ${Math.round(entry.progress * 100)}% watched`,
    )
    .join(', ')

/**
 * Builds the `[Context: ...]` note describing who is watching.
 *
 * The commerce equivalent, `buildPersonaContext`, talks about shoppers, stores,
 * carts and return policies — every one of which reads wrong on a streaming
 * service. This is a sibling rather than a rewrite of it, so the other verticals
 * keep the wording they were written for.
 *
 * Returns null when there is nothing worth saying, so an anonymous viewer with
 * empty lists costs no tokens.
 */
export const buildMediaViewerContext = ({
  mode,
  persona,
  myList,
  continueWatching,
  isRestrictedProfile,
}: BuildMediaViewerContextArgs): string | null => {
  const segments: string[] = []

  if (mode === 'persona' && persona && persona.type !== 'customerGroup') {
    segments.push(
      `The viewer is watching on the "${persona.label}" profile — ${persona.description}.`,
    )

    const affinities = summarizeAffinities(persona.affinities)
    if (affinities) {
      segments.push(`Their taste leans towards — ${affinities}.`)
    }
  } else if (mode === 'realtime') {
    segments.push(
      'The viewer has no saved profile; their taste is being learned from this session.',
    )
  }

  if (continueWatching.length > 0) {
    segments.push(
      `Part-way through: ${summarizeProgress(continueWatching)}. If they ask what to finish or pick up, start here.`,
    )
  }

  if (myList.length > 0) {
    segments.push(
      `Already in their list: ${summarizeList(myList)}. Do not recommend these again unless they ask about them.`,
    )
  }

  if (isRestrictedProfile) {
    segments.push(
      'This is a kids profile. Keep every suggestion and all wording appropriate for children. Content limits are enforced outside this conversation, so never say you are unable to help — simply stay in range.',
    )
  }

  if (segments.length === 0) return null

  return `[Context: ${segments.join(' ')}]`
}
