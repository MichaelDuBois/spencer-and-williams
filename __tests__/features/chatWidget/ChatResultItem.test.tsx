
import { fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'jotai'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CHAT_CARD_RENDERERS } from '@/features/chatWidget/components/chatCardRenderers'
import { ChatResultItem } from '@/features/chatWidget/components/ChatResultItem'
import { ChatWidgetPanelContext } from '@/features/chatWidget/components/chatWidgetPanelContext'
import { activeConfigAtom } from '@/stores/activeConfig'
import { selectedMediaTitleAtom } from '@/stores/mediaEntertainment'
import { verticals } from '@/verticals'

import { createTestStore } from '../../helpers/jotai-wrapper'
import {
  buildProvidersWrapper,
  createMockConfig,
  createTestQueryClient,
} from '../../helpers/test-utils'

import type { ComponentProps } from 'react'

vi.mock('next/link', () => {return {
  default: ({ children, ...props }: ComponentProps<'a'>) => (
    <a {...props}>{children}</a>
  ),
}})

const { sendProductClickEventMock } = vi.hoisted(() => {
  return { sendProductClickEventMock: vi.fn() }
})

const { trackMock } = vi.hoisted(() => {return { trackMock: vi.fn() }})
vi.mock('@/lib/analytics/track', () => {return { track: trackMock }})

vi.mock('@/hooks/useInsightsEvents', () => {return {
  useInsightsEvents: () => {return { sendProductClickEvent: sendProductClickEventMock }},
}})

const renderItem = (
  slug: string,
  item: Record<string, unknown>,
  options: { onClick?: () => void; collapsePanel?: () => void } = {},
) => {
  const store = createTestStore((s) => {
    s.set(activeConfigAtom, createMockConfig({ slug }))
  })

  return render(
    <ChatWidgetPanelContext.Provider value={options.collapsePanel}>
      <ChatResultItem item={item} onClick={options.onClick} />
    </ChatWidgetPanelContext.Provider>,
    { wrapper: buildProvidersWrapper({ store }).Wrapper },
  )
}

