import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Autocomplete, InstantSearch } from 'react-instantsearch'
import { describe, expect, it, vi } from 'vitest'

import { AutocompleteNoResults } from '@/components/autocomplete/AutocompleteNoResults'

import type { SearchClient } from 'instantsearch.js'

vi.mock('next/navigation', () => {return {
  useRouter: () => {return { push: vi.fn() }},
}})
vi.mock('@/hooks/useNoResultsAssistant', () => {return {
  useNoResultsAssistant: () => {return {
    hasAssistant: false,
    handleAssistant: vi.fn(),
  }},
}})

interface SearchRequest {
  indexName: string
  params?: { query?: string }
}

const renderAutocomplete = (isDetached = false) => {
  const search = vi.fn(async (requests: SearchRequest[]) => {return {
    results: requests.map(({ indexName, params }) => {return {
      index: indexName,
      hits:
        params?.query === 'shoe' ? [{ objectID: 'shoe', name: 'Shoe' }] : [],
      nbHits: params?.query === 'shoe' ? 1 : 0,
      page: 0,
      nbPages: params?.query === 'shoe' ? 1 : 0,
      hitsPerPage: 3,
      processingTimeMS: 1,
      query: params?.query ?? '',
      params: '',
      exhaustiveNbHits: true,
    }}),
  }})

  render(
    <InstantSearch
      searchClient={{ search } as SearchClient}
      indexName="products">
      <Autocomplete
        detachedMediaQuery={isDetached ? '(min-width: 0px)' : ''}
        indices={[
          {
            indexName: 'products',
            itemComponent: () => <span>Shoe</span>,
            noResultsComponent: () => (
              <AutocompleteNoResults basePath="/shop" />
            ),
          },
        ]}
      />
    </InstantSearch>,
  )

  return search
}

describe('AutocompleteNoResults with real InstantSearch', () => {
  it('shows zero-hit recovery and removes it when products are found', async () => {
    renderAutocomplete()
    fireEvent.focus(screen.getByRole('combobox'))
    expect(
      screen.queryByTestId('autocomplete-no-results'),
    ).not.toBeInTheDocument()

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'nonexistent' },
    })
    expect(
      await screen.findByText('No results for “nonexistent”'),
    ).toBeInTheDocument()

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'shoe' },
    })
    expect(await screen.findByText('Shoe')).toBeInTheDocument()
    expect(
      screen.queryByTestId('autocomplete-no-results'),
    ).not.toBeInTheDocument()
  })

  it('shows zero-hit recovery in the detached panel', async () => {
    const matchMediaSpy = vi
      .spyOn(window, 'matchMedia')
      .mockImplementation((query) => {return {
        matches: query === '(min-width: 0px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }})
    try {
      renderAutocomplete(true)
      fireEvent.click(screen.getByRole('button', { name: 'Search' }))
      await waitFor(() =>
        expect(screen.getByRole('combobox')).toBeInTheDocument(),
      )
      fireEvent.change(screen.getByRole('combobox'), {
        target: { value: 'nonexistent' },
      })
      expect(
        await screen.findByText('No results for “nonexistent”'),
      ).toBeInTheDocument()
    } finally {
      matchMediaSpy.mockRestore()
    }
  })
})
