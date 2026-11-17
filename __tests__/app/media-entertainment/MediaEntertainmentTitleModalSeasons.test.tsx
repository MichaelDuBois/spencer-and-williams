import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MediaEntertainmentTitleModalSeasons } from '@/app/media-entertainment/_components/MediaEntertainmentTitleModalSeasons'
import type { MediaEntertainmentSeason } from '@/app/media-entertainment/hitValues.types'

const SEASONS: MediaEntertainmentSeason[] = [
  {
    seasonNumber: 1,
    name: 'Stranger Things',
    episodeCount: 8,
    poster: 'https://image.tmdb.org/t/p/w500/s1.jpg',
  },
  { seasonNumber: 2, name: 'Stranger Things 2', episodeCount: 1 },
  { seasonNumber: 3, name: 'Season 3' },
]

describe('MediaEntertainmentTitleModalSeasons', () => {
  it('renders nothing without seasons', () => {
    const { container } = render(<MediaEntertainmentTitleModalSeasons />)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing for an empty season list', () => {
    const { container } = render(
      <MediaEntertainmentTitleModalSeasons seasons={[]} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('heads the section with the season count', () => {
    render(<MediaEntertainmentTitleModalSeasons seasons={SEASONS} />)

    expect(
      screen.getByRole('heading', { name: 'Seasons' }),
    ).toBeInTheDocument()
    expect(screen.getByText('3 seasons')).toBeInTheDocument()
  })

  it('reads "1 season" for a single-season show', () => {
    render(<MediaEntertainmentTitleModalSeasons seasons={[SEASONS[0]]} />)

    expect(screen.getByText('1 season')).toBeInTheDocument()
  })

  it('names every season', () => {
    render(<MediaEntertainmentTitleModalSeasons seasons={SEASONS} />)

    expect(screen.getByText('Stranger Things')).toBeInTheDocument()
    expect(screen.getByText('Stranger Things 2')).toBeInTheDocument()
    expect(screen.getByText('Season 3')).toBeInTheDocument()
  })

  it('makes the episode label singular-correct', () => {
    render(<MediaEntertainmentTitleModalSeasons seasons={SEASONS} />)

    expect(screen.getByText('8 episodes')).toBeInTheDocument()
    expect(screen.getByText('1 episode')).toBeInTheDocument()
  })

  it('omits the episode line when the count is missing', () => {
    render(<MediaEntertainmentTitleModalSeasons seasons={[SEASONS[2]]} />)

    expect(screen.queryByText(/episode/)).not.toBeInTheDocument()
  })

  it('leaves the posters unlinked and unclickable', () => {
    render(<MediaEntertainmentTitleModalSeasons seasons={SEASONS} />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('exposes a keyboard-scrollable region', () => {
    render(<MediaEntertainmentTitleModalSeasons seasons={SEASONS} />)

    expect(screen.getByRole('region', { name: 'Seasons' })).toHaveAttribute(
      'tabindex',
      '0',
    )
  })
})
