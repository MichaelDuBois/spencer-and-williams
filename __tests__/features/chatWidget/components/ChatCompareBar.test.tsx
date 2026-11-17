import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { InstantSearch } from 'react-instantsearch'
import { describe, expect, it, vi } from 'vitest'

import { ChatCompareBar } from '@/features/chatWidget/components/ChatCompareBar'
import { CompareToggle } from '@/features/chatWidget/components/CompareToggle'

const state = vi.hoisted(() => {
  return { enabled: true, configurationId: 'first' }
})
vi.mock('@/features/chatWidget/hooks/useComparisonCapability', () => {
  return {
    useComparisonCapability: () =>
      state.enabled
        ? { configurationId: state.configurationId, minItems: 2, maxItems: 3 }
        : null,
  }
})

const searchClient = {
  search: async (requests: unknown[]) => {
    return {
      results: requests.map(() => {
        return {
          hits: [],
          nbHits: 0,
          page: 0,
          nbPages: 0,
          hitsPerPage: 20,
          processingTimeMS: 1,
          query: '',
          params: '',
          exhaustiveNbHits: true,
        }
      }),
    }
  },
}

const SelectionControl = () => (
  <CompareToggle
    hit={{ objectID: 'one', name: 'Widget' }}
    capability={{ configurationId: 'first', minItems: 2, maxItems: 3 }}
  />
)

const App = () => (
  <InstantSearch searchClient={searchClient as never} indexName="products">
    <SelectionControl />
    <ChatCompareBar />
  </InstantSearch>
)

describe('comparison lifecycle', () => {
  it('clears selections when disabled or configuration changes', async () => {
    state.enabled = true
    state.configurationId = 'first'
    const { rerender } = render(<App />)
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Compare Widget', pressed: false }),
      ).toBeInTheDocument(),
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Compare Widget', pressed: false }),
    )
    expect(
      await screen.findByRole('button', {
        name: 'Compare Widget',
        pressed: true,
      }),
    ).toBeInTheDocument()
    state.enabled = false
    rerender(<App />)
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Compare Widget', pressed: false }),
      ).toBeInTheDocument(),
    )
    state.enabled = true
    rerender(<App />)
    fireEvent.click(
      screen.getByRole('button', { name: 'Compare Widget', pressed: false }),
    )
    expect(
      await screen.findByRole('button', {
        name: 'Compare Widget',
        pressed: true,
      }),
    ).toBeInTheDocument()
    state.configurationId = 'second'
    rerender(<App />)
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Compare Widget', pressed: false }),
      ).toBeInTheDocument(),
    )
  })
})
