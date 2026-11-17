import { fireEvent, screen, waitFor } from '@testing-library/react'
import { createStore } from 'jotai'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  AssistantCatalogContext,
  type AssistantCatalog,
} from '@/features/aiAssistant/AssistantCatalogContext'
import { ProductContextCard } from '@/features/aiAssistant/components/ProductContextCard'
import {
  productContextState,
  type ProductHitValues,
} from '@/features/aiAssistant/stores/aiAssistant'
import type { PrepareCartProduct } from '@/hooks/useAddToCart'

import { render } from '@tests/helpers/test-utils'

const { addItemMock, sendAddToCartEventMock } = vi.hoisted(() => {
  return { addItemMock: vi.fn(), sendAddToCartEventMock: vi.fn() }
})

vi.mock('@/hooks/useCart', () => {
  return {
    useCart: () => {
      return { addItem: addItemMock }
    },
  }
})

vi.mock('@/hooks/useInsightsEvents', () => {
  return {
    useInsightsEvents: () => {
      return { sendAddToCartEvent: sendAddToCartEventMock }
    },
  }
})

const PRODUCT = {
  objectID: 'p1',
  productUrl: '/ecommerce/product/p1',
  name: 'Trail Runner',
  brand: 'Stride',
  image: 'https://cdn/shoe.jpg',
  price: 120,
} as ProductHitValues

const buildCatalog = (
  prepareCartProduct: PrepareCartProduct,
): AssistantCatalog => {
  return {
    prepareCartProduct,
    queryOptions: {},
    productCacheKey: ['b2b-products'],
    isReady: true,
    sessionKey: '0',
    context: '',
    productContext: PRODUCT,
    resetSession: vi.fn(),
  }
}

const renderWithPageProduct = () => {
  const store = createStore()
  store.set(productContextState, PRODUCT)
  return render(<ProductContextCard />, { store })
}

const renderWithCatalog = (catalog: AssistantCatalog) =>
  render(
    <AssistantCatalogContext.Provider value={catalog}>
      <ProductContextCard />
    </AssistantCatalogContext.Provider>,
  )

describe('ProductContextCard', () => {
  beforeEach(() => {
    addItemMock.mockReset()
    addItemMock.mockReturnValue(true)
    sendAddToCartEventMock.mockClear()
  })

  it('adds the viewed product once and tracks it as an assistant context add', () => {
    renderWithPageProduct()

    fireEvent.click(screen.getByRole('button'))

    expect(addItemMock).toHaveBeenCalledTimes(1)
    expect(addItemMock).toHaveBeenCalledWith(
      expect.objectContaining({ objectID: 'p1', quantity: 1 }),
    )
    expect(sendAddToCartEventMock).toHaveBeenCalledTimes(1)
    expect(sendAddToCartEventMock).toHaveBeenCalledWith(
      { objectID: 'p1', queryID: undefined, price: 120, quantity: 1 },
      { surface: 'assistant_context' },
    )
  })

  it('tracks a revalidated add at the prepared price', async () => {
    const prepare: PrepareCartProduct = async (product) => {
      return { product, price: 96, discount: 24, isCurrent: () => true }
    }
    renderWithCatalog(buildCatalog(prepare))

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() =>
      expect(sendAddToCartEventMock).toHaveBeenCalledWith(
        {
          objectID: 'p1',
          queryID: undefined,
          price: 96,
          quantity: 1,
          discount: 24,
        },
        { surface: 'assistant_context' },
      ),
    )
    expect(sendAddToCartEventMock).toHaveBeenCalledTimes(1)
  })

  it('adds and tracks nothing when revalidation rejects the product', async () => {
    const reject: PrepareCartProduct = async () => {
      throw new Error('This product is unavailable.')
    }
    renderWithCatalog(buildCatalog(reject))

    fireEvent.click(screen.getByRole('button'))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This product is unavailable.',
    )
    expect(addItemMock).not.toHaveBeenCalled()
    expect(sendAddToCartEventMock).not.toHaveBeenCalled()
  })
})
