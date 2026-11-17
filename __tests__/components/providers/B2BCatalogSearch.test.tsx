import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Autocomplete,
  Index,
  InstantSearch,
  useClearRefinements,
  useHits,
  useRefinementList,
  useSearchBox,
  useSortBy,
} from 'react-instantsearch'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { B2BVisibilityFacet } from '@/app/b2b-warehouse/_components/B2BVisibilityFacet'
import { useB2BCustomerGroupPolicy } from '@/app/b2b-warehouse/_hooks/useB2BCustomerGroupPolicy'
import { useAutocompleteIndices } from '@/components/autocomplete/hooks/useAutocompleteIndices'
import { CategoryPage } from '@/components/category/CategoryPage'
import { CollectionPage } from '@/components/collection/CollectionPage'
import { SearchConfigure } from '@/components/providers/SearchConfigure'
import { GeoSearchConfigure } from '@/components/storeLocator/GeoSearchConfigure'
import { useStoreIdFilter } from '@/hooks/useStoreIdFilter'
import { activeConfigAtom } from '@/stores/activeConfig'
import {
  personalizationStore,
  setPersonaModeAtom,
} from '@/stores/personalization'
import { searchClientAtom, searchClientKeyAtom } from '@/stores/searchClient'
import { selectedStoreAtom, selectedStoreStore } from '@/stores/selectedStore'

import { GROUP_0, GROUP_1 } from '@tests/helpers/customerGroups'
import { createTestStore } from '@tests/helpers/jotai-wrapper'
import {
  buildProvidersWrapper,
  createMockConfig,
  createMockSearchClient,
} from '@tests/helpers/test-utils'

const route = vi.hoisted(() => {
  return { query: '', replace: vi.fn() }
})
vi.mock('next/navigation', () => {
  return {
    useParams: () => {
      return { slug: 'tools' }
    },
    useSearchParams: () => new URLSearchParams(route.query),
    usePathname: () => '/b2b-warehouse/search',
    useRouter: () => {
      return { replace: route.replace }
    },
  }
})
vi.mock('@/hooks/useScrollToTop', () => {
  return { useScrollToTop: () => undefined }
})
vi.mock('@/features/aiAssistant', () => {
  return {
    useOpenAssistantPanel: () => {
      return { openWithMessage: vi.fn() }
    },
  }
})

interface SearchRequest {
  indexName: string
  params?: Record<string, unknown>
}
const setup = (
  productHits: Record<string, unknown>[] = [],
  suggestionHits: Record<string, unknown>[] = [],
) => {
  const search = vi.fn(async (requests: SearchRequest[]) => {
    return {
      results: requests.map(({ indexName, params }) => {
        return {
          index: indexName,
          hits:
            indexName === 'products'
              ? productHits
              : indexName === 'suggestions'
                ? suggestionHits
                : [],
          nbHits: 0,
          nbPages: 0,
          page: params?.page ?? 0,
          hitsPerPage: 20,
          processingTimeMS: 0,
          exhaustiveNbHits: true,
          query: params?.query ?? '',
          params: '',
          facets: {
            brand: { DEWALT: 1 },
            visible_by: { customer_group_0: 1, customer_group_1: 1 },
          },
        }
      }),
    }
  })
  const client = createMockSearchClient({ search })
  const store = createTestStore((s) => {
    s.set(
      activeConfigAtom,
      createMockConfig({
        slug: 'b2b-warehouse',
        algolia: {
          appId: 'APP',
          apiKey: 'KEY',
          primaryIndex: {
            name: 'products',
            replicas: [{ label: 'Price', indexName: 'products_price' }],
            template: { attributes: { name: 'name', sku: 'product.sku' } },
          },
          indices: {
            locations: { name: 'locations' },
            querySuggestions: { name: 'suggestions' },
            aiSuggestions: { name: 'ai_suggestions' },
          },
        },
        features: { agentStudio: {}, personalization: { enabled: true } },
        navigation: [{ label: 'Tools', category: 'Tools' }],
        collections: [{ collection: 'Tools', label: 'Tools' }],
      }),
    )
    s.set(searchClientAtom, client)
    s.set(searchClientKeyAtom, 'standard')
  })
  personalizationStore.set(setPersonaModeAtom, GROUP_0)
  selectedStoreStore.set(selectedStoreAtom, {
    vertical: 'b2b-warehouse',
    storeId: '1',
  })
  const { Wrapper } = buildProvidersWrapper({ store })
  const requests = () => search.mock.calls.flatMap(([batch]) => batch)
  const latest = (index = 'products') =>
    requests()
      .filter(
        (request) =>
          request.indexName === index && request.params?.hitsPerPage !== 0,
      )
      .at(-1)?.params
  const mount = (children: React.ReactNode, configure = true) =>
    render(
      <InstantSearch
        searchClient={client}
        indexName="products"
        insights={false}>
        {configure && <SearchConfigure />}
        {children}
      </InstantSearch>,
      { wrapper: Wrapper },
    )
  return { mount, store, latest, search, requests }
}

