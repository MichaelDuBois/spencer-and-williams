import { getFurnishingProductHitValues } from '@/app/furnishing/_utils/getFurnishingProductHitValues'
import { furnishingConfig } from '@/app/furnishing/config'
import { Hit } from '@/components/hit/Hit'
import { CarouselResultGroup } from '@/features/aiAssistant/components/messages/CarouselResultGroup'
import { FurnishingProductCard } from '@/features/aiAssistant/components/messages/furnishing/FurnishingProductCard'
import type { ProductCarouselPresentation } from '@/features/aiAssistant/components/messages/productCarousel'
import { StreamingDisplayResults } from '@/features/aiAssistant/components/messages/StreamingDisplayResults'
import { extractDisplayResultsStream } from '@/features/aiAssistant/tools/parsing/displayResultsParser'
import type {
  DisplayGroup,
  PartialDisplayGroup,
} from '@/features/aiAssistant/types'
import type { VerticalConfig } from '@/features/aiAssistant/verticals/types'

const carousel: ProductCarouselPresentation = {
  card: FurnishingProductCard,
  carouselClassName: 'items-stretch',
}

export const furnishingVertical: VerticalConfig = {
  slug: 'furnishing',
  streamingParser: extractDisplayResultsStream,
  followUpLabel: '',
  placeholderText: 'Ask about furniture...',
  emptyStateText: 'Ask me anything about our furniture!',
  suggestedQuestions: [
    'Can you suggest coffee tables with storage?',
    'Find a comfortable sofa under $800',
    'Show me mid-century furniture for the bedroom',
    'Show me trending home decor',
  ],
  renderTrendingItem: (hit) => (
    <Hit
      variant="standard"
      item={hit}
      template={furnishingConfig.algolia.primaryIndex.template}
      slug="furnishing"
      extractor={getFurnishingProductHitValues}
      disableHighlight
    />
  ),
  renderResultGroup: (group, _isExpanded, context) => (
    <CarouselResultGroup
      group={group as DisplayGroup}
      query={context?.query}
      {...carousel}
    />
  ),
  renderStreamingDisplay: ({ intro, groups, streamingGroup }) => (
    <StreamingDisplayResults
      intro={intro}
      groups={groups as DisplayGroup[]}
      streamingGroup={streamingGroup as PartialDisplayGroup | null}
      {...carousel}
    />
  ),
}
