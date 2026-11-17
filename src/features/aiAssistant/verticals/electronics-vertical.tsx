import { getElectronicsProductHitValues } from '@/app/electronics/_utils/getElectronicsProductHitValues'
import { electronicsConfig } from '@/app/electronics/config'
import { Hit } from '@/components/hit/Hit'
import { CarouselResultGroup } from '@/features/aiAssistant/components/messages/CarouselResultGroup'
import { ElectronicsProductCard } from '@/features/aiAssistant/components/messages/electronics/ElectronicsProductCard'
import type { ProductCarouselPresentation } from '@/features/aiAssistant/components/messages/productCarousel'
import { StreamingDisplayResults } from '@/features/aiAssistant/components/messages/StreamingDisplayResults'
import { extractDisplayResultsStream } from '@/features/aiAssistant/tools/parsing/displayResultsParser'
import type {
  DisplayGroup,
  PartialDisplayGroup,
} from '@/features/aiAssistant/types'
import type { VerticalConfig } from '@/features/aiAssistant/verticals/types'

const carousel: ProductCarouselPresentation = {
  card: ElectronicsProductCard,
}

export const electronicsVertical: VerticalConfig = {
  slug: 'electronics',
  streamingParser: extractDisplayResultsStream,
  followUpLabel: '',
  placeholderText: 'Ask about electronics...',
  emptyStateText: 'Ask me anything about our electronics!',
  suggestedQuestions: [
    'What are the top-rated laptops?',
    'Find noise-cancelling headphones',
    'Show me smartwatches under $300',
    'Recommend a 4K TV for a small living room',
  ],
  renderTrendingItem: (hit) => (
    <Hit
      variant="standard"
      item={hit}
      template={electronicsConfig.algolia.primaryIndex.template}
      slug="electronics"
      extractor={getElectronicsProductHitValues}
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