const Controls = () => {
  const { refine: query } = useSearchBox()
  const { refine: brand } = useRefinementList({ attribute: 'brand' })
  const { refine: clear } = useClearRefinements()
  const { refine: sort } = useSortBy({
    items: [
      { label: 'Default', value: 'products' },
      { label: 'Price', value: 'products_price' },
    ],
  })
  const { clear: clearStore } = useStoreIdFilter()
  useHits()
  return (
    <>
      <button onClick={() => query('drill')}>Query</button>
      <button onClick={() => query('')}>Clear query</button>
      <button onClick={() => brand('DEWALT')}>Brand</button>
      <button onClick={clear}>Clear facets</button>
      <button onClick={() => sort('products_price')}>Sort</button>
      <button onClick={clearStore}>Clear warehouse</button>
    </>
  )
}

const VisibilityControls = () => {
  const policy = useB2BCustomerGroupPolicy()
  return (
    <>
      <B2BVisibilityFacet
        groupId={policy.status === 'ready' ? policy.groupId : null}
      />
      <Controls />
    </>
  )
}

interface AutocompleteForTestProps {
  hitsPerPage?: number
  querySuggestionsHitsPerPage?: number
}

const AutocompleteForTest = ({
  hitsPerPage = 3,
  querySuggestionsHitsPerPage,
}: AutocompleteForTestProps) => {
  const { indices, suggestionsConfig, transformItems } = useAutocompleteIndices(
    {
      basePath: '/b2b-warehouse',
      hitsPerPage,
      querySuggestionsHitsPerPage,
      showProducts: true,
      showSuggestions: true,
      showAISuggestions: true,
      showRecent: false,
      showRecipes: false,
      showSku: true,
    },
  )
  return (
    <Autocomplete
      indices={indices}
      showQuerySuggestions={suggestionsConfig}
      transformItems={transformItems}
    />
  )
}