describe('ChatResultItem', () => {
  beforeEach(() => {
    sendProductClickEventMock.mockClear()
    trackMock.mockClear()
  })

  it.each([
    ['ecommerce', { name: 'Trail Runner', image: 'shoe.jpg', price: 89.5 }, 'Trail Runner'],
    ['electronics', { name: 'Laptop', image: 'laptop.jpg', attrs: { 'Screen Size': '15 inch' } }, 'Laptop'],
    ['fashion', { name: 'Coat', primary_image: '/coat.jpg', price: { value: 120 } }, 'Coat'],
    ['furnishing', { name: 'Sofa', image: 'sofa.jpg', info: { Material: 'Linen' } }, 'Sofa'],
    ['grocery', { name: 'Soup', image: '/soup.jpg', price: 4.99 }, 'Soup'],
    ['b2b-warehouse', { name: 'Drill', image: '/drill.jpg', price: 59 }, 'Drill'],
  ])('renders the existing %s product card from a widget hit', (slug, fields, name) => {
    renderItem(slug, { objectID: 'p1', ...fields })

    expect(screen.getByText(name)).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', `/${slug}/product/p1`)
  })

  it.each([
    ['ecommerce', { name: 'Shoe' }, '/ecommerce/product/sku%2F123'],
    ['electronics', { name: 'Laptop' }, '/electronics/product/sku%2F123'],
    ['fashion', { name: 'Coat' }, '/fashion/product/sku%2F123'],
    ['furnishing', { name: 'Sofa' }, '/furnishing/product/sku%2F123'],
    ['grocery', { name: 'Soup' }, '/grocery/product/sku%2F123'],
    ['b2b-warehouse', { name: 'Drill' }, '/b2b-warehouse/product/sku%2F123'],
    ['travel', { title: 'Guide' }, '/travel/article/sku%2F123'],
    ['travel', { title: 'Podcast', episode: 'Episode 1', cover_image: '/cover.jpg' }, '/travel/podcast/sku%2F123'],
    ['b2b-content', { title: 'Guide', type: 'documentation' }, '/b2b-content/documentation/sku%2F123'],
    ['b2b-content', { title: 'Guide', section: { name: 'Help' } }, '/b2b-content/articles/sku%2F123'],
    ['b2b-content', { title: 'Blog', blogimage: '/blog.jpg', blogcategory: 'News' }, '/b2b-content/blogs/sku%2F123'],
    ['b2b-content', { title: 'Resource', resourceType: 'Guide', thumbnailImage: '/guide.jpg' }, '/b2b-content/resources/sku%2F123'],
    ['media-entertainment', { title: 'Movie', poster_path: '/poster.jpg' }, '/media-entertainment/title/sku%2F123'],
  ])('encodes a path-unsafe %s widget result ID', (slug, fields, href) => {
    renderItem(slug, { objectID: 'sku/123', ...fields })

    expect(screen.getByRole('link')).toHaveAttribute('href', href)
  })

  it('encodes a travel activity parent ID in its article link', () => {
    renderItem('travel', {
      objectID: 'activity-1', parentID: 'article/123', title: 'Street food walk',
    })

    expect(screen.getByRole('link')).toHaveAttribute('href', '/travel/article/article%2F123')
  })

  it('uses the existing fashion cover image and price', () => {
    renderItem('fashion', {
      objectID: 'coat-1', name: 'Wool coat', primary_image: '/coat.jpg', price: { value: 120 },
    })

    expect(screen.getByRole('img', { name: 'Wool coat' })).toHaveAttribute('src', '/coat.jpg')
    expect(screen.getByText('$120')).toBeInTheDocument()
  })

  it('renders a travel activity and links to its parent article', () => {
    renderItem('travel', {
      objectID: 'activity-1', parentID: 'article-1', title: 'Street food walk', image: '/walk.jpg', location: 'Lisbon',
      __groupedToolResult: { why: 'Local favourite' },
    })

    expect(screen.getByRole('link')).toHaveAttribute('href', '/travel/article/article-1')
    expect(screen.getByText('Street food walk')).toBeInTheDocument()
  })

  it('renders a travel podcast from its secondary index fields', () => {
    renderItem('travel', {
      objectID: 'podcast-1', title: 'City Stories', episode: 'Lisbon', cover_image: '/cover.jpg', episode_number: 4,
    })

    expect(screen.getByRole('link')).toHaveAttribute('href', '/travel/podcast/podcast-1')
    expect(screen.getByText('Lisbon')).toBeInTheDocument()
  })

  it('renders a travel article with its recommendation reason', () => {
    renderItem('travel', {
      objectID: 'article-1', title: 'Lisbon guide', image: '/lisbon.jpg',
      __groupedToolResult: { why: 'Good for a weekend' },
    })

    expect(screen.getByRole('link')).toHaveAttribute('href', '/travel/article/article-1')
    expect(screen.getByText('Good for a weekend')).toBeInTheDocument()
  })

  it('renders a fashion article hit as an article card', () => {
    renderItem('fashion', {
      objectID: 'article-1', __indexName: 'fashion_articles', title: 'Autumn layering', banner_image: '/banner.jpg', reading_time: 6,
      __groupedToolResult: { why: 'Matches your question' },
    })

    expect(screen.getByRole('link')).toHaveAttribute('href', '/fashion/article/article-1')
    expect(screen.getByText('Autumn layering')).toBeInTheDocument()
    expect(screen.getByText('6 min read')).toBeInTheDocument()
    expect(screen.queryByText('Matches your question')).not.toBeInTheDocument()
  })

  it('renders a grocery recipe hit as a recipe card', () => {
    renderItem('grocery', {
      objectID: 'recipe-1', __indexName: 'grocery_recipes', name: 'Pumpkin soup', description: 'Cozy autumn classic',
      steps: [{ title: 'Chop' }, { title: 'Simmer' }],
      __groupedToolResult: { why: 'A seasonal pick' },
    })

    expect(screen.getByRole('link')).toHaveAttribute('href', '/grocery/recipe/recipe-1')
    expect(screen.getByText('Pumpkin soup')).toBeInTheDocument()
    expect(screen.getByText('2 steps')).toBeInTheDocument()
    expect(screen.queryByText('A seasonal pick')).not.toBeInTheDocument()
  })

  it('keeps rendering a fashion product hit as the product card', () => {
    renderItem('fashion', {
      objectID: 'coat-1', __indexName: 'fashion_ns', name: 'Wool coat', primary_image: '/coat.jpg', price: { value: 120 },
    })

    expect(screen.getByRole('link')).toHaveAttribute('href', '/fashion/product/coat-1')
    expect(screen.getByText('$120')).toBeInTheDocument()
  })

  it('renders B2B documentation as an icon card', () => {
    renderItem('b2b-content', {
      objectID: 'doc-1', title: 'API reference', page_title: 'API reference', type: 'documentation', description: 'Start here',
    })

    expect(screen.getByRole('link')).toHaveAttribute('href', '/b2b-content/documentation/doc-1')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it.each([
    ['articles', { title: 'Fix indexing', section: { name: 'Indexing' } }, '/b2b-content/articles/a1'],
    ['blogs', { title: 'Search trends', blogimage: '/blog.jpg', blogcategory: 'Insights' }, '/b2b-content/blogs/a1'],
    ['resources', { title: 'White paper', resourceType: 'Guide', thumbnailImage: '/guide.jpg' }, '/b2b-content/resources/a1'],
  ])('renders the B2B %s card', (_type, fields, href) => {
    renderItem('b2b-content', { objectID: 'a1', ...fields })

    expect(screen.getByRole('link')).toHaveAttribute('href', href)
    expect(screen.getByText(fields.title)).toBeInTheDocument()
  })

  it('uses the media poster card and My List action', () => {
    renderItem('media-entertainment', {
      objectID: 'movie-1', title: 'Moonrise', poster_path: '/moon.jpg', backdrop_path: '/backdrop.jpg', record_type: 'movie',
    })

    expect(screen.getByRole('link', { name: 'Moonrise' })).toHaveAttribute('href', '/media-entertainment/title/movie-1')
    expect(screen.getByRole('img', { name: 'Moonrise' })).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w500/moon.jpg')
    expect(screen.getByRole('button', { name: 'Add Moonrise to My List' })).toBeInTheDocument()
  })

  it('does not put a landscape backdrop into a missing media poster', () => {
    renderItem('media-entertainment', {
      objectID: 'movie-2', title: 'Nightfall', backdrop_path: '/night.jpg', record_type: 'movie',
    })

    expect(screen.queryByRole('img', { name: 'Nightfall' })).not.toBeInTheDocument()
  })

  it('collapses the widget before navigation', () => {
    const collapsePanel = vi.fn()
    const onClick = vi.fn()
    renderItem('ecommerce', { objectID: 'p1', name: 'Trail Runner' }, { collapsePanel, onClick })

    const link = screen.getByRole('link')
    link.addEventListener('click', (event) => event.preventDefault())
    fireEvent.click(link)

    expect(collapsePanel).toHaveBeenCalledBefore(onClick)
    expect(collapsePanel).toHaveBeenCalledOnce()
  })

  it('keeps the widget open when adding a product to the cart', () => {
    const collapsePanel = vi.fn()
    renderItem('ecommerce', { objectID: 'p1', name: 'Trail Runner' }, { collapsePanel })

    fireEvent.click(screen.getByRole('button', { name: 'Add to Cart' }))

    expect(collapsePanel).not.toHaveBeenCalled()
  })

  it('uses the widget hit even when the old assistant cached the same ID', () => {
    const store = createTestStore((s) => {
      s.set(activeConfigAtom, createMockConfig({ slug: 'ecommerce' }))
    })
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['product', 'p1'], {
      objectID: 'p1', name: 'Old assistant item', price: 10,
    })

    render(
      <ChatResultItem item={{ objectID: 'p1', name: 'Current widget item', price: 20 }} />,
      { wrapper: buildProvidersWrapper({ store, queryClient }).Wrapper },
    )

    expect(screen.getByText('Current widget item')).toBeInTheDocument()
    expect(screen.queryByText('Old assistant item')).not.toBeInTheDocument()
    expect(queryClient.getQueryData(['product', 'p1'])).toMatchObject({ name: 'Old assistant item' })
  })

  it('renders a widget hit without the assistant query cache provider', () => {
    const store = createTestStore((s) => {
      s.set(activeConfigAtom, createMockConfig({ slug: 'travel' }))
    })

    render(
      <Provider store={store}>
        <ChatResultItem item={{ objectID: 'article-1', title: 'Lisbon guide' }} />
      </Provider>,
    )

    expect(screen.getByText('Lisbon guide')).toBeInTheDocument()
  })

  it('collapses the widget and opens the media detail sheet', () => {
    const collapsePanel = vi.fn()
    const store = createTestStore((s) => {
      s.set(activeConfigAtom, createMockConfig({ slug: 'media-entertainment' }))
    })
    render(
      <ChatWidgetPanelContext.Provider value={collapsePanel}>
        <ChatResultItem item={{ objectID: 'movie-1', title: 'Moonrise', poster_path: '/moon.jpg' }} />
      </ChatWidgetPanelContext.Provider>,
      { wrapper: buildProvidersWrapper({ store }).Wrapper },
    )

    fireEvent.click(screen.getByRole('link', { name: 'Moonrise' }))

    expect(collapsePanel).toHaveBeenCalledOnce()
    expect(store.get(selectedMediaTitleAtom)?.objectID).toBe('movie-1')
  })

  it('emits the product click with the chat_widget surface', () => {
    renderItem('ecommerce', { objectID: 'p1', name: 'Trail Runner' })

    const link = screen.getByRole('link')
    link.addEventListener('click', (event) => event.preventDefault())
    fireEvent.click(link)

    expect(sendProductClickEventMock).not.toHaveBeenCalled()
    expect(trackMock).toHaveBeenCalledWith('product_clicked', expect.objectContaining({ objectID: 'p1', surface: 'chat_widget' }))
  })

  it.each([
    ['fashion', { objectID: 'p1', name: 'Coat' }, true],
    ['grocery', { objectID: 'p1', name: 'Soup' }, true],
    ['fashion', { objectID: 'a1', title: 'Style guide' }, false],
    ['grocery', { objectID: 'r1', name: 'Recipe', steps: [] }, false],
  ])('tracks product clicks appropriately for %s results', (slug, item, isProduct) => {
    renderItem(slug, item)
    const link = screen.getByRole('link')
    link.addEventListener('click', (event) => event.preventDefault())
    fireEvent.click(link)

    const productClicks = trackMock.mock.calls.filter(([name]) => name === 'product_clicked')
    expect(productClicks).toHaveLength(isProduct ? 1 : 0)
  })

  it('passes the widget hit queryID and position into the product click', () => {
    renderItem('ecommerce', {
      objectID: 'p1',
      name: 'Trail Runner',
      __queryID: 'q-widget',
      __position: 4,
    })

    const link = screen.getByRole('link')
    link.addEventListener('click', (event) => event.preventDefault())
    fireEvent.click(link)

    expect(sendProductClickEventMock).not.toHaveBeenCalled()
    expect(trackMock).toHaveBeenCalledWith('product_clicked', expect.objectContaining({ objectID: 'p1', queryID: 'q-widget', position: 4 }))
  })

  it('ignores malformed widget hit attribution', () => {
    renderItem('ecommerce', {
      objectID: 'p1',
      name: 'Trail Runner',
      __queryID: 42,
      __position: 'first',
    })

    const link = screen.getByRole('link')
    link.addEventListener('click', (event) => event.preventDefault())
    fireEvent.click(link)

    expect(trackMock).toHaveBeenCalledWith('product_clicked', expect.not.objectContaining({ queryID: 42 }))
  })

  it('does not emit a product click for a travel content card', () => {
    renderItem('travel', {
      objectID: 'article-1',
      title: 'Lisbon guide',
      image: '/lisbon.jpg',
      __groupedToolResult: { why: 'Good for a weekend' },
      __queryID: 'q-agent-echo',
      __position: 2,
    })

    const link = screen.getByRole('link')
    link.addEventListener('click', (event) => event.preventDefault())
    fireEvent.click(link)

    expect(sendProductClickEventMock).not.toHaveBeenCalled()
  })

  it('does not emit a product click for a b2b-content documentation card', () => {
    renderItem('b2b-content', {
      objectID: 'doc-1',
      title: 'API reference',
      type: 'documentation',
      __queryID: 'q-agent-echo',
      __position: 2,
    })

    const link = screen.getByRole('link')
    link.addEventListener('click', (event) => event.preventDefault())
    fireEvent.click(link)

    expect(sendProductClickEventMock).not.toHaveBeenCalled()
  })

  it('omits position from a grouped result click', () => {
    renderItem('ecommerce', {
      objectID: 'p1',
      name: 'Trail Runner',
      __groupedToolResult: { why: 'Matches your gear' },
      __queryID: 'q-widget',
      __position: 2,
    })

    const link = screen.getByRole('link')
    link.addEventListener('click', (event) => event.preventDefault())
    fireEvent.click(link)

    // Grouped results rank within their group, so the position is per-group
    // and incomparable with search ranks — omitted, while the queryID stays.
    expect(trackMock).toHaveBeenCalledWith(
      'product_clicked',
      expect.objectContaining({ objectID: 'p1', queryID: 'q-widget' }),
    )
    expect(trackMock).toHaveBeenCalledWith(
      'product_clicked',
      expect.not.objectContaining({ position: 2 }),
    )
  })

  it('keeps the position on a displayToolResult click', () => {
    renderItem('ecommerce', {
      objectID: 'p1',
      name: 'Trail Runner',
      __displayToolResult: { why: 'Top pick' },
      __queryID: 'q-widget',
      __position: 4,
    })

    const link = screen.getByRole('link')
    link.addEventListener('click', (event) => event.preventDefault())
    fireEvent.click(link)

    expect(trackMock).toHaveBeenCalledWith('product_clicked', expect.objectContaining({ objectID: 'p1', queryID: 'q-widget', position: 4 }))
  })

  it('emits assistant_result_clicked but no product click for a media title card', () => {
    renderItem('media-entertainment', {
      objectID: 'movie-1',
      title: 'Moonrise',
      poster_path: '/moon.jpg',
      __queryID: 'q-widget',
      __position: 1,
    })

    const link = screen.getByRole('link', { name: 'Moonrise' })
    link.addEventListener('click', (event) => event.preventDefault())
    fireEvent.click(link)

    expect(trackMock).toHaveBeenCalledWith('assistant_result_clicked', {
      surface: 'chat_widget',
      objectID: 'movie-1',
    })
    expect(trackMock).not.toHaveBeenCalledWith(
      'product_clicked',
      expect.anything(),
    )
  })
})

it('registers a chat renderer for every configured vertical', () => {
  expect(Object.keys(CHAT_CARD_RENDERERS).sort()).toEqual(
    verticals.map(({ config }) => config.slug).sort(),
  )
})
