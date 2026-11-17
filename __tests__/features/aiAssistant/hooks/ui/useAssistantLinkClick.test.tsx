import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AssistantCardNavigationProvider } from '@/features/aiAssistant/components/messages/AssistantCardNavigationContext'
import { useAssistantLinkClick } from '@/features/aiAssistant/hooks/ui/useAssistantLinkClick'
import { isAIAssistantExpandedState } from '@/features/aiAssistant/stores/aiAssistant'
import { track } from '@/lib/analytics/track'

import { createTestStore } from '../../../../helpers/jotai-wrapper'
import { buildProvidersWrapper } from '../../../../helpers/test-utils'

import type { ReactNode } from 'react'

const { sendProductClickEventMock } = vi.hoisted(() => {
  return { sendProductClickEventMock: vi.fn() }
})

vi.mock('@/lib/analytics/track', () => {
  return { track: vi.fn() }
})

vi.mock('@/hooks/useMediaQuery', () => {
  return { useMediaQuery: () => false }
})

vi.mock('@/hooks/useInsightsEvents', () => {
  return {
    useInsightsEvents: () => {
      return { sendProductClickEvent: sendProductClickEventMock }
    },
  }
})

const renderLinkClick = (
  objectID?: string,
  attribution?: { queryID?: string; position?: number },
) => {
  const store = createTestStore((s) => s.set(isAIAssistantExpandedState, true))
  const { result } = renderHook(
    () => useAssistantLinkClick(objectID, attribution),
    {
      wrapper: buildProvidersWrapper({ store }).Wrapper,
    },
  )
  return { store, handleClick: result.current }
}

describe('useAssistantLinkClick', () => {
  beforeEach(() => {
    vi.mocked(track).mockClear()
    sendProductClickEventMock.mockClear()
  })

  it('tracks the clicked result and collapses the panel', () => {
    const { store, handleClick } = renderLinkClick('p1')

    act(() => handleClick())

    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith('assistant_result_clicked', {
      surface: 'ai_assistant',
      objectID: 'p1',
    })
    expect(store.get(isAIAssistantExpandedState)).toBe(false)
  })

  it('tracks nothing for links that are not results', () => {
    const { store, handleClick } = renderLinkClick()

    act(() => handleClick())

    expect(track).not.toHaveBeenCalled()
    expect(store.get(isAIAssistantExpandedState)).toBe(false)
  })

  it('uses the card navigation override when one is provided', () => {
    const onLinkClick = vi.fn()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AssistantCardNavigationProvider onLinkClick={onLinkClick}>
        {children}
      </AssistantCardNavigationProvider>
    )
    const { result } = renderHook(() => useAssistantLinkClick('p1'), {
      wrapper,
    })

    act(() => result.current())

    expect(onLinkClick).toHaveBeenCalledOnce()
    expect(track).not.toHaveBeenCalled()
  })

  it('emits the product click with the search attribution when given', () => {
    const { handleClick } = renderLinkClick('p1', {
      queryID: 'q1',
      position: 3,
    })

    act(() => handleClick())

    expect(track).toHaveBeenCalledWith('assistant_result_clicked', {
      surface: 'ai_assistant',
      objectID: 'p1',
    })
    expect(sendProductClickEventMock).toHaveBeenCalledTimes(1)
    expect(sendProductClickEventMock).toHaveBeenCalledWith(
      { objectID: 'p1', __queryID: 'q1', __position: 3 },
      { surface: 'ai_assistant' },
    )
  })

  it('keeps the callback stable for equivalent attribution and updates it when values change', () => {
    const { result, rerender } = renderHook(
      ({ position }) => useAssistantLinkClick('p1', { queryID: 'q1', position }),
      { initialProps: { position: 1 } },
    )
    const first = result.current
    rerender({ position: 1 })
    expect(result.current).toBe(first)
    rerender({ position: 2 })
    expect(result.current).not.toBe(first)
    act(() => result.current())
    expect(sendProductClickEventMock).toHaveBeenCalledWith(
      { objectID: 'p1', __queryID: 'q1', __position: 2 },
      { surface: 'ai_assistant' },
    )
  })

  it('emits the product click without attribution when the search had none', () => {
    const { handleClick } = renderLinkClick('p1', {})

    act(() => handleClick())

    expect(sendProductClickEventMock).toHaveBeenCalledTimes(1)
    expect(sendProductClickEventMock).toHaveBeenCalledWith(
      { objectID: 'p1', __queryID: undefined, __position: undefined },
      { surface: 'ai_assistant' },
    )
  })

  it('skips the product click for cards without attribution', () => {
    const { handleClick } = renderLinkClick('p1')

    act(() => handleClick())

    expect(track).toHaveBeenCalledTimes(1)
    expect(sendProductClickEventMock).not.toHaveBeenCalled()
  })

  it('skips the product click through the navigation override', () => {
    const onLinkClick = vi.fn()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AssistantCardNavigationProvider onLinkClick={onLinkClick}>
        {children}
      </AssistantCardNavigationProvider>
    )
    const { result } = renderHook(
      () => useAssistantLinkClick('p1', { queryID: 'q1', position: 1 }),
      { wrapper },
    )

    act(() => result.current())

    expect(onLinkClick).toHaveBeenCalledOnce()
    expect(sendProductClickEventMock).not.toHaveBeenCalled()
  })
})