describe('B2B InstantSearch requests', () => {
  beforeEach(() => {
    route.query = ''
    route.replace.mockClear()
  })

  it('keeps persona visibility after clearing ordinary refinements', async () => {
    const { mount, latest, store } = setup()
    const user = userEvent.setup()
    personalizationStore.set(setPersonaModeAtom, null)
    mount(<VisibilityControls />)

    await user.click(screen.getByRole('checkbox', { name: 'Customer Group 1' }))
    await waitFor(() =>
      expect(latest()?.facetFilters).toEqual([['visible_by:customer_group_1']]),
    )
    expect(latest()?.filters).toBe('availableInStores.objectID:"1"')

    await user.click(screen.getByText('Brand'))
    await waitFor(() =>
      expect(latest()?.facetFilters).toEqual(
        expect.arrayContaining([
          ['visible_by:customer_group_1'],
          ['brand:DEWALT'],
        ]),
      ),
    )

    act(() => store.set(setPersonaModeAtom, GROUP_0))
    await waitFor(() => {
      expect(latest()?.filters).toBe(
        'visible_by:"customer_group_0" AND availableInStores.objectID:"1"',
      )
      expect(latest()?.facetFilters).toEqual([['brand:DEWALT']])
    })
    await user.click(screen.getByText('Clear facets'))
    await waitFor(() => expect(latest()?.facetFilters).toBeUndefined())
    expect(screen.getByRole('checkbox', { name: /Customer Group 0/ })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /Customer Group 0/ })).toBeDisabled()
    expect(latest()?.filters).toBe(
      'visible_by:"customer_group_0" AND availableInStores.objectID:"1"',
    )
  })

  it('keeps eligibility during query, facet, clear and replica changes', async () => {
    const { mount, latest, requests, store } = setup()
    const user = userEvent.setup()
    mount(<Controls />)
    const filters =
      'visible_by:"customer_group_0" AND availableInStores.objectID:"1"'
    await waitFor(() => expect(latest()?.filters).toBe(filters))
    expect(latest()?.ruleContexts).toEqual(['customer_group_0'])
    await user.click(screen.getByText('Query'))
    await waitFor(() => expect(latest()?.query).toBe('drill'))
    await user.click(screen.getByText('Brand'))
    await waitFor(() =>
      expect(latest()?.facetFilters).toEqual([['brand:DEWALT']]),
    )
    await user.click(screen.getByText('Clear query'))
    await waitFor(() => expect(latest()?.query).toBe(''))
    await user.click(screen.getByText('Clear facets'))
    await waitFor(() => expect(latest()?.facetFilters).toBeUndefined())
    await user.click(screen.getByText('Sort'))
    await waitFor(() => expect(latest('products_price')?.filters).toBe(filters))
    expect(
      requests()
        .filter((request) => request.indexName.startsWith('products'))
        .every((request) => request.params?.filters === filters),
    ).toBe(true)
    act(() => personalizationStore.set(setPersonaModeAtom, GROUP_1))
    await waitFor(() =>
      expect(latest('products_price')?.filters).toContain('customer_group_1'),
    )
    expect(latest('products_price')?.ruleContexts).toEqual(['customer_group_1'])
    await user.click(screen.getByText('Clear warehouse'))
    await waitFor(() =>
      expect(latest('products_price')?.filters).toBe(
        'visible_by:"customer_group_1"',
      ),
    )
  })

  it.each([
    [
      'category',
      <CategoryPage key="category" indexId="category">
        {() => <Controls />}
      </CategoryPage>,
      'categoryPageId:"Tools"',
    ],
    [
      'collection',
      <CollectionPage key="collection" indexId="collection">
        {() => <Controls />}
      </CollectionPage>,
      '_collections:"Tools"',
    ],
  ])(
    'combines inherited eligibility with %s filters',
    async (_name, children, prefix) => {
      const { mount, requests, store } = setup()
      mount(children)
      await waitFor(() =>
        expect(
          requests().some(
            (request) =>
              request.params?.filters ===
              `${prefix} AND visible_by:"customer_group_0" AND availableInStores.objectID:"1"`,
          ),
        ).toBe(true),
      )
      expect(
        requests()
          .filter((request) => request.indexName === 'products')
          .every((request) =>
            String(request.params?.filters).includes(
              'visible_by:"customer_group_0"',
            ),
          ),
      ).toBe(true)
      act(() => personalizationStore.set(setPersonaModeAtom, GROUP_1))
      await waitFor(() =>
        expect(
          requests().some(
            (request) =>
              request.params?.filters ===
              `${prefix} AND visible_by:"customer_group_1" AND availableInStores.objectID:"1"`,
          ),
        ).toBe(true),
      )
    },
  )

  it('hydrates an incoming warehouse URL and keeps it cleared while the URL update is pending', async () => {
    route.query = 'storeId=2&query=drill'
    const { mount, latest, store } = setup()
    selectedStoreStore.set(selectedStoreAtom, null)
    const user = userEvent.setup()
    mount(<Controls />)
    await waitFor(() =>
      expect(latest()?.filters).toBe(
        'visible_by:"customer_group_0" AND availableInStores.objectID:"2"',
      ),
    )
    await user.click(screen.getByText('Clear warehouse'))
    await waitFor(() =>
      expect(latest()?.filters).toBe('visible_by:"customer_group_0"'),
    )
    expect(route.replace).toHaveBeenCalledWith(
      '/b2b-warehouse/search?query=drill',
      { scroll: false },
    )
  })

  it('does not pass product eligibility to the warehouse index', async () => {
    const { mount, latest } = setup()
    mount(
      <Index indexName="locations">
        <GeoSearchConfigure extraFilters="" />
      </Index>,
    )
    await waitFor(() => expect(latest('locations')?.filters).toBe(''))
  })

  it('filters autocomplete products without filtering query or AI suggestions', async () => {
    const { mount, latest, store } = setup()
    const user = userEvent.setup()
    mount(<AutocompleteForTest />, false)
    await user.type(screen.getByRole('combobox'), 'drill')
    await waitFor(() =>
      expect(latest()?.filters).toBe(
        'visible_by:"customer_group_0" AND availableInStores.objectID:"1"',
      ),
    )
    expect(latest()?.ruleContexts).toEqual(['customer_group_0'])
    await waitFor(() => expect(latest('suggestions')).toBeDefined())
    expect(latest('suggestions')?.filters).toBeUndefined()
    expect(latest('ai_suggestions')?.filters).toBeUndefined()
    act(() => personalizationStore.set(setPersonaModeAtom, GROUP_1))
    await waitFor(() => expect(latest()?.filters).toContain('customer_group_1'))
    expect(latest()?.ruleContexts).toEqual(['customer_group_1'])
    expect(screen.getByRole('combobox')).toHaveValue('drill')
  })

  it('uses the configured query-suggestion limit', async () => {
    const { mount, latest } = setup()
    const user = userEvent.setup()
    mount(<AutocompleteForTest querySuggestionsHitsPerPage={5} />, false)

    await user.type(screen.getByRole('combobox'), 'drill')

    await waitFor(() => expect(latest('suggestions')?.hitsPerPage).toBe(5))
  })

  it('keeps the default suggestion limit when the product limit changes', async () => {
    const { mount, latest } = setup()
    const user = userEvent.setup()
    mount(<AutocompleteForTest hitsPerPage={6} />, false)

    await user.type(screen.getByRole('combobox'), 'drill')

    await waitFor(() => expect(latest('suggestions')?.hitsPerPage).toBe(3))
  })

  it('limits keyboard navigation to the requested suggestion hits', async () => {
    const suggestionHits = ['drill bit', 'drill press', 'drill stand'].map(
      (query, index) => {return {
        objectID: String(index),
        query,
        _highlightResult: {
          query: { value: query, matchLevel: 'full' },
        },
      }},
    )
    const { mount } = setup([], suggestionHits)
    const user = userEvent.setup()
    mount(<AutocompleteForTest querySuggestionsHitsPerPage={3} />, false)

    const input = screen.getByRole('combobox')
    await user.type(input, 'drill')
    await screen.findByText('drill stand')

    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}')

    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-activedescendant',
    )
    expect(screen.getAllByText(/drill (bit|press|stand)/)).toHaveLength(3)
    expect(screen.getByText('drill stand').closest('li')).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('omits rule contexts when no customer group is selected', async () => {
    const { mount, latest } = setup()
    personalizationStore.set(setPersonaModeAtom, null)
    mount(<Controls />)

    await waitFor(() =>
      expect(latest()?.filters).toBe('availableInStores.objectID:"1"'),
    )
    expect(latest()).not.toHaveProperty('ruleContexts')
  })

  it('hides old autocomplete products as soon as group selection changes', async () => {
    const { mount, search, store } = setup([
      {
        objectID: 'A',
        name: 'Group zero drill',
        product: { sku: ['DRILL-0', 'DRILL-1'] },
        _highlightResult: {
          name: { value: 'Group zero drill', matchLevel: 'none' },
          product: {
            sku: [
              { value: 'DRILL-0', matchLevel: 'none' },
              { value: 'DRILL-1', matchLevel: 'none' },
            ],
          },
        },
        visible_by: [GROUP_0.groupId],
        availableInStores: [{ objectID: '1' }],
      },
      {
        objectID: 'B',
        name: 'Group one drill',
        _highlightResult: {
          name: { value: 'Group one drill', matchLevel: 'none' },
        },
        visible_by: [GROUP_1.groupId],
        availableInStores: [{ objectID: '1' }],
      },
    ])
    mount(<AutocompleteForTest />, false)
    await userEvent.setup().type(screen.getByRole('combobox'), 'drill')
    await waitFor(() =>
      expect(screen.getByText('Group zero drill')).toBeInTheDocument(),
    )
    expect(screen.getByText('SKU:')).toHaveTextContent(
      'SKU: DRILL-0, DRILL-1',
    )
    expect(screen.queryByText('Group one drill')).not.toBeInTheDocument()
    search.mockImplementation(() => new Promise(() => {}))
    act(() => personalizationStore.set(setPersonaModeAtom, GROUP_1))
    await waitFor(() =>
      expect(screen.queryByText('Group zero drill')).not.toBeInTheDocument(),
    )
  })
})
