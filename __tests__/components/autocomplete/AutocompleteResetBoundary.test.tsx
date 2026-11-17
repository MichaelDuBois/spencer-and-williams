import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Autocomplete, InstantSearch, useSearchBox } from 'react-instantsearch'
import { describe, expect, it, vi } from 'vitest'

import { AutocompleteResetBoundary } from '@/components/autocomplete/AutocompleteResetBoundary'

import type { SearchClient } from 'instantsearch.js'

const search = vi.fn(async (requests: { indexName: string; params?: { query?: string } }[]) => {return {
  results: requests.map(({ indexName, params }) => {return {
    index: indexName,
    hits: [],
    nbHits: 0,
    page: 0,
    nbPages: 0,
    hitsPerPage: 3,
    processingTimeMS: 1,
    query: params?.query ?? '',
    params: '',
    exhaustiveNbHits: true,
  }}),
}})

const Search = () => {
  const { query } = useSearchBox()
  return (
    <>
      <span data-testid="query">{query}</span>
      <AutocompleteResetBoundary>
        <Autocomplete indices={[]} detachedMediaQuery="" />
      </AutocompleteResetBoundary>
    </>
  )
}

const OuterSearch = () => {
  const { query } = useSearchBox()
  return (
    <>
      <span data-testid="outer-query">{query}</span>
      <InstantSearch
        searchClient={{ search } as SearchClient}
        indexName="products"
        initialUiState={{ products: { query: 'shoe' } }}>
        <Search />
      </InstantSearch>
    </>
  )
}

const renderSearch = () =>
  render(
    <InstantSearch
      searchClient={{ search } as SearchClient}
      indexName="outer"
      initialUiState={{ outer: { query: 'outer query' } }}>
      <OuterSearch />
    </InstantSearch>,
  )

describe('AutocompleteResetBoundary', () => {
  it('clears a query in the inactive search box without crashing', async () => {
    renderSearch()
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-expanded')
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    await waitFor(() => expect(screen.getByTestId('query')).toHaveTextContent(/^$/))
    expect(screen.getByTestId('outer-query')).toHaveTextContent('outer query')
    expect(screen.getByRole('combobox')).toHaveValue('')
    fireEvent.focus(screen.getByRole('combobox'))
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded'))
    expect(screen.getByRole('combobox')).toHaveValue('')
  })

  it('clears an active autocomplete query without clearing the search results query', async () => {
    renderSearch()
    fireEvent.focus(screen.getByRole('combobox'))
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded'))
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'jacket' },
    })
    expect(screen.getByRole('combobox')).toHaveValue('jacket')
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    await waitFor(() => expect(screen.getByTestId('query')).toHaveTextContent(/^$/))
    expect(screen.getByRole('combobox')).toHaveValue('')
    expect(screen.getByTestId('outer-query')).toHaveTextContent('outer query')
  })
})
