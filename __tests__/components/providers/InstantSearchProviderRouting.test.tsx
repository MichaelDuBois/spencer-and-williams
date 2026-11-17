import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { InstantSearchProvider } from '@/components/providers/InstantSearchProvider'

import type { ReactNode } from 'react'

const state = vi.hoisted(() => {
  return { routing: null as unknown }
})
vi.mock('jotai', async (importOriginal) => {
  return {
    ...(await importOriginal<typeof import('jotai')>()),
    useAtomValue: () => {
      return { search: vi.fn() }
    },
  }
})
vi.mock('react-instantsearch', () => {
  return {
    useSearchBox: () => {
      return {}
    },
  }
})
vi.mock('react-instantsearch-nextjs', () => {
  return {
    InstantSearchNext: ({
      children,
      routing,
    }: {
      children: ReactNode
      routing: unknown
    }) => {
      state.routing = routing
      return <div>{children}</div>
    },
  }
})
vi.mock('@/components/providers/SearchConfigure', () => {
  return { SearchConfigure: () => null }
})
vi.mock('@/features/chatWidget', () => {
  return { InstantSearchChatWidget: () => null }
})
vi.mock('@/features/chatWidget/components/ChatCompareBar', () => {
  return { ChatCompareBar: () => null }
})

describe('InstantSearchProvider routing', () => {
  it('maps URL queries to the stable root UI-state ID after changing indices', () => {
    const { rerender } = render(
      <InstantSearchProvider indexName="travel_media_articles">
        <div />
      </InstantSearchProvider>,
    )
    rerender(
      <InstantSearchProvider indexName="travel_media_podcasts">
        <div />
      </InstantSearchProvider>,
    )
    const routing = state.routing as {
      stateMapping: {
        routeToState: (route: { query: string }) => Record<string, unknown>
        stateToRoute: (
          state: Record<string, Record<string, unknown>>,
        ) => Record<string, unknown>
      }
    }
    expect(
      routing.stateMapping.routeToState({ query: 'best hiking trip' }),
    ).toEqual({
      travel_media_articles: { query: 'best hiking trip' },
    })
    expect(
      routing.stateMapping.stateToRoute({
        travel_media_articles: { query: 'best hiking trip' },
      }),
    ).toEqual({
      query: 'best hiking trip',
    })
  })
})
