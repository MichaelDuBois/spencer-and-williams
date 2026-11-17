import { getFashionProductHitValues } from '@/app/fashion/_utils/getFashionProductHitValues'
import { fashionConfig } from '@/app/fashion/config'
import { Hit } from '@/components/hit/Hit'
import { CarouselResultGroup } from '@/features/aiAssistant/components/messages/CarouselResultGroup'
import { FashionProductCard } from '@/features/aiAssistant/components/messages/fashion/FashionProductCard'
import type { ProductCarouselPresentation } from '@/features/aiAssistant/components/messages/productCarousel'
import { StreamingDisplayResults } from '@/features/aiAssistant/components/messages/StreamingDisplayResults'
import { extractDisplayResultsStream } from '@/features/aiAssistant/tools/parsing/displayResultsParser'
import type {
  DisplayGroup,
  PartialDisplayGroup,
} from '@/features/aiAssistant/types'
import type { VerticalConfig } from '@/features/aiAssistant/verticals/types'

const carousel: ProductCarouselPresentation = {
  card: FashionProductCard,
  carouselClassName: 'gap-4',
  containerClassName: 'space-y-4',
  titleClassName: 'font-secondary tracking-wide',
  skeletonVariant: 'fashion',
}

export const fashionVertical: VerticalConfig = {
  slug: 'fashion',
  streamingParser: extractDisplayResultsStream,
  followUpLabel: '',
  placeholderText: 'Ask about the collection...',
  emptyStateText: 'Ask me anything about our collection!',
  suggestedQuestions: [
    'Show me white sneakers under $120',
    "What men's blue jackets do you have?",
    'Find a dress for a summer wedding under $150',
    'Show me black shoulder bags',
  ],
  renderTrendingItem: (hit) => (
    <Hit
      variant="editorial"
      item={hit}
      template={fashionConfig.algolia.primaryIndex.template}
      slug="fashion"
      extractor={getFashionProductHitValues}
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
