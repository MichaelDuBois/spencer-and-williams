import { B2BHit } from '@/app/b2b-warehouse/_components/B2BHit'
import { getB2BWarehouseProductHitValues } from '@/app/b2b-warehouse/_utils/getB2BWarehouseProductHitValues'
import { b2bWarehouseConfig } from '@/app/b2b-warehouse/config'
import { B2BWarehouseProductCard } from '@/features/aiAssistant/components/messages/b2b-warehouse/B2BWarehouseProductCard'
import { CarouselResultGroup } from '@/features/aiAssistant/components/messages/CarouselResultGroup'
import type { ProductCarouselPresentation } from '@/features/aiAssistant/components/messages/productCarousel'
import { StreamingDisplayResults } from '@/features/aiAssistant/components/messages/StreamingDisplayResults'
import { extractDisplayResultsStream } from '@/features/aiAssistant/tools/parsing/displayResultsParser'
import type {
  DisplayGroup,
  PartialDisplayGroup,
} from '@/features/aiAssistant/types'
import type { VerticalConfig } from '@/features/aiAssistant/verticals/types'

const carousel: ProductCarouselPresentation = {
  card: B2BWarehouseProductCard,
}

export const b2bWarehouseVertical: VerticalConfig = {
  slug: 'b2b-warehouse',
  streamingParser: extractDisplayResultsStream,
  followUpLabel: '',
  placeholderText: 'Ask about supplies...',
  emptyStateText: 'Ask me anything about our industrial supplies!',
  suggestedQuestions: [
    'Show me safety gear for a jobsite',
    'Find cutting tools for metalworking',
    'Find power tools under $200',
    'Show me bulk fasteners in stock',
  ],
  renderTrendingItem: (hit) => (
    <B2BHit
      variant="b2b-warehouse"
      item={hit}
      template={b2bWarehouseConfig.algolia.primaryIndex.template}
      slug="b2b-warehouse"
      extractor={getB2BWarehouseProductHitValues}
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
