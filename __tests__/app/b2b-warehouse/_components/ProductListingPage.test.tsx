import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InstantSearch } from 'react-instantsearch'
import { expect, it, vi } from 'vitest'

import { ProductListingPage } from '@/app/b2b-warehouse/_components/ProductListingPage'
import { b2bWarehouseConfig } from '@/app/b2b-warehouse/config'
import { PERSONAS } from '@/app/b2b-warehouse/personas'
import { SearchConfigure } from '@/components/providers/SearchConfigure'
import { activeConfigAtom } from '@/stores/activeConfig'
import {
  setPersonaModeAtom,
  setRealtimeModeAtom,
} from '@/stores/personalization'
import { selectedStoreAtom } from '@/stores/selectedStore'
import type { FacetConfig } from '@/types'

import { GROUP_0, GROUP_1 } from '@tests/helpers/customerGroups'
import { createTestStore } from '@tests/helpers/jotai-wrapper'
import {
  buildProvidersWrapper,
  createMockSearchClient,
} from '@tests/helpers/test-utils'

vi.mock('next/navigation', () => {
  return {
    useRouter: () => {
      return { replace: vi.fn() }
    },
    usePathname: () => '/b2b-warehouse/search',
    useSearchParams: () => new URLSearchParams(),
  }
})

vi.mock('@/hooks/useRealtimeProfile', () => {
  return {
    useRealtimeProfile: () => {
      return { data: [] }
    },
  }
})

vi.mock('@/components/filters/FacetFilters', () => {
  return {
    FacetFilters: ({ facets }: { facets: FacetConfig[] }) => (
      <output data-testid="facets">{JSON.stringify(facets)}</output>
    ),
  }
})
vi.mock('@/components/filters/FilterPanel', () => {
  return {
    FilterPanel: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  }
})
vi.mock('@/components/pagination/Pagination', () => {
  return { Pagination: () => null }
})
vi.mock('@/components/results/FilterSuggestionsWidget', () => {
  return { FilterSuggestionsWidget: () => null }
})
vi.mock('@/components/results/HitsWithInjectedContent', () => {
  return { HitsWithInjectedContent: () => null }
})
vi.mock('@/components/results/QueryCatSuggestion', () => {
  return { QueryCatSuggestion: () => null }
})
vi.mock('@/components/results/QueryRuleBanner', () => {
  return { QueryRuleBanner: () => null }
})
vi.mock('@/components/results/SearchResultsHeader', () => {
  return { SearchResultsHeader: () => null }
})

const setup = () => {
  const store = createTestStore((s) =>
    s.set(activeConfigAtom, b2bWarehouseConfig),
  )
  const search = vi.fn(
    async (
      requests: { indexName: string; params?: Record<string, unknown> }[],
    ) => {
      return {
        results: requests.map(({ indexName, params }) => {
          return {
            index: indexName,
            hits: [],
            nbHits: 0,
            nbPages: 0,
            page: 0,
            hitsPerPage: 20,
            processingTimeMS: 0,
            query: params?.query ?? '',
            params: '',
          }
        }),
      }
    },
  )
  render(
    <InstantSearch
      searchClient={createMockSearchClient({ search })}
      indexName="b2b_ns"
      insights={false}>
      <SearchConfigure />
      <ProductListingPage title="Products" />
    </InstantSearch>,
    { wrapper: buildProvidersWrapper({ store }).Wrapper },
  )
  return { store, search }
}

it('labels the range as base price for groups while preserving its indexed attribute and normal-persona labels', () => {
  const { store } = setup()
  const priceFacet = () =>
    (
      JSON.parse(screen.getByTestId('facets').textContent!) as FacetConfig[]
    ).find((facet) => facet.attribute === 'price')
  expect(priceFacet()).toMatchObject({
    label: 'Price',
    type: 'slider',
    attribute: 'price',
    prefix: '$',
  })
  for (const group of [GROUP_0, GROUP_1]) {
    act(() => store.set(setPersonaModeAtom, group))
    expect(priceFacet()).toMatchObject({
      label: 'Base price',
      type: 'slider',
      attribute: 'price',
      prefix: '$',
    })
  }
  act(() => store.set(setRealtimeModeAtom))
  expect(priceFacet()?.label).toBe('Price')
  act(() => store.set(setPersonaModeAtom, PERSONAS[0]))
  expect(priceFacet()?.label).toBe('Price')
  expect(
    b2bWarehouseConfig.algolia.primaryIndex.facets?.find(
      (facet) => facet.attribute === 'price',
    )?.label,
  ).toBe('Price')
})

it('places visibility above the standard facets', () => {
  setup()

  expect(screen.getByRole('group', { name: 'Visible by' })).toBeVisible()
  expect(screen.getByRole('checkbox', { name: 'Customer Group 0' })).toBeEnabled()
  expect(
    JSON.parse(screen.getByTestId('facets').textContent!) as FacetConfig[],
  ).not.toContainEqual(expect.objectContaining({ attribute: 'visible_by' }))
})

it.each([GROUP_0, GROUP_1])(
  'keeps replica sorting available with $label and a warehouse selected',
  async (group) => {
    const user = userEvent.setup()
    const { store, search } = setup()
    await user.click(screen.getByRole('button', { name: 'Relevance' }))
    await user.click(screen.getByRole('button', { name: 'Price: Low to High' }))
    act(() => {
      store.set(setPersonaModeAtom, group)
      store.set(selectedStoreAtom, { vertical: 'b2b-warehouse', storeId: '1' })
    })
    expect(
      screen.getByRole('button', { name: 'Price: Low to High' }),
    ).toBeEnabled()
    await user.click(screen.getByRole('button', { name: 'Price: Low to High' }))
    await user.click(screen.getByRole('button', { name: 'Price: High to Low' }))
    await waitFor(() =>
      expect(search.mock.calls.flatMap(([requests]) => requests)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            indexName: 'b2b_ns_price_desc',
            params: expect.objectContaining({
              filters: `visible_by:"${group.groupId}" AND availableInStores.objectID:"1"`,
            }),
          }),
        ]),
      ),
    )
    expect(
      screen.queryByText(/Price sorting is unavailable/),
    ).not.toBeInTheDocument()
  },
)
