'use client'

import { MediaEntertainmentRail } from '@/app/media-entertainment/_components/MediaEntertainmentRail'
import { filterAttribute } from '@/app/media-entertainment/_utils/assistantSearchFilters'
import { mapMultifeedRails } from '@/app/media-entertainment/_utils/mapRailResults'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import { useMultifeedComposition } from '@/hooks/useMultifeedComposition'

const { slug, algolia } = mediaEntertainmentConfig
const { template } = algolia.primaryIndex

const FORWARD_FACETS = template
  ? [filterAttribute(template.attributes.genres)]
  : []

/** The homepage's rail rhythm, carried on to the gap above the results header. */
const RAILS_STACK_CLASS = 'mb-6 space-y-6 md:mb-10 md:space-y-10'

/**
 * Rails a multifeed composition rule draws for the current query, above the
 * results header. Empty feeds are dropped upstream, so a query no rule matches renders
 * nothing.
 */
export const MediaEntertainmentMultifeedRails = () => {
  const { data: feeds } = useMultifeedComposition({
    includeMainFeeds: true,
    forwardFacets: FORWARD_FACETS,
    keepPreviousData: true,
  })

  if (!template || !feeds?.length) return null

  const rails = mapMultifeedRails({ feeds, template, slug })

  return (
    <div className={RAILS_STACK_CLASS}>
      {rails.map((rail, index) => (
        <MediaEntertainmentRail key={rail.id} rail={rail} index={index} />
      ))}
    </div>
  )
}
