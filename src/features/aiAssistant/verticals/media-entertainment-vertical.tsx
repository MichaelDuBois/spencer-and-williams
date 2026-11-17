import { MediaEntertainmentPosterCard } from '@/app/media-entertainment/_components/MediaEntertainmentPosterCard'
import { getMediaEntertainmentHitValues } from '@/app/media-entertainment/_utils/getMediaEntertainmentHitValues'
import { getAssistantAttributes } from '@/app/media-entertainment/_utils/titleAttributes'
import {
  mediaEntertainmentConfig,
  TOP_10_RULE_CONTEXT,
} from '@/app/media-entertainment/config'
import { POSTER_ITEM_SIZES } from '@/components/CarouselSection'
import { MediaTitleResultGroup } from '@/features/aiAssistant/components/messages/media-entertainment/MediaTitleResultGroup'
import { StreamingMediaDisplayResults } from '@/features/aiAssistant/components/messages/media-entertainment/StreamingMediaDisplayResults'
import { extractMediaDisplayResultsStream } from '@/features/aiAssistant/tools/parsing/mediaDisplayResultsParser'
import type {
  MediaDisplayGroup,
  PartialMediaDisplayGroup,
} from '@/features/aiAssistant/types'
import type { VerticalConfig } from '@/features/aiAssistant/verticals/types'

const { slug, algolia } = mediaEntertainmentConfig
const TEMPLATE = algolia.primaryIndex.template

export const mediaEntertainmentVertical: VerticalConfig = {
  slug,
  // No `homepageCarousels` here — media's rows are `homepageRails` (different shape/fetch),
  // so this declares the assistant's own row, selecting from the same Top 10 rule.
  trendingCarousel: {
    title: 'Trending Now',
    filterRuleContexts: [TOP_10_RULE_CONTEXT],
    hitsPerPage: 12,
    // With composition disabled, trimming unused watch_providers,
    // alternative_titles, cast and _enrichments reduces these 12 hits from
    // 90.8 KB to 4.9 KB. Composition is enabled by default and strips both
    // attribute params below (BLOCKED_PARAMS), so it still fetches full records.
    // The assistant set rather than the rail set because the card's
    // length label falls back to a season count for a runtime-less series, and
    // this row sits in the same panel as result groups that label one — the two
    // extra fields cost ~50 bytes against the ~86 KB the trim saves.
    // `TEMPLATE` is optional, hence the guard.
    ...(TEMPLATE
      ? { attributesToRetrieve: getAssistantAttributes(TEMPLATE) }
      : {}),
    // With composition disabled, suppress highlighting regardless of the
    // index-level setting (currently off).
    attributesToHighlight: [],
  },
  trendingCarouselVariant: 'poster',
  // Same extractor every other media surface uses; the card opens the title sheet.
  renderTrendingItem: (hit) =>
    TEMPLATE ? (
      <MediaEntertainmentPosterCard
        title={getMediaEntertainmentHitValues(hit, TEMPLATE, slug)}
        sizes={POSTER_ITEM_SIZES}
      />
    ) : null,
  // 'curated' rather than 'affinity': the commerce path turns affinities into
  // "Show me X" chips, which reads as shopping. Here the seeded mood prompts are
  // the point, and a profile only personalizes the greeting above them.
  personaStarters: 'curated',
  streamingParser: extractMediaDisplayResultsStream,
  followUpLabel: 'titles',
  placeholderText: 'What are you in the mood for?',
  emptyStateText: "Tell me what you feel like watching and I'll find it.",
  suggestedQuestions: mediaEntertainmentConfig.assistant.prompts,
  renderResultGroup: (group, _isExpanded, context) => (
    <MediaTitleResultGroup
      group={group as MediaDisplayGroup}
      query={context?.query}
    />
  ),
  renderStreamingDisplay: ({ intro, answer, groups, streamingGroup }) => (
    <StreamingMediaDisplayResults
      intro={intro}
      answer={answer}
      groups={groups as MediaDisplayGroup[]}
      streamingGroup={streamingGroup as PartialMediaDisplayGroup | null}
    />
  ),
}
