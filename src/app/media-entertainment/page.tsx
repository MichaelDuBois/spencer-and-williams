'use client'

import { MediaEntertainmentBillboardHero } from '@/app/media-entertainment/_components/MediaEntertainmentBillboardHero'
import { MediaEntertainmentBillboardSkeleton } from '@/app/media-entertainment/_components/MediaEntertainmentBillboardSkeleton'
import { MediaEntertainmentBrowseError } from '@/app/media-entertainment/_components/MediaEntertainmentBrowseError'
import { MediaEntertainmentContinueWatchingRail } from '@/app/media-entertainment/_components/MediaEntertainmentContinueWatchingRail'
import { MediaEntertainmentRailSkeleton } from '@/app/media-entertainment/_components/MediaEntertainmentRailSkeleton'
import { useMediaEntertainmentRails } from '@/app/media-entertainment/_hooks/useMediaEntertainmentRails'
import { useMediaHomepageRailRules } from '@/app/media-entertainment/_hooks/useMediaHomepageRailRules'
import { buildHomepageRows } from '@/app/media-entertainment/_utils/buildHomepageRows'
import { getBrowseRails } from '@/app/media-entertainment/_utils/recommendRail'
import { renderHomepageRow } from '@/app/media-entertainment/_utils/renderHomepageRow'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'

const CONFIGURED_RAILS = mediaEntertainmentConfig.homepageRails ?? []

/** The Recommend row has no skeleton from config — it has no title until a seed
 *  resolves, so only the rows the batched search draws are stood in for. The
 *  static list, not the merged one: the skeletons have to paint real row titles
 *  during the rules round trip, before the merge has anything to say. */
const SKELETON_RAILS = getBrowseRails(CONFIGURED_RAILS)

const HomePage = () => {
  const { rails: configuredRails, isPending: isRulesPending } =
    useMediaHomepageRailRules()

  // Gated on the rules query rather than merging into a batch already in
  // flight: the homepage's contract is exactly one batched search, and starting
  // it against the config list would cost a second one as soon as the rules
  // added or dropped a row.
  const { rails, billboardTitles, isPending, isError, refetch } =
    useMediaEntertainmentRails({
      rails: configuredRails,
      enabled: !isRulesPending,
    })

  // The single batched search is the whole page, so a failure has nothing to
  // render around — without this branch the billboard skeleton would sit there
  // for good.
  if (isError) return <MediaEntertainmentBrowseError onRetry={refetch} />

  return (
    <div className="pb-24">
      {billboardTitles.length > 0 ? (
        <MediaEntertainmentBillboardHero titles={billboardTitles} />
      ) : (
        <MediaEntertainmentBillboardSkeleton />
      )}

      {/* The negative margin is the signature move: the first rail rides up over
          the hero's bottom scrim, so the seam is invisible and the fold reads as
          "there's more below" rather than as the end of the page. */}
      <div className="relative z-10 -mt-24 space-y-6 md:-mt-32 md:space-y-10">
        {/* Above the algorithmic rails, and outside the `isPending` branch below:
            it resolves from local state and a lookup of its own, so it must not
            wait on the batched browse query that draws every other row. */}
        <MediaEntertainmentContinueWatchingRail />

        {isPending
          ? // Row count and titles come straight from config, so a loading page
            // shows the real rows instead of a cascade of rails popping in.
            SKELETON_RAILS.map((rail) => (
              <MediaEntertainmentRailSkeleton
                key={rail.id}
                title={rail.title}
                shape={rail.shape}
              />
            ))
          : // The merged list, not `CONFIGURED_RAILS`: the Recommend row's
            // position is counted against the rails actually on the page, and a
            // rail the rules dropped is no longer one of them.
            buildHomepageRows({
              rails,
              configuredRails,
            }).map(renderHomepageRow)}
      </div>
    </div>
  )
}

export default HomePage
