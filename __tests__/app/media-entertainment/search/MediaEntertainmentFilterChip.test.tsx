import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MediaEntertainmentFilterChip } from '@/app/media-entertainment/search/_components/MediaEntertainmentFilterChip'

interface FacetItem {
  label: string
  value: string
  count: number
  isRefined: boolean
}

const refine = vi.fn()

const state: { items: FacetItem[] } = { items: [] }

vi.mock('react-instantsearch', () => {
  return {
    useRefinementList: () => {
      return { items: state.items, refine }
    },
  }
})

const facetItem = (overrides: Partial<FacetItem> = {}): FacetItem => {
  return { label: 'Action', value: 'Action', count: 12, isRefined: false, ...overrides }
}

const renderChip = () =>
  render(<MediaEntertainmentFilterChip attribute="genres" label="Genre" />)

describe('MediaEntertainmentFilterChip', () => {
  beforeEach(() => {
    refine.mockReset()
    state.items = [
      facetItem(),
      facetItem({ label: 'Drama', value: 'Drama', count: 8 }),
    ]
  })

  it('renders nothing when the facet has no values', () => {
    state.items = []

    const { container } = renderChip()

    expect(container).toBeEmptyDOMElement()
  })

  it('renders the facet label as the chip trigger', () => {
    renderChip()

    expect(screen.getByRole('button', { name: /Genre/ })).toBeInTheDocument()
  })

  it('renders one checkbox per facet value once opened, with no count', () => {
    renderChip()

    fireEvent.click(screen.getByRole('button', { name: /Genre/ }))

    expect(screen.getAllByRole('checkbox')).toHaveLength(2)
    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(screen.queryByText('12')).not.toBeInTheDocument()
  })

  it('accents the label of a refined value', () => {
    state.items = [
      facetItem({ isRefined: true }),
      facetItem({ label: 'Drama', value: 'Drama' }),
    ]

    renderChip()
    fireEvent.click(screen.getByRole('button', { name: /Genre/ }))

    expect(screen.getByText('Action').closest('label')?.className).toContain(
      'text-accent',
    )
    expect(screen.getByText('Drama').closest('label')?.className).not.toContain(
      'text-accent',
    )
  })

  it('refines on the clicked value', () => {
    renderChip()

    fireEvent.click(screen.getByRole('button', { name: /Genre/ }))
    fireEvent.click(screen.getAllByRole('checkbox')[1])

    expect(refine).toHaveBeenCalledWith('Drama')
  })

  it('reflects an already-refined value as checked', () => {
    state.items = [facetItem({ isRefined: true })]

    renderChip()
    fireEvent.click(screen.getByRole('button', { name: /Genre/ }))

    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('shows the number of selected values in the trigger', () => {
    state.items = [
      facetItem({ isRefined: true }),
      facetItem({ label: 'Drama', value: 'Drama', isRefined: true }),
      facetItem({ label: 'Horror', value: 'Horror' }),
    ]

    renderChip()

    expect(screen.getByRole('button', { name: 'Genre 2' })).toBeInTheDocument()
  })

  it('shows no count in the trigger while nothing is selected', () => {
    renderChip()

    expect(screen.getByRole('button', { name: 'Genre' })).toBeInTheDocument()
  })

  it('renders every value of a long facet in one list', () => {
    state.items = Array.from({ length: 20 }, (_, index) =>
      facetItem({ label: `Genre ${index}`, value: `genre-${index}` }),
    )

    renderChip()
    fireEvent.click(screen.getByRole('button', { name: /Genre/ }))

    expect(screen.getAllByRole('list')).toHaveLength(1)
    expect(screen.getAllByRole('checkbox')).toHaveLength(20)
  })
})
