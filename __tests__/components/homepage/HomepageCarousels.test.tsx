import { beforeEach, describe, expect, it, vi } from 'vitest'

import { HomepageCarousels } from '@/components/homepage/HomepageCarousels'
import { activeConfigAtom } from '@/stores/activeConfig'
import type { HomepageCarouselConfig } from '@/types'

import { createTestStore } from '../../helpers/jotai-wrapper'
import { createMockConfig, render, screen } from '../../helpers/test-utils'

import type { RecommendHit } from 'algoliasearch/lite'

const useEmptyQueryHitsMock = vi.fn()

vi.mock('@/hooks/useEmptyQueryHits', () => {return {
  useEmptyQueryHits: (options: unknown) => useEmptyQueryHitsMock(options),
}})

const renderItem = (hit: RecommendHit) => <div>{hit.objectID}</div>

const buildStore = (homepageCarousels?: HomepageCarouselConfig[]) =>
  createTestStore((store) => {
    store.set(activeConfigAtom, createMockConfig({ homepageCarousels }))
  })

describe('HomepageCarousels', () => {
  beforeEach(() => {
    useEmptyQueryHitsMock.mockReset()
    useEmptyQueryHitsMock.mockReturnValue({ data: [{ objectID: 'h1' }] })
  })

  it('renders nothing when no homepage carousels are configured', () => {
    const { container } = render(<HomepageCarousels renderItem={renderItem} />, {
      store: buildStore(),
    })

    expect(container).toBeEmptyDOMElement()
    expect(useEmptyQueryHitsMock).not.toHaveBeenCalled()
  })

  it('renders one carousel per configured section with its rule contexts', () => {
    const store = buildStore([
      { title: 'Featured Items', ruleContexts: ['homepage-featured'] },
      { title: 'Trending', ruleContexts: ['homepage-trending'] },
    ])

    render(<HomepageCarousels renderItem={renderItem} />, { store })

    expect(screen.getByText('Featured Items')).toBeInTheDocument()
    expect(screen.getByText('Trending')).toBeInTheDocument()
    // hits flow through to renderItem — one 'h1' per carousel
    expect(screen.getAllByText('h1')).toHaveLength(2)
    expect(useEmptyQueryHitsMock).toHaveBeenCalledWith({
      ruleContexts: ['homepage-featured'],
      indexName: undefined,
    })
    expect(useEmptyQueryHitsMock).toHaveBeenCalledWith({
      ruleContexts: ['homepage-trending'],
      indexName: undefined,
    })
  })

  it('forwards a per-carousel index override to the query', () => {
    const store = buildStore([
      {
        title: 'Featured Items',
        ruleContexts: ['homepage-featured'],
        indexName: 'custom_index',
      },
    ])

    render(<HomepageCarousels renderItem={renderItem} />, { store })

    expect(useEmptyQueryHitsMock).toHaveBeenCalledWith({
      ruleContexts: ['homepage-featured'],
      indexName: 'custom_index',
    })
  })
})
