import { BlogHit } from '@/app/b2b-content/_components/hitCards/BlogHit'
import { B2BContentResultGroup } from '@/features/aiAssistant/components/messages/b2b-content/B2BContentResultGroup'
import { StreamingB2BContentDisplayResults } from '@/features/aiAssistant/components/messages/b2b-content/StreamingB2BContentDisplayResults'
import { extractB2BContentDisplayResultsStream } from '@/features/aiAssistant/tools/parsing/b2bContentDisplayResultsParser'
import type {
  B2BContentDisplayGroup,
  PartialB2BContentDisplayGroup,
} from '@/features/aiAssistant/types'
import type { VerticalConfig } from '@/features/aiAssistant/verticals/types'

export const b2bContentVertical: VerticalConfig = {
  slug: 'b2b-content',
  personaStarters: 'curated',
  streamingParser: extractB2BContentDisplayResultsStream,
  followUpLabel: 'B2B content',
  placeholderText: 'Ask about our content...',
  emptyStateText: 'Ask me anything about our content!',
  suggestedQuestions: [
    'How do I get started with the platform?',
    'Find documentation on API authentication',
    'Show me blog posts about AI and machine learning',
    'Show me case studies for enterprise customers',
  ],
  renderTrendingItem: (hit) => (
    <BlogHit
      hit={hit as Parameters<typeof BlogHit>[0]['hit']}
      disableHighlight
    />
  ),
  renderResultGroup: (group, isExpanded, context) => (
    <B2BContentResultGroup
      group={group as B2BContentDisplayGroup}
      isExpanded={isExpanded}
      query={context?.query}
    />
  ),
  renderStreamingDisplay: ({
    intro,
    answer,
    groups,
    streamingGroup,
    isExpanded,
  }) => (
    <StreamingB2BContentDisplayResults
      intro={intro}
      answer={answer}
      groups={groups as B2BContentDisplayGroup[]}
      streamingGroup={streamingGroup as PartialB2BContentDisplayGroup | null}
      isExpanded={isExpanded}
    />
  ),
}
