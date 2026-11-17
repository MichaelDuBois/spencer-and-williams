import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MediaEntertainmentFilterChips } from '@/app/media-entertainment/search/_components/MediaEntertainmentFilterChips'

interface ChipProps {
  attribute: string
  label: string
}

const attributesToRender = vi.hoisted(() => {
  return { current: [] as string[] }
})

vi.mock('react-instantsearch', () => {
  return {
    useDynamicWidgets: () => {
      return { attributesToRender: attributesToRender.current }
    },
  }
})

vi.mock(
  '@/app/media-entertainment/search/_components/MediaEntertainmentFilterChip',
  () => {
    return {
      MediaEntertainmentFilterChip: ({ attribute, label }: ChipProps) => (
        <div data-testid={`chip-${attribute}`}>{label}</div>
      ),
    }
  },
)

vi.mock('@/components/filters/ClearAllButton', () => {
  return { ClearAllButton: () => <div data-testid="clear-all" /> }
})

vi.mock('@/components/results/SortByWidget', () => {
  return { SortByWidget: () => null }
})

describe('MediaEntertainmentFilterChips', () => {
  beforeEach(() => {
    attributesToRender.current = []
  })

  it('renders one chip per configured refinement facet', () => {
    render(<MediaEntertainmentFilterChips />)

    expect(screen.getByTestId('chip-genres')).toBeInTheDocument()
    expect(screen.getByTestId('chip-record_type')).toBeInTheDocument()
    expect(screen.getByTestId('chip-certification')).toBeInTheDocument()
  })

  it('drops the chip for a facet the section has locked', () => {
    render(<MediaEntertainmentFilterChips hiddenFacets={['record_type']} />)

    expect(screen.queryByTestId('chip-record_type')).not.toBeInTheDocument()
    expect(screen.getByTestId('chip-genres')).toBeInTheDocument()
  })

  it('keeps clear-all reachable on a section that locks a facet', () => {
    render(<MediaEntertainmentFilterChips hiddenFacets={['record_type']} />)

    expect(screen.getByTestId('clear-all')).toBeInTheDocument()
  })

  it('orders chips by the facet ordering the response returns', () => {
    attributesToRender.current = ['certification', 'genres', 'record_type']
    render(<MediaEntertainmentFilterChips />)

    const chips = screen.getAllByTestId(/^chip-/)

    expect(chips.map((chip) => chip.dataset.testid)).toEqual([
      'chip-certification',
      'chip-genres',
      'chip-record_type',
    ])
  })

  it('drops a chip the facet ordering leaves out', () => {
    attributesToRender.current = ['genres']
    render(<MediaEntertainmentFilterChips />)

    expect(screen.getByTestId('chip-genres')).toBeInTheDocument()
    expect(screen.queryByTestId('chip-certification')).not.toBeInTheDocument()
  })
})
