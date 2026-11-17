import { ArticleCard } from '@/app/travel/_components/ArticleCard'
import { StreamingTravelDisplayResults } from '@/features/aiAssistant/components/messages/travel/StreamingTravelDisplayResults'
import { TravelResultGroup } from '@/features/aiAssistant/components/messages/travel/TravelResultGroup'
import { extractTravelDisplayResultsStream } from '@/features/aiAssistant/tools/parsing/travelDisplayResultsParser'
import type {
  PartialTravelDisplayGroup,
  TravelDisplayGroup,
} from '@/features/aiAssistant/types'
import type { VerticalConfig } from '@/features/aiAssistant/verticals/types'

export const travelVertical: VerticalConfig = {
  slug: 'travel',
  personaStarters: 'curated',
  streamingParser: extractTravelDisplayResultsStream,
  followUpLabel: 'travel content',
  placeholderText: 'Ask about travel...',
  emptyStateText: 'Ask me anything about travel!',
  suggestedQuestions: [
    'Where should I go for a beach vacation?',
    'Plan a weekend city break in Europe',
    'Find family-friendly destinations',
    'What are the best trips for solo travelers?',
  ],
  renderTrendingItem: (hit) => <ArticleCard hit={hit} />,
  renderResultGroup: (group, isExpanded, context) => (
    <TravelResultGroup
      group={group as TravelDisplayGroup}
      isExpanded={isExpanded}
      query={context?.query}
    />
  ),
  renderStreamingDisplay: ({ intro, groups, streamingGroup, isExpanded }) => (
    <StreamingTravelDisplayResults
      intro={intro}
      groups={groups as TravelDisplayGroup[]}
      streamingGroup={streamingGroup as PartialTravelDisplayGroup | null}
      isExpanded={isExpanded}
    />
  ),
}
