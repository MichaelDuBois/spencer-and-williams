import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { getHeaderSection } from '@/app/media-entertainment/_utils/headerSections'
import { MediaEntertainmentSectionResults } from '@/app/media-entertainment/search/_components/MediaEntertainmentSectionResults'
import type { MediaHeaderSectionConfig } from '@/app/media-entertainment/types'

interface IndexProps {
  indexId: string
  children: React.ReactNode
}

vi.mock('react-instantsearch', () => {
  return {
    Index: ({ indexId, children }: IndexProps) => (
      <div data-testid="index" data-index-id={indexId}>
        {children}
      </div>
    ),
    Configure: (props: Record<string, unknown>) => (
      <div data-testid="configure" data-props={JSON.stringify(props)} />
    ),
  }
})

vi.mock(
  '@/app/media-entertainment/search/_components/MediaEntertainmentSearchResults',
  () => {
    return {
      MediaEntertainmentSearchResults: (props: Record<string, unknown>) => (
        <div data-testid="results" data-props={JSON.stringify(props)} />
      ),
    }
  },
)

const propsOf = (testId: string) =>
  JSON.parse(screen.getByTestId(testId).dataset.props ?? '{}')

const sectionOf = (id: string): MediaHeaderSectionConfig => {
  const section = getHeaderSection(id)
  if (!section) throw new Error(`missing fixture section: ${id}`)
  return section
}

describe('MediaEntertainmentSectionResults', () => {
  it('locks a type section to its record_type and hides that chip', () => {
    render(<MediaEntertainmentSectionResults section={sectionOf('tv-series')} />)

    expect(propsOf('configure')).toEqual({ filters: 'record_type:show' })
    expect(propsOf('results')).toEqual({
      scope: 'TV Series',
      hiddenFacets: ['record_type'],
    })
  })

  it('drives a rule-backed section through ruleContexts', () => {
    render(
      <MediaEntertainmentSectionResults section={sectionOf('new-popular')} />,
    )

    expect(propsOf('configure')).toEqual({
      ruleContexts: ['homepage_me_new_releases'],
    })
    expect(propsOf('results').scope).toBe('New & Popular')
  })

  it('scopes each section to its own index id so refinements do not leak', () => {
    render(<MediaEntertainmentSectionResults section={sectionOf('movies')} />)

    expect(screen.getByTestId('index').dataset.indexId).toBe(
      'media_browse_movies',
    )
  })
})
