import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getAssistantAttributes,
  getRailAttributes,
} from '@/app/media-entertainment/_utils/titleAttributes'
import {
  mediaEntertainmentConfig,
  TOP_10_RULE_CONTEXT,
} from '@/app/media-entertainment/config'
import { AssistantCatalogContext } from '@/features/aiAssistant/AssistantCatalogContext'
import { AIAssistantTrendingCarousel } from '@/features/aiAssistant/components/AIAssistantTrendingCarousel'
import { mediaEntertainmentVertical } from '@/features/aiAssistant/verticals/media-entertainment-vertical'
import type { VerticalConfig as AssistantVerticalConfig } from '@/features/aiAssistant/verticals/types'
import { activeConfigAtom } from '@/stores/activeConfig'
import type { HomepageCarouselConfig } from '@/types'

import { createTestStore } from '../../../helpers/jotai-wrapper'
import { createMockConfig, render, screen } from '../../../helpers/test-utils'

import type { Hit } from 'algoliasearch/lite'

const useEmptyQueryHitsMock = vi.fn()
const getVerticalConfigMock = vi.fn()

vi.mock('@/hooks/useEmptyQueryHits', () => {
  return {
    useEmptyQueryHits: (options: unknown) => useEmptyQueryHitsMock(options),
  }
})

vi.mock('@/features/aiAssistant/verticals/registry', () => {
  return {
    getVerticalConfig: (slug: string | undefined) =>
      getVerticalConfigMock(slug),
  }
})

/** Only the fields the carousel reads — the rest of `VerticalConfig` is unused here. */
type PartialAssistantVertical = Partial<AssistantVerticalConfig>

const renderTrendingItem = (hit: Hit) => <div>{hit.objectID}</div>

const HOMEPAGE_CAROUSELS: HomepageCarouselConfig[] = [
  { title: 'Homepage Featured', ruleContexts: ['homepage-featured'] },
  { title: 'Homepage Second', ruleContexts: ['homepage-second'] },
]

const buildStore = (homepageCarousels?: HomepageCarouselConfig[]) =>
  createTestStore((store) => {
    store.set(activeConfigAtom, createMockConfig({ homepageCarousels }))
  })

const renderCarousel = ({
  vertical,
  homepageCarousels,
}: {
  vertical: PartialAssistantVertical
  homepageCarousels?: HomepageCarouselConfig[]
}) => {
  getVerticalConfigMock.mockReturnValue(vertical)

  return render(<AIAssistantTrendingCarousel />, {
    store: buildStore(homepageCarousels),
  })
}

describe('AIAssistantTrendingCarousel', () => {
  beforeEach(() => {
    useEmptyQueryHitsMock.mockReset()
    getVerticalConfigMock.mockReset()
    useEmptyQueryHitsMock.mockReturnValue({ data: [{ objectID: 'h1' }] })
  })

  it('prefers the assistant-level trendingCarousel over homepageCarousels', () => {
    renderCarousel({
      vertical: {
        renderTrendingItem,
        trendingCarousel: {
          title: 'Trending Now',
          filterRuleContexts: ['assistant-trending'],
          hitsPerPage: 12,
        },
      },
      homepageCarousels: HOMEPAGE_CAROUSELS,
    })

    expect(screen.getByText('Trending Now')).toBeInTheDocument()
    expect(screen.queryByText('Homepage Featured')).not.toBeInTheDocument()
    expect(screen.getByText('h1')).toBeInTheDocument()
    expect(useEmptyQueryHitsMock).toHaveBeenCalledWith({
      ruleContexts: undefined,
      filterRuleContexts: ['assistant-trending'],
      indexName: undefined,
      hitsPerPage: 12,
      attributesToRetrieve: undefined,
      attributesToHighlight: undefined,
      enabled: true,
    })
  })

  it('falls back to the first homepage carousel when the vertical declares none', () => {
    renderCarousel({
      vertical: { renderTrendingItem },
      homepageCarousels: HOMEPAGE_CAROUSELS,
    })

    expect(screen.getByText('Homepage Featured')).toBeInTheDocument()
    // One row, never one per configured carousel — that is the homepage's job.
    expect(screen.queryByText('Homepage Second')).not.toBeInTheDocument()
    expect(useEmptyQueryHitsMock).toHaveBeenCalledWith({
      ruleContexts: ['homepage-featured'],
      filterRuleContexts: undefined,
      indexName: undefined,
      hitsPerPage: undefined,
      // A homepage carousel declares no payload controls, so the hook keeps
      // sending the request the other verticals send today.
      attributesToRetrieve: undefined,
      attributesToHighlight: undefined,
      enabled: true,
    })
  })

  it('forwards a trendingCarousel index override to the query', () => {
    renderCarousel({
      vertical: {
        renderTrendingItem,
        trendingCarousel: {
          title: 'Trending Now',
          ruleContexts: ['assistant-trending'],
          indexName: 'custom_index',
        },
      },
    })

    expect(useEmptyQueryHitsMock).toHaveBeenCalledWith({
      ruleContexts: ['assistant-trending'],
      filterRuleContexts: undefined,
      indexName: 'custom_index',
      hitsPerPage: undefined,
      attributesToRetrieve: undefined,
      attributesToHighlight: undefined,
      enabled: true,
    })
  })

  it('forwards the payload controls to the query', () => {
    renderCarousel({
      vertical: {
        renderTrendingItem,
        trendingCarousel: {
          title: 'Trending Now',
          filterRuleContexts: ['assistant-trending'],
          attributesToRetrieve: ['objectID', 'title'],
          attributesToHighlight: [],
        },
      },
    })

    expect(useEmptyQueryHitsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        attributesToRetrieve: ['objectID', 'title'],
        attributesToHighlight: [],
      }),
    )
  })

  it('renders nothing and runs no query when no source is configured', () => {
    const { container } = renderCarousel({ vertical: { renderTrendingItem } })

    expect(container).toBeEmptyDOMElement()
    expect(useEmptyQueryHitsMock).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false }),
    )
  })

  it('renders nothing when a source exists but the vertical has no renderer', () => {
    const { container } = renderCarousel({
      vertical: {
        trendingCarousel: {
          title: 'Trending Now',
          filterRuleContexts: ['assistant-trending'],
        },
      },
      homepageCarousels: HOMEPAGE_CAROUSELS,
    })

    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing while the query has returned no hits', () => {
    useEmptyQueryHitsMock.mockReturnValue({ data: [] })

    const { container } = renderCarousel({
      vertical: { renderTrendingItem },
      homepageCarousels: HOMEPAGE_CAROUSELS,
    })

    expect(container).toBeEmptyDOMElement()
  })

  it('scales the commerce variants down to panel width', () => {
    renderCarousel({
      vertical: { renderTrendingItem, trendingCarouselVariant: 'grocery' },
      homepageCarousels: HOMEPAGE_CAROUSELS,
    })

    expect(
      screen.getByText('Homepage Featured').closest('section'),
    ).toHaveClass('[zoom:0.7]')
  })

  it('leaves the poster variant unscaled', () => {
    renderCarousel({
      vertical: {
        renderTrendingItem,
        trendingCarouselVariant: 'poster',
        trendingCarousel: {
          title: 'Trending Now',
          filterRuleContexts: ['assistant-trending'],
        },
      },
    })

    expect(screen.getByText('Trending Now').closest('section')).not.toHaveClass(
      '[zoom:0.7]',
    )
  })
})

