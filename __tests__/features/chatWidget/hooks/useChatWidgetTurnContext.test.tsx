import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { IMAGE_ONLY_RESPONSE_INSTRUCTION } from '@/features/aiAssistant/constants'
import { chatWidgetPendingTurnContextState } from '@/features/aiAssistant/stores/aiAssistant'
import { useChatWidgetTurnContext } from '@/features/chatWidget/hooks/useChatWidgetTurnContext'

import {
  buildJotaiWrapper,
  createTestStore,
} from '../../../helpers/jotai-wrapper'

vi.mock('@/features/aiAssistant/hooks/usePageContext', () => {return {
  usePageContext: () => '[Page context]',
}})

describe('useChatWidgetTurnContext', () => {
  it('merges and clears programmatic context after one turn', () => {
    const store = createTestStore((testStore) => {
      testStore.set(chatWidgetPendingTurnContextState, {
        searchRecovery: '[Zero-result search context]',
      })
    })
    const getShopperContext = vi.fn(() => '[Shopper context]')
    const { result } = renderHook(
      () => useChatWidgetTurnContext('/shop/search', getShopperContext),
      { wrapper: buildJotaiWrapper(store) },
    )

    expect(result.current.getTurnContext()).toEqual({
      shopperContext: '[Shopper context]',
      searchRecovery: '[Zero-result search context]',
      pageContext: '[Page context]',
      routeContext:
        '[Context: The user is currently on this page: /shop/search.]',
    })
    expect(store.get(chatWidgetPendingTurnContextState)).toBeNull()

    expect(result.current.getTurnContext()).toEqual({
      shopperContext: '[Shopper context]',
      pageContext: '[Page context]',
      routeContext:
        '[Context: The user is currently on this page: /shop/search.]',
    })
  })

  it('attaches formatted image analysis to the next turn only', () => {
    const { result } = renderHook(
      () =>
        useChatWidgetTurnContext('/ecommerce/search', () =>
          '[Context: shopper.]',
        ),
      { wrapper: buildJotaiWrapper() },
    )

    act(() => result.current.setImageAnalysis('red leather sneaker', true))

    expect(result.current.getTurnContext()).toMatchObject({
      imageAnalysis: 'Image Analysis:\nred leather sneaker',
      imageInstruction: IMAGE_ONLY_RESPONSE_INSTRUCTION,
    })
    const nextContext = result.current.getTurnContext()
    expect(nextContext).not.toHaveProperty('imageAnalysis')
    expect(nextContext).not.toHaveProperty('imageInstruction')
  })

  it('drops a cleared image analysis so no later turn receives it', () => {
    const { result } = renderHook(
      () => useChatWidgetTurnContext('/ecommerce/search', () => null),
      { wrapper: buildJotaiWrapper() },
    )

    act(() => {
      result.current.setImageAnalysis('red leather sneaker', false)
      result.current.clearImageAnalysis()
    })

    expect(result.current.getTurnContext()).not.toHaveProperty('imageAnalysis')
  })

  it('does not add image-only response guidance when the image has text', () => {
    const { result } = renderHook(
      () => useChatWidgetTurnContext('/ecommerce/search', () => null),
      { wrapper: buildJotaiWrapper() },
    )

    act(() => result.current.setImageAnalysis('red leather sneaker', false))

    const context = result.current.getTurnContext()
    expect(context).toMatchObject({
      imageAnalysis: 'Image Analysis:\nred leather sneaker',
    })
    expect(context).not.toHaveProperty('imageInstruction')
  })

  it('attaches no image context when the analysis is empty', () => {
    const { result } = renderHook(
      () => useChatWidgetTurnContext('/ecommerce/search', () => null),
      { wrapper: buildJotaiWrapper() },
    )

    act(() => result.current.setImageAnalysis('  ', true))

    const context = result.current.getTurnContext()
    expect(context).not.toHaveProperty('imageAnalysis')
    expect(context).not.toHaveProperty('imageInstruction')
  })
})
