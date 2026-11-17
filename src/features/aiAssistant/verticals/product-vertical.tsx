import { getEcommerceProductHitValues } from '@/app/ecommerce/_utils/getEcommerceProductHitValues'
import { ecommerceConfig } from '@/app/ecommerce/config'
import { Hit } from '@/components/hit/Hit'
import { CarouselResultGroup } from '@/features/aiAssistant/components/messages/CarouselResultGroup'
import { EcommerceProductCard } from '@/features/aiAssistant/components/messages/ecommerce/EcommerceProductCard'
import type { ProductCarouselPresentation } from '@/features/aiAssistant/components/messages/productCarousel'
import { StreamingDisplayResults } from '@/features/aiAssistant/components/messages/StreamingDisplayResults'
import { extractDisplayResultsStream } from '@/features/aiAssistant/tools/parsing/displayResultsParser'
import type {
  DisplayGroup,
  PartialDisplayGroup,
} from '@/features/aiAssistant/types'
import type { VerticalConfig } from '@/features/aiAssistant/verticals/types'

const carousel: ProductCarouselPresentation = {
  card: EcommerceProductCard,
}

export const productVertical: VerticalConfig = {
  slug: 'product',
  streamingParser: extractDisplayResultsStream,
  followUpLabel: '',
  placeholderText: 'Ask about products...',
  emptyStateText: 'Ask me anything about our products!',
  suggestedQuestions: [
    'Help me find a gift under $50',
    "I'm looking for running shoes",
    'Show me the latest arrivals in jackets',
    'What are the top-rated headphones?',
  ],
  renderTrendingItem: (hit) => (
    <Hit
      variant="standard"
      item={hit}
      template={ecommerceConfig.algolia.primaryIndex.template}
      slug="ecommerce"
      extractor={getEcommerceProductHitValues}
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