// Asserted on the config object rather than through a render: the media renderer
// mounts the real poster card, which belongs to that component's own tests.
describe('mediaEntertainmentVertical trending carousel', () => {
  it('declares its own source, selecting from the Top 10 rule', () => {
    expect(mediaEntertainmentVertical.trendingCarousel).toMatchObject({
      title: 'Trending Now',
      filterRuleContexts: [TOP_10_RULE_CONTEXT],
    })
    // Not `ruleContexts`, which `useEmptyQueryHits` drops for an active profile.
    expect(
      mediaEntertainmentVertical.trendingCarousel?.ruleContexts,
    ).toBeUndefined()
  })

  it('requests the lean assistant attribute set its poster card renders', () => {
    const template = mediaEntertainmentConfig.algolia.primaryIndex.template
    if (!template) throw new Error('media-entertainment config has no template')

    const { attributesToRetrieve, attributesToHighlight } =
      mediaEntertainmentVertical.trendingCarousel ?? {}

    // Derived from the shared helper, not a literal list that would rot.
    expect(attributesToRetrieve).toEqual(getAssistantAttributes(template))
    // Not the rail set: without the season fields `getTitleLengthLabel` degrades
    // a runtime-less show to the bare word 'Series', while a result group in the
    // same panel labels it '3 Seasons'.
    expect(attributesToRetrieve).not.toEqual(getRailAttributes(template))
    expect(attributesToHighlight).toEqual([])
  })

  it('renders its titles as posters', () => {
    expect(mediaEntertainmentVertical.renderTrendingItem).toBeTypeOf('function')
    expect(mediaEntertainmentVertical.trendingCarouselVariant).toBe('poster')
  })
})

it.each([undefined, 'products', 'products_price', 'articles'])(
  'limits catalog options to product trending sources (%s)',
  (indexName) => {
    useEmptyQueryHitsMock.mockReset().mockReturnValue({ data: [] })
    getVerticalConfigMock.mockReturnValue({
      trendingCarousel: { title: 'Trending', indexName },
    })
    const catalog = {
      queryOptions: { filters: 'visible_by:"group0"', enabled: false },
      productCacheKey: ['b2b-products'],
      isReady: false,
      sessionKey: '0',
      context: '',
      productContext: null,
      resetSession: vi.fn(),
    }
    const store = createTestStore((s) =>
      s.set(
        activeConfigAtom,
        createMockConfig({
          algolia: {
            appId: 'A',
            apiKey: 'K',
            primaryIndex: {
              name: 'products',
              replicas: [{ label: 'Price', indexName: 'products_price' }],
            },
            indices: {},
          },
        }),
      ),
    )
    render(
      <AssistantCatalogContext.Provider value={catalog}>
        <AIAssistantTrendingCarousel />
      </AssistantCatalogContext.Provider>,
      { store },
    )
    const options = useEmptyQueryHitsMock.mock.calls[0][0]
    expect(options.filters).toBe(
      indexName === 'articles' ? undefined : catalog.queryOptions.filters,
    )
    expect(options.enabled).toBe(indexName === 'articles')
  },
)
