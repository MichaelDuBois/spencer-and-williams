'use client'

import { useAtomValue } from 'jotai'
import { Configure, useInstantSearch, useStats } from 'react-instantsearch'

import { RAIL_GUTTER_CLASS } from '@/app/media-entertainment/_components/MediaEntertainmentRailVariants'
import { MediaEntertainmentFilterChips } from '@/app/media-entertainment/search/_components/MediaEntertainmentFilterChips'
import { MediaEntertainmentMultifeedRails } from '@/app/media-entertainment/search/_components/MediaEntertainmentMultifeedRails'
import { MediaEntertainmentNoResults } from '@/app/media-entertainment/search/_components/MediaEntertainmentNoResults'
import { MediaEntertainmentResultsGrid } from '@/app/media-entertainment/search/_components/MediaEntertainmentResultsGrid'
import { SearchResultsHeader } from '@/components/results/SearchResultsHeader'
import { ChatSearchOverview } from '@/features/chatWidget/components/ChatSearchOverview'
import { useScrollToTop } from '@/hooks/useScrollToTop'
import { searchClientKeyAtom } from '@/stores/searchClient'

const HITS_PER_PAGE = 28

/** A notch under the shared `text-3xl`: the poster grid carries the page. */
const HEADING_CLASS = 'text-2xl'

interface MediaEntertainmentSearchResultsProps {
  /**
   * The header section this page is narrowed to — its title heads the page and
   * qualifies the query line. Absent on `/search`, which spans the catalogue.
   */
  scope?: string
  hiddenFacets?: string[]
}

/**
 * Full-bleed results page, shared by `/search` and every header section. An
 * empty query needs no special case: the index returns empty-query results and
 * the grid renders them like any other page.
 */
export const MediaEntertainmentSearchResults = ({
  scope,
  hiddenFacets,
}: MediaEntertainmentSearchResultsProps) => {
  useScrollToTop()

  const { nbHits, query } = useStats()
  const { status } = useInstantSearch()
  const searchClientKey = useAtomValue(searchClientKeyAtom)

  // `status` guards the first paint, where nbHits is 0 before any response.
  const hasNoResults =
    nbHits === 0 && status !== 'loading' && status !== 'stalled'

  // A section counts only once there is a query to count against: its whole
  // slice runs to six figures, where nbHits comes back non-exhaustive.
  const showResultCount = scope ? Boolean(query) : true

  // `min-h-svh` keeps the page taller than the viewport while the first response
  // is in flight, so the scrollbar never blinks out and back.
  return (
    <div className="min-h-svh pt-6 pb-24">
      <Configure hitsPerPage={HITS_PER_PAGE} />

      {!scope && <MediaEntertainmentMultifeedRails />}

      <div className={RAIL_GUTTER_CLASS}>
        <SearchResultsHeader
          label={scope ?? 'Search'}
          scope={scope}
          headingClassName={HEADING_CLASS}
          showResultCount={showResultCount}
        />
        <MediaEntertainmentFilterChips hiddenFacets={hiddenFacets} />
      </div>

      <div className={RAIL_GUTTER_CLASS}>
        <ChatSearchOverview />
      </div>
      {hasNoResults ? (
        <MediaEntertainmentNoResults />
      ) : (
        <div className={RAIL_GUTTER_CLASS}>
          {/* Keyed on the installed client so the grid remounts when it swaps */}
          <MediaEntertainmentResultsGrid key={searchClientKey} />
        </div>
      )}
    </div>
  )
}
