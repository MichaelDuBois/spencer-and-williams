import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ChatComparisonItem } from '@/features/chatWidget/components/ChatComparisonItem'
import { ChatResultItem } from '@/features/chatWidget/components/ChatResultItem'
import {
  ChatWidgetFullscreenContext,
  ChatWidgetPanelContext,
} from '@/features/chatWidget/components/chatWidgetPanelContext'
import { activeConfigAtom } from '@/stores/activeConfig'

import { createTestStore } from '@tests/helpers/jotai-wrapper'
import {
  buildProvidersWrapper,
  createMockConfig,
} from '@tests/helpers/test-utils'

const commerceCases: Array<[string, Record<string, unknown>, string]> = [
  [
    'ecommerce',
    { name: 'Trail Runner', image: '/shoe.jpg', price: 89.5 },
    'Trail Runner',
  ],
  [
    'electronics',
    {
      name: 'Laptop',
      image: '/laptop.jpg',
      price: 89.5,
      attrs: { 'Screen Size': '15 inch' },
    },
    'Laptop',
  ],
  [
    'fashion',
    { name: 'Coat', primary_image: '/coat.jpg', price: { value: 89.5 } },
    'Coat',
  ],
  [
    'furnishing',
    {
      name: 'Sofa',
      image: '/sofa.jpg',
      price: 89.5,
      info: { Material: 'Linen' },
    },
    'Sofa',
  ],
  ['grocery', { name: 'Soup', image: '/soup.jpg', price: 89.5 }, 'Soup'],
  [
    'b2b-warehouse',
    { name: 'Drill', image: '/drill.jpg', price: 89.5 },
    'Drill',
  ],
]

const createWrapper = (slug: string) => {
  const store = createTestStore((s) => {
    s.set(activeConfigAtom, createMockConfig({ slug }))
  })
  return buildProvidersWrapper({ store }).Wrapper
}

describe('ChatComparisonItem', () => {
  it.each(commerceCases)(
    'shows only a thumbnail and linked name for %s in full-screen mode',
    (slug, fields, name) => {
      const item = { objectID: 'sku/123', ...fields }
      const { container } = render(
        <ChatWidgetFullscreenContext.Provider value={true}>
          <ChatComparisonItem item={item} />
        </ChatWidgetFullscreenContext.Provider>,
        { wrapper: createWrapper(slug) },
      )
      expect(screen.getByRole('link', { name })).toHaveAttribute(
        'href',
        `/${slug}/product/sku%2F123`,
      )
      expect(screen.getByRole('link', { name })).toHaveClass('bg-white')
      expect(container.querySelector('img')).toHaveAttribute('alt', '')
      expect(screen.queryByText(/89\.5/)).not.toBeInTheDocument()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    },
  )

  it('restores detailed cards when an expanded panel is collapsed', () => {
    const item = {
      objectID: 'p1',
      name: 'Shoe',
      price: 89.5,
      image: '/shoe.jpg',
    }
    const { rerender } = render(
      <ChatWidgetFullscreenContext.Provider value={true}>
        <ChatComparisonItem item={item} />
      </ChatWidgetFullscreenContext.Provider>,
      { wrapper: createWrapper('ecommerce') },
    )
    expect(screen.queryByText('$89.5')).not.toBeInTheDocument()
    rerender(
      <ChatWidgetFullscreenContext.Provider value={false}>
        <ChatComparisonItem item={item} />
      </ChatWidgetFullscreenContext.Provider>,
    )
    expect(screen.getByText('$89.5')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Add to Cart' }),
    ).toBeInTheDocument()
  })

  it('preserves detailed search results in full-screen mode', () => {
    render(
      <ChatWidgetFullscreenContext.Provider value={true}>
        <ChatResultItem item={{ objectID: 'p1', name: 'Shoe', price: 89.5 }} />
      </ChatWidgetFullscreenContext.Provider>,
      { wrapper: createWrapper('ecommerce') },
    )
    expect(screen.getByText('$89.5')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Add to Cart' }),
    ).toBeInTheDocument()
  })

  it('keeps navigation callbacks and panel collapse on compact headers', () => {
    const onClick = vi.fn()
    const collapse = vi.fn()
    render(
      <ChatWidgetFullscreenContext.Provider value={true}>
        <ChatWidgetPanelContext.Provider value={collapse}>
          <ChatComparisonItem
            item={{ objectID: 'p1', name: 'Shoe' }}
            onClick={onClick}
          />
        </ChatWidgetPanelContext.Provider>
      </ChatWidgetFullscreenContext.Provider>,
      { wrapper: createWrapper('ecommerce') },
    )
    const link = screen.getByRole('link', { name: 'Shoe' })
    link.addEventListener('click', (event) => event.preventDefault())
    fireEvent.click(link)
    expect(onClick).toHaveBeenCalledOnce()
    expect(collapse).toHaveBeenCalledOnce()
  })

  it('keeps a usable name and link when the image is missing', () => {
    const { container } = render(
      <ChatWidgetFullscreenContext.Provider value={true}>
        <ChatComparisonItem item={{ objectID: 'p1', name: 'Shoe' }} />
      </ChatWidgetFullscreenContext.Provider>,
      { wrapper: createWrapper('ecommerce') },
    )
    expect(screen.getByRole('link', { name: 'Shoe' })).toBeInTheDocument()
    expect(container.querySelector('img')).toBeNull()
  })
})
