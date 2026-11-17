import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  GENRE_CHIPS,
  MediaEntertainmentGenreRail,
} from '@/app/media-entertainment/_components/MediaEntertainmentGenreRail'

describe('MediaEntertainmentGenreRail', () => {
  it('renders one chip per genre', () => {
    render(<MediaEntertainmentGenreRail />)

    expect(screen.getAllByRole('link')).toHaveLength(GENRE_CHIPS.length)
  })

  it('uses the facet value verbatim as the chip label', () => {
    render(<MediaEntertainmentGenreRail />)

    // Movies say "Science Fiction" where shows say "Sci-Fi & Fantasy". Both must
    // survive as-is: normalising or deduping them yields a link with zero hits.
    expect(
      screen.getByRole('link', { name: 'Science Fiction' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Sci-Fi & Fantasy' }),
    ).toBeInTheDocument()
  })

  it('keeps both taxonomies rather than deduping them to one chip', () => {
    expect(GENRE_CHIPS).toContain('Science Fiction')
    expect(GENRE_CHIPS).toContain('Sci-Fi & Fantasy')
    expect(GENRE_CHIPS).toContain('Action')
    expect(GENRE_CHIPS).toContain('Action & Adventure')
  })

  it('links into search with the genre as an encoded query value', () => {
    render(<MediaEntertainmentGenreRail />)

    expect(screen.getByRole('link', { name: 'Science Fiction' })).toHaveAttribute(
      'href',
      '/media-entertainment/search?genres=Science%20Fiction',
    )
    expect(
      screen.getByRole('link', { name: 'Sci-Fi & Fantasy' }),
    ).toHaveAttribute(
      'href',
      '/media-entertainment/search?genres=Sci-Fi%20%26%20Fantasy',
    )
  })

  it('renders the title as a heading and the scrollport as a named region', () => {
    render(<MediaEntertainmentGenreRail />)

    expect(
      screen.getByRole('heading', { name: 'Browse by Genre' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'Browse by Genre' }),
    ).toBeInTheDocument()
  })
})
