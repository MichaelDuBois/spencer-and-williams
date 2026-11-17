import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useShopperContext } from '@/features/aiAssistant/hooks/useShopperContext'
import { activeConfigAtom } from '@/stores/activeConfig'
import { getCartAtom } from '@/stores/cart'

import { createTestStore } from '../../../helpers/jotai-wrapper'
import {
  buildProvidersWrapper,
  createMockConfig,
} from '../../../helpers/test-utils'

const renderShopperContext = (viewerContextOverride?: string | null) => {
  const store = createTestStore((s) => {
    s.set(activeConfigAtom, createMockConfig())
  })

  return {
    store,
    ...renderHook(() => useShopperContext(viewerContextOverride), {
      wrapper: buildProvidersWrapper({ store }).Wrapper,
    }),
  }
}

describe('useShopperContext', () => {
  it('describes the active vertical store', () => {
    const { result } = renderShopperContext()

    expect(result.current.getShopperContext()).toContain('ecommerce')
  })

  it('lets a vertical viewer note replace the persona note', () => {
    const { result } = renderShopperContext('[Context: the viewer watches.]')

    expect(result.current.getShopperContext()).toBe(
      '[Context: the viewer watches.]',
    )
  })

  it('keeps the reader stable while its value tracks the cart', async () => {
    const { result, store } = renderShopperContext()
    const initialReader = result.current.getShopperContext

    await act(async () => {
      store.set(getCartAtom('ecommerce'), {
        items: [{ objectID: 'sku-1', name: 'Running shoes', quantity: 1 }],
        updatedAt: Date.now(),
      })
    })

    expect(result.current.getShopperContext).toBe(initialReader)
    expect(result.current.getShopperContext()).toContain('Running shoes x1')
  })
})
