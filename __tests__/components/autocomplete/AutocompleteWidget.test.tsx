import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { AutocompletePanelSections } from '@/components/autocomplete/AutocompletePanel'
import { AutocompleteWidget } from '@/components/autocomplete/AutocompleteWidget'

import type { ComponentProps, ReactElement, ReactNode } from 'react'

interface CapturedAutocompleteProps {
  indices: { indexName: string }[]
  panelComponent: (props: {
    elements: Record<string, ReactNode>
  }) => ReactElement
}

const { autocomplete, useAutocompleteIndices, useMediaQuery } = vi.hoisted(
  () => {return {
    autocomplete: vi.fn((_props: unknown) => null),
    useAutocompleteIndices: vi.fn(),
    useMediaQuery: vi.fn(),
  }},
)

vi.mock('react-instantsearch', () => {return {
  Autocomplete: (props: unknown) => autocomplete(props),
}})
vi.mock('instantsearch.css/themes/satellite.css', () => {return {}})
vi.mock('next/navigation', () => {return {
  useRouter: () => {return { push: vi.fn() }},
  usePathname: () => '/fashion',
}})
vi.mock('@/components/autocomplete/AutocompleteProvider', () => {return {
  AutocompleteProvider: ({ children }: { children: ReactNode }) => children,
}})
vi.mock('@/components/autocomplete/AutocompleteResetBoundary', () => {return {
  AutocompleteResetBoundary: ({ children }: { children: ReactNode }) =>
    children,
}})
vi.mock('@/components/autocomplete/hooks', () => {return {
  useAIButtonInjection: vi.fn(),
  useAutocompleteIndices,
}})
vi.mock('@/features/aiAssistant', async () => {
  const { atom } = await import('jotai')
  return { isAIAssistantOpenState: atom(false) }
})
vi.mock('@/stores/searchClient', async () => {
  const { atom } = await import('jotai')
  return { searchClientAtom: atom({ search: vi.fn() }) }
})
vi.mock('@/hooks/useIntentRouting', () => {return {
  useIntentRouting: () => {return { routeIfConversational: vi.fn() }},
}})
vi.mock('@/hooks/useMediaQuery', () => {return { useMediaQuery }})
vi.mock('@/hooks/useSearchParameters', () => {return {
  useSearchParameters: () => {return {}},
}})

const ARTICLES_INDEX = {
  indexName: 'fashion_articles',
  headerComponent: () => <span>Guides</span>,
  itemComponent: () => <span>Guide</span>,
  getURL: (item: Record<string, unknown>) => `/guide/${item.objectID}`,
}

const capturePanel = vi.fn((_sections: AutocompletePanelSections) => null)

const PanelSpy = ({ sections }: { sections: AutocompletePanelSections }) =>
  capturePanel(sections)

const renderWidget = (
  props: Partial<ComponentProps<typeof AutocompleteWidget>> = {},
) => {
  render(
    <AutocompleteWidget
      basePath="/fashion"
      panelComponent={PanelSpy}
      {...props}
    />,
  )
  return autocomplete.mock.lastCall?.[0] as CapturedAutocompleteProps
}

const renderPanel = (
  { panelComponent }: CapturedAutocompleteProps,
  elements: Record<string, ReactNode>,
) => {
  render(panelComponent({ elements }))
  return capturePanel.mock.lastCall?.[0]
}

describe('AutocompleteWidget', () => {
  beforeEach(() => {
    autocomplete.mockClear()
    capturePanel.mockClear()
    useMediaQuery.mockReturnValue(false)
    useAutocompleteIndices.mockReturnValue({
      indices: [{ indexName: 'products' }],
      transformItems: (items: unknown[]) => items,
      suggestionsConfig: undefined,
      recentConfig: undefined,
      primaryIndexName: 'products',
      aiSuggestionsIndexName: undefined,
      recipesIndexName: undefined,
    })
  })

  it('appends the articles index after the configured indices', () => {
    const { indices } = renderWidget({ articlesIndex: ARTICLES_INDEX })
    expect(indices.map(({ indexName }) => indexName)).toEqual([
      'products',
      'fashion_articles',
    ])
  })

  it('passes only the configured indices without an articles index', () => {
    const { indices } = renderWidget()
    expect(indices.map(({ indexName }) => indexName)).toEqual(['products'])
  })

  it('maps the articles index element to the articles panel section', () => {
    const props = renderWidget({ articlesIndex: ARTICLES_INDEX })
    const elements = {
      products: <div>Products</div>,
      fashion_articles: <div>Guides list</div>,
    }
    const sections = renderPanel(props, elements)

    expect(sections?.products).toBe(elements.products)
    expect(sections?.articles).toBe(elements.fashion_articles)
    expect(sections?.recipes).toBeUndefined()
  })

  it('leaves the articles section empty without an articles index', () => {
    const props = renderWidget()
    const sections = renderPanel(props, {
      products: <div>Products</div>,
      fashion_articles: <div>Guides list</div>,
    })

    expect(sections?.articles).toBeUndefined()
  })

  it('uses the inline suggestion limit outside the detached layout', () => {
    renderWidget({ querySuggestionsHitsPerPage: 5 })
    expect(useMediaQuery).toHaveBeenCalledWith('(max-width: 1023px)')
    expect(useAutocompleteIndices).toHaveBeenLastCalledWith(
      expect.objectContaining({ querySuggestionsHitsPerPage: 5 }),
    )
  })

  it('caps suggestions at three in the detached layout', () => {
    useMediaQuery.mockReturnValue(true)
    renderWidget({ querySuggestionsHitsPerPage: 5 })
    expect(useAutocompleteIndices).toHaveBeenLastCalledWith(
      expect.objectContaining({ querySuggestionsHitsPerPage: 3 }),
    )
  })
})
