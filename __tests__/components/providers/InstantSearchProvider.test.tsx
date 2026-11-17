import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider, createStore } from 'jotai'
import {
  PathnameContext,
  SearchParamsContext,
} from 'next/dist/shared/lib/hooks-client-context.shared-runtime'
import { useState } from 'react'
import { useSearchBox } from 'react-instantsearch'
import { expect, it, vi } from 'vitest'

import { InstantSearchProvider } from '@/components/providers/InstantSearchProvider'
import { searchClientAtom } from '@/stores/searchClient'

import type { liteClient } from 'algoliasearch/lite'

const route = vi.hoisted(() => {return {
  pathname: '/travel/search/articles',
  params: new URLSearchParams('query=hiking'),
}})
vi.mock('@/components/providers/SearchConfigure', () => {return {
  SearchConfigure: () => null,
}})
vi.mock('@/features/chatWidget', () => {return {
  InstantSearchChatWidget: () => null,
}})
vi.mock('@/features/chatWidget/components/ChatCompareBar', () => {return {
  ChatCompareBar: () => null,
}})

const PersistentChild = () => {
  const [count, setCount] = useState(0)
  const { query, refine } = useSearchBox()
  return (
    <>
      <button onClick={() => setCount(count + 1)}>Count {count}</button>
      <span>Query: {query}</span>
      <button onClick={() => refine('beaches')}>Refine</button>
    </>
  )
}

it.each([true, false])(
  'switches indices and URL queries without remounting children (client initially ready: %s)',
  async (isClientReady) => {
    route.pathname = '/travel/search/articles'
    route.params = new URLSearchParams('query=hiking')
    window.history.replaceState({}, '', '/travel/search/articles?query=hiking')
    const search = vi.fn(
      async (
        requests: ReadonlyArray<{
          indexName: string
          params?: { query?: string }
        }>,
      ) => {return {
        results: requests.map(({ params }) => {return {
          hits: [],
          nbHits: 0,
          page: 0,
          nbPages: 0,
          hitsPerPage: 20,
          processingTimeMS: 1,
          query: params?.query ?? '',
          params: '',
        }}),
      }},
    )
    const store = createStore()
    const client = { search } as unknown as ReturnType<typeof liteClient>
    if (isClientReady) store.set(searchClientAtom, client)
    const app = (indexName: string) => (
      <PathnameContext.Provider value={route.pathname}>
        <SearchParamsContext.Provider value={route.params}>
          <Provider store={store}>
            <InstantSearchProvider indexName={indexName}>
              <PersistentChild />
            </InstantSearchProvider>
          </Provider>
        </SearchParamsContext.Provider>
      </PathnameContext.Provider>
    )
    const { rerender } = render(
      app(isClientReady ? 'articles' : 'unmounted-index'),
    )
    if (!isClientReady) {
      rerender(app('articles'))
      await act(async () => store.set(searchClientAtom, client))
    }
    await screen.findByText('Query: hiking')
    fireEvent.click(screen.getByText('Count 0'))
    route.pathname = '/travel/search/podcasts'
    route.params = new URLSearchParams('query=mountains')
    window.history.replaceState(
      {},
      '',
      '/travel/search/podcasts?query=mountains',
    )
    rerender(app('podcasts'))
    expect(screen.getByText('Count 1')).toBeInTheDocument()
    await screen.findByText('Query: mountains')
    await waitFor(() =>
      expect(search).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            indexName: 'podcasts',
            params: expect.objectContaining({ query: 'mountains' }),
          }),
        ]),
      ),
    )
    fireEvent.click(screen.getByText('Refine'))
    await waitFor(() =>
      expect(new URLSearchParams(window.location.search).get('query')).toBe(
        'beaches',
      ),
    )
    route.pathname = '/travel/search/articles'
    window.history.replaceState({}, '', '/travel/search/articles?query=beaches')
    route.params = new URLSearchParams('query=beaches')
    rerender(app('articles'))
    expect(screen.getByText('Count 1')).toBeInTheDocument()
    await waitFor(() =>
      expect(search).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            indexName: 'articles',
            params: expect.objectContaining({ query: 'beaches' }),
          }),
        ]),
      ),
    )
  },
)
