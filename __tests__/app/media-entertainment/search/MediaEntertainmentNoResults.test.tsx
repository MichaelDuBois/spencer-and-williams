import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { MediaRailItem } from '@/app/media-entertainment/hitValues.types'
import { MediaEntertainmentNoResults } from '@/app/media-entertainment/search/_components/MediaEntertainmentNoResults'

import { createMediaRailItems } from '@tests/app/media-entertainment/_helpers/railFixtures'

const clearRefinements = vi.fn()

const state: { canRefine: boolean; popularTitles: MediaRailItem[] } = {
  canRefine: false,
  popularTitles: [],
}

vi.mock('react-instantsearch', () => {
  return {
    useClearRefinements: () => {
      return { refine: clearRefinements, canRefine: state.canRefine }
    },
  }
})

vi.mock(
  '@/app/media-entertainment/search/_hooks/useMediaEntertainmentPopularTitles',
  () => {
    return {
      useMediaEntertainmentPopularTitles: () => state.popularTitles,
    }
  },
)

describe('MediaEntertainmentNoResults', () => {
  beforeEach(() => {
    clearRefinements.mockReset()
    state.canRefine = false
    state.popularTitles = []
  })

  it('always explains that nothing matched', () => {
    render(<MediaEntertainmentNoResults />)

    expect(screen.getByText('No titles match your search.')).toBeInTheDocument()
  })

  it('offers no clear action when nothing is refined', () => {
    render(<MediaEntertainmentNoResults />)

    expect(
      screen.queryByRole('button', { name: 'Clear filters' }),
    ).not.toBeInTheDocument()
  })

  it('offers a clear action once refinements are active', () => {
    state.canRefine = true

    render(<MediaEntertainmentNoResults />)

    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))

    expect(clearRefinements).toHaveBeenCalledTimes(1)
  })

  it('offers a browse row instead of a dead end', () => {
    state.popularTitles = createMediaRailItems(4)

    render(<MediaEntertainmentNoResults />)

    expect(
      screen.getByRole('heading', { name: 'Popular right now' }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(4)
  })

  it('omits the browse row when the fallback query returned nothing', () => {
    render(<MediaEntertainmentNoResults />)

    expect(screen.queryAllByRole('link')).toHaveLength(0)
  })
})
