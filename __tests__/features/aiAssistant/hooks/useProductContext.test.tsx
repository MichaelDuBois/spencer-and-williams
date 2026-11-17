import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  AssistantCatalogContext,
  type AssistantCatalog,
} from '@/features/aiAssistant/AssistantCatalogContext'
import { useProductContext } from '@/features/aiAssistant/hooks/useProductContext'
import { productContextState } from '@/features/aiAssistant/stores/aiAssistant'

import { buildJotaiWrapper, createTestStore } from '../../../helpers/jotai-wrapper'

import type { ReactNode } from 'react'

const pageProduct = {
  objectID: 'page-1',
  productUrl: '/ecommerce/product/page-1',
  name: 'Linen Shirt',
}

const catalogProduct = {
  objectID: 'catalog-1',
  productUrl: '/b2b-warehouse/product/catalog-1',
  name: 'Pallet Jack',
}

const buildCatalog = (
  productContext: AssistantCatalog['productContext'],
): AssistantCatalog => {return {
  queryOptions: {},
  productCacheKey: ['products'],
  isReady: true,
  sessionKey: '0',
  context: '',
  productContext,
  resetSession: vi.fn(),
}}

const renderProductContext = ({
  atomProduct = null,
  catalog,
}: {
  atomProduct?: AssistantCatalog['productContext']
  catalog?: AssistantCatalog
} = {}) => {
  const store = createTestStore((s) => {
    s.set(productContextState, atomProduct)
  })
  const JotaiWrapper = buildJotaiWrapper(store)
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiWrapper>
      {catalog ? (
        <AssistantCatalogContext.Provider value={catalog}>
          {children}
        </AssistantCatalogContext.Provider>
      ) : (
        children
      )}
    </JotaiWrapper>
  )

  return renderHook(() => useProductContext(), { wrapper: Wrapper })
}

describe('useProductContext', () => {
  it("returns the catalog's product context when a catalog is provided", () => {
    const { result } = renderProductContext({
      atomProduct: pageProduct,
      catalog: buildCatalog(catalogProduct),
    })

    expect(result.current).toEqual(catalogProduct)
  })

  it('prefers the catalog even when it holds no product', () => {
    const { result } = renderProductContext({
      atomProduct: pageProduct,
      catalog: buildCatalog(null),
    })

    expect(result.current).toBeNull()
  })

  it('falls back to the page atom when there is no catalog provider', () => {
    const { result } = renderProductContext({ atomProduct: pageProduct })

    expect(result.current).toEqual(pageProduct)
  })

  it('returns null when neither source has a product', () => {
    const { result } = renderProductContext()

    expect(result.current).toBeNull()
  })
})
