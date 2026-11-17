import { createStore } from 'jotai'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import FashionArticlePage from '@/app/fashion/article/[id]/page'
import type { FashionArticleHitValues } from '@/app/fashion/hitValues.types'
import { fashionContentContextState } from '@/features/aiAssistant/stores/aiAssistant'

import { render } from '@tests/helpers/test-utils'

const { useConnectedProductsMock, useExtractedHitMock } = vi.hoisted(() => {return {
  useConnectedProductsMock: vi.fn(),
  useExtractedHitMock: vi.fn(),
}})

vi.mock('next/navigation', () => {return {
  useParams: () => {return { id: 'fashion-article' }},
}})

vi.mock('@/app/fashion/_hooks/useConnectedProducts', () => {return {
  useConnectedProducts: useConnectedProductsMock,
}})

vi.mock('@/hooks/useExtractedHit', () => {return {
  useExtractedHit: useExtractedHitMock,
}})

vi.mock('@/app/fashion/article/[id]/_components', () => {return {
  FashionArticlePageContent: ({
    isProductsLoading,
  }: {
    isProductsLoading: boolean
  }) => <div>{isProductsLoading ? 'products-loading' : 'products-loaded'}</div>,
}})

const article = {
  objectID: 'fashion-article',
  productUrl: '/fashion/article/fashion-article',
  title: 'A City Guide to Tonal Layers',
  relatedProducts: ['product-a'],
} as FashionArticleHitValues

describe('FashionArticlePage', () => {
  beforeEach(() => {
    useExtractedHitMock.mockReturnValue({
      data: article,
      isLoading: false,
      isError: false,
    })
    useConnectedProductsMock.mockReturnValue({
      products: [],
      isLoading: true,
    })
  })

  it('keeps article context stable when product loading state changes', () => {
    const store = createStore()
    const { rerender } = render(<FashionArticlePage />, { store })

    expect(store.get(fashionContentContextState)).toBe(article)

    const contextUpdates: unknown[] = []
    const unsubscribe = store.sub(fashionContentContextState, () => {
      contextUpdates.push(store.get(fashionContentContextState))
    })

    useConnectedProductsMock.mockReturnValue({
      products: [],
      isLoading: false,
    })
    rerender(<FashionArticlePage />)
    unsubscribe()

    expect(contextUpdates).toEqual([])
    expect(store.get(fashionContentContextState)).toBe(article)
  })
})
