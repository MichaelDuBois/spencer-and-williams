import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAddToCart } from '@/hooks/useAddToCart'

const addItem = vi.fn()
const sendAddToCartEvent = vi.fn()

vi.mock('@/hooks/useCart', () => {
  return { useCart: () => {return { addItem }} }
})

vi.mock('@/hooks/useInsightsEvents', () => {
  return { useInsightsEvents: () => {return { sendAddToCartEvent }} }
})

const PRODUCT = {
  objectID: 'p1',
  name: 'Widget',
  image: '/widget.webp',
  price: 25,
  brand: 'Acme',
  description: 'ignored extra field',
}

describe('useAddToCart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    addItem.mockReturnValue(true)
  })

  it('adds the product with the current quantity and sends the event', () => {
    const { result } = renderHook(() => useAddToCart({ surface: 'pdp' }))

    act(() => result.current.addToCart(PRODUCT))

    expect(addItem).toHaveBeenCalledWith({
      objectID: 'p1',
      name: 'Widget',
      image: '/widget.webp',
      price: 25,
      brand: 'Acme',
      quantity: 1,
    })
    expect(sendAddToCartEvent).toHaveBeenCalledWith(
      {
        objectID: 'p1',
        queryID: undefined,
        price: 25,
        quantity: 1,
      },
      { surface: 'pdp' },
    )
  })

  it('uses the updated quantity after setQuantity', () => {
    const { result } = renderHook(() => useAddToCart({ surface: 'pdp' }))

    act(() => result.current.setQuantity(3))
    act(() => result.current.addToCart(PRODUCT))

    expect(addItem).toHaveBeenCalledWith(
      expect.objectContaining({ quantity: 3 }),
    )
    expect(sendAddToCartEvent).toHaveBeenCalledWith(
      expect.objectContaining({ quantity: 3 }),
      { surface: 'pdp' },
    )
  })

  it('forwards queryID to both the cart item and the add-to-cart event', () => {
    const { result } = renderHook(() => useAddToCart({ surface: 'pdp' }))

    act(() => result.current.addToCart(PRODUCT, { queryID: 'q-123' }))

    expect(addItem).toHaveBeenCalledWith(
      expect.objectContaining({ queryID: 'q-123' }),
    )
    expect(sendAddToCartEvent).toHaveBeenCalledWith(
      expect.objectContaining({ queryID: 'q-123' }),
      { surface: 'pdp' },
    )
  })

  it('does not send an event when the cart rejects the product', () => {
    addItem.mockReturnValue(false)
    const { result } = renderHook(() => useAddToCart({ surface: 'pdp' }))

    act(() => result.current.addToCart(PRODUCT))

    expect(sendAddToCartEvent).not.toHaveBeenCalled()
  })

  it('tags the event with the surface the hook was created for', () => {
    const { result } = renderHook(() => useAddToCart({ surface: 'recipe' }))

    act(() => result.current.addToCart(PRODUCT))

    expect(sendAddToCartEvent).toHaveBeenCalledTimes(1)
    expect(sendAddToCartEvent).toHaveBeenCalledWith(
      expect.objectContaining({ objectID: 'p1' }),
      { surface: 'recipe' },
    )
  })

  it('forwards the Recommend model with the surface', () => {
    const { result } = renderHook(() =>
      useAddToCart({ surface: 'recommend', model: 'related-products' }),
    )

    act(() => result.current.addToCart(PRODUCT))

    expect(sendAddToCartEvent).toHaveBeenCalledWith(
      expect.objectContaining({ objectID: 'p1' }),
      { surface: 'recommend', model: 'related-products' },
    )
  })
})
