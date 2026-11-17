import { describe, expect, it, vi } from 'vitest'

import SectionPage, {
  generateStaticParams,
} from '@/app/media-entertainment/search/[section]/page'
import { PdpNotFoundState } from '@/components/pdp/PdpNotFoundState'

vi.mock(
  '@/app/media-entertainment/search/_components/MediaEntertainmentSectionResults',
  () => {
    return { MediaEntertainmentSectionResults: () => null }
  },
)

describe('media section page', () => {
  it('prerenders every configured section', () => {
    expect(generateStaticParams()).toEqual([
      { section: 'tv-series' },
      { section: 'movies' },
      { section: 'new-popular' },
    ])
  })

  it('resolves a known section into the results component', async () => {
    const element = await SectionPage({
      params: Promise.resolve({ section: 'movies' }),
    })

    expect(element.props.section.title).toBe('Movies')
  })

  it('falls back to the shared not-found state on an unknown section', async () => {
    const element = await SectionPage({
      params: Promise.resolve({ section: 'documentaries' }),
    })

    expect(element.type).toBe(PdpNotFoundState)
    expect(element.props.backHref).toBe('/media-entertainment')
  })
})
