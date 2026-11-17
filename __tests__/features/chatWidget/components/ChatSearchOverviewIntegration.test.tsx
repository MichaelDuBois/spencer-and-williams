import { render, screen, waitFor } from '@testing-library/react'
import { InstantSearch, useSearchBox } from 'react-instantsearch'
import { describe, expect, it, vi } from 'vitest'

import { ChatSearchOverview } from '@/features/chatWidget/components/ChatSearchOverview'

vi.mock('@/features/chatWidget/hooks/useIsChatWidgetActive', () => {return {
  useIsChatWidgetActive: () => true,
}})
vi.mock('@/hooks/useActiveConfig', () => {return {
  useActiveConfig: () => {return { features: { agentStudio: { chatWidgetAgentID: 'travel-agent' } } }},
}})

const VirtualSearchBox = () => {
  useSearchBox()
  return null
}

describe('Travel overview activation', () => {
  it.each(['travel_media_articles', 'travel_media_podcasts'])(
    'shows the real result card for a matching %s search rule',
    async (indexName) => {
    const search = vi.fn(async (requests: { indexName: string; params: { query?: string; ruleContexts?: string[] } }[]) => {return {
      results: requests.map(({ indexName, params }) => {return {
        index: indexName,
        query: params.query ?? '',
        hits: [{ objectID: 'one', title: 'Hiking' }],
        nbHits: 1,
        page: 0,
        nbPages: 1,
        hitsPerPage: 20,
        processingTimeMS: 1,
        params: '',
        exhaustiveNbHits: true,
        renderingContent: { widgets: { resultCard: { enabled: true } } },
      }}),
    }})
    const client = { appId: 'test-app', apiKey: 'test-key', search }
    render(
      <InstantSearch searchClient={client as never} indexName={indexName} initialUiState={{ [indexName]: { query: 'best hiking options' } }}>
        <VirtualSearchBox />
        <ChatSearchOverview />
      </InstantSearch>,
    )
    expect(await screen.findByText('AI Overview')).toBeInTheDocument()
    await waitFor(() => expect(search).toHaveBeenCalled())
    expect(search.mock.calls.some(([requests]) => requests.some((request) =>
      request.indexName === indexName &&
      request.params.ruleContexts?.includes('agent-studio-result-card-travel-agent'),
    ))).toBe(true)
    },
  )
})
