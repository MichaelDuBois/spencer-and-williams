'use client'

import { Configure, Index } from 'react-instantsearch'

import { getHeaderSectionParams } from '@/app/media-entertainment/_utils/headerSections'
import { mediaEntertainmentConfig as config } from '@/app/media-entertainment/config'
import { MediaEntertainmentSearchResults } from '@/app/media-entertainment/search/_components/MediaEntertainmentSearchResults'
import type { MediaHeaderSectionConfig } from '@/app/media-entertainment/types'

const indexName = config.algolia.primaryIndex.name

interface MediaEntertainmentSectionResultsProps {
  /** Resolved by the route, so an unknown segment never reaches the client. */
  section: MediaHeaderSectionConfig
}

/**
 * A nav section rendered as the search results page over its own slice. The
 * nested `Index` keeps each section's refinements and paging to itself while
 * still inheriting any query supplied by the route. Typing in the header search
 * navigates to the global search route, leaving this scoped Index behind.
 *
 * The section title doubles as the heading and as the scope named in the query
 * line, so a search here reads as one inside the section rather than across the
 * catalogue.
 */
export const MediaEntertainmentSectionResults = ({
  section,
}: MediaEntertainmentSectionResultsProps) => (
  <Index indexName={indexName} indexId={`media_browse_${section.id}`}>
    <Configure {...getHeaderSectionParams(section)} />
    <MediaEntertainmentSearchResults
      scope={section.title}
      hiddenFacets={section.hiddenFacets}
    />
  </Index>
)
