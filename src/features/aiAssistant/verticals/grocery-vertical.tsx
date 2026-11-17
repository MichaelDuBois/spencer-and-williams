import { getGroceryProductHitValues } from '@/app/grocery/_utils/getGroceryProductHitValues'
import { groceryConfig } from '@/app/grocery/config'
import { Hit } from '@/components/hit/Hit'
import { CarouselResultGroup } from '@/features/aiAssistant/components/messages/CarouselResultGroup'
import { GroceryProductCard } from '@/features/aiAssistant/components/messages/grocery/GroceryProductCard'
import type { ProductCarouselPresentation } from '@/features/aiAssistant/components/messages/productCarousel'
import { StreamingDisplayResults } from '@/features/aiAssistant/components/messages/StreamingDisplayResults'
import { extractDisplayResultsStream } from '@/features/aiAssistant/tools/parsing/displayResultsParser'
import type {
  DisplayGroup,
  PartialDisplayGroup,
} from '@/features/aiAssistant/types'
import type { VerticalConfig } from '@/features/aiAssistant/verticals/types'

const carousel: ProductCarouselPresentation = {
  card: GroceryProductCard,
  carouselClassName: 'items-stretch gap-2',
  containerClassName: 'space-y-4',
  titleClassName: 'font-semibold tracking-wide',
  skeletonVariant: 'grocery',
}

export const groceryVertical: VerticalConfig = {
  slug: 'grocery',
  streamingParser: extractDisplayResultsStream,
  followUpLabel: '',
  placeholderText: 'Ask about groceries...',
  emptyStateText: 'Ask me anything about our groceries!',
  suggestedQuestions: [
    'Find healthy protein snacks under $10',
    'Show me organic pantry essentials',
    'What gluten-free breakfast options do you have?',
    'What are the top-rated beverages?',
  ],
  renderTrendingItem: (hit) => (
    <Hit
      variant="grocery"
      item={hit}
      template={groceryConfig.algolia.primaryIndex.template}
      slug="grocery"
      extractor={getGroceryProductHitValues}
      disableHighlight
    />
  ),
  trendingCarouselVariant: 'grocery',
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
