import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { FashionArticleHitValues } from '@/app/fashion/hitValues.types'
import { usePageContext } from '@/features/aiAssistant/hooks/usePageContext'
import {
  b2bContentContextState,
  fashionContentContextState,
  productContextState,
  travelContentContextState,
  type B2BContentContext,
  type ProductHitValues,
  type TravelContentContext,
} from '@/features/aiAssistant/stores/aiAssistant'

import { buildJotaiWrapper, createTestStore } from '../../../helpers/jotai-wrapper'


const product: ProductHitValues = {
  objectID: 'product-1',
  productUrl: '/ecommerce/product/product-1',
  name: 'Linen Shirt',
}

const travelContentContext: TravelContentContext = {
  contentType: 'article',
  record: {
    objectID: 'travel-1',
    productUrl: '/travel/articles/travel-1',
    title: 'Three Days in Kyoto',
  },
}

const b2bContentContext: B2BContentContext = {
  contentType: 'articles',
  record: {
    objectID: 'b2b-1',
    productUrl: '/b2b-content/articles/b2b-1',
    title: 'Pallet Racking Safety',
    breadcrumb: ['Warehouse'],
  },
}

const fashionContentContext: FashionArticleHitValues = {
  objectID: 'fashion-1',
  productUrl: '/fashion/articles/fashion-1',
  title: 'Autumn Layering',
}

const renderPageContext = (init?: {
  product?: ProductHitValues | null
  travel?: TravelContentContext | null
  b2b?: B2BContentContext | null
  fashion?: FashionArticleHitValues | null
}) => {
  const store = createTestStore((s) => {
    s.set(productContextState, init?.product ?? null)
    s.set(travelContentContextState, init?.travel ?? null)
    s.set(b2bContentContextState, init?.b2b ?? null)
    s.set(fashionContentContextState, init?.fashion ?? null)
  })

  return renderHook(() => usePageContext(), {
    wrapper: buildJotaiWrapper(store),
  })
}

describe('usePageContext', () => {
  it('returns null when no page context is set', () => {
    const { result } = renderPageContext()

    expect(result.current).toBeNull()
  })

  it('builds the product note when a product is set', () => {
    const { result } = renderPageContext({ product })

    expect(result.current).toContain('product page')
    expect(result.current).toContain(JSON.stringify(product))
  })

  it('prefers the product over content context', () => {
    const { result } = renderPageContext({
      product,
      travel: travelContentContext,
      b2b: b2bContentContext,
      fashion: fashionContentContext,
    })

    expect(result.current).toContain('product data')
    expect(result.current).not.toContain('travel-1')
  })

  it('builds the travel note when only travel content is set', () => {
    const { result } = renderPageContext({ travel: travelContentContext })

    expect(result.current).toContain('article page')
    expect(result.current).toContain(
      JSON.stringify(travelContentContext.record),
    )
  })

  it('builds the b2b note when only b2b content is set', () => {
    const { result } = renderPageContext({ b2b: b2bContentContext })

    expect(result.current).toContain('content page')
    expect(result.current).toContain(JSON.stringify(b2bContentContext.record))
  })

  it('builds the fashion note when only fashion content is set', () => {
    const { result } = renderPageContext({ fashion: fashionContentContext })

    expect(result.current).toContain('article page')
    expect(result.current).toContain(JSON.stringify(fashionContentContext))
  })
})
