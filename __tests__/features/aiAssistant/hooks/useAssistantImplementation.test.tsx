import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useAssistantImplementation } from '@/features/aiAssistant/hooks/ui/useAssistantImplementation'
import {
  isAIAssistantExpandedState,
  isAIAssistantOpenState,
} from '@/features/aiAssistant/stores/aiAssistant'
import { activeConfigAtom } from '@/stores/activeConfig'
import {
  chatWidgetEnabledAtom,
  chatWidgetOpenAtom,
  chatWidgetPendingMessageAtom,
  demoOptionsStore,
  resetDemoOptionsAtom,
} from '@/stores/demoOptions'

import { createTestStore } from '../../../helpers/jotai-wrapper'
import { buildProvidersWrapper, createMockConfig } from '../../../helpers/test-utils'

const pathnameMock = vi.hoisted(() => vi.fn(() => '/ecommerce/search'))

vi.mock('next/navigation', () => {return { usePathname: pathnameMock }})

const renderAssistantImplementation = (
  setup: (store: ReturnType<typeof createTestStore>) => void,
) => {
  const store = createTestStore((s) => {
    s.set(activeConfigAtom, createMockConfig())
  })
  setup(store)
  const { result } = renderHook(() => useAssistantImplementation(), {
    wrapper: buildProvidersWrapper({ store }).Wrapper,
  })

  return { result, store }
}

describe('useAssistantImplementation', () => {
  afterEach(() => {
    demoOptionsStore.set(resetDemoOptionsAtom)
  })

  it('keeps an open custom assistant open when switching to Chat', () => {
    const { result, store } = renderAssistantImplementation((s) => {
      s.set(isAIAssistantOpenState, true)
      s.set(isAIAssistantExpandedState, true)
    })

    act(() => result.current.setAssistantImplementation(true))

    expect(demoOptionsStore.get(chatWidgetEnabledAtom)).toBe(true)
    expect(store.get(isAIAssistantOpenState)).toBe(false)
    expect(store.get(chatWidgetPendingMessageAtom)).toBe('')
  })

  it('keeps an open Chat open when switching back to the custom assistant', () => {
    const { result, store } = renderAssistantImplementation((s) => {
      demoOptionsStore.set(chatWidgetEnabledAtom, true)
      s.set(chatWidgetOpenAtom, true)
    })

    act(() => result.current.setAssistantImplementation(false))

    expect(demoOptionsStore.get(chatWidgetEnabledAtom)).toBe(false)
    expect(store.get(chatWidgetOpenAtom)).toBe(false)
    expect(store.get(isAIAssistantOpenState)).toBe(true)
    expect(store.get(isAIAssistantExpandedState)).toBe(false)
  })
})
