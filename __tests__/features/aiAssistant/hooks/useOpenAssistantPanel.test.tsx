import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useOpenAssistantPanel } from '@/features/aiAssistant/hooks/ui/useOpenAssistantPanel'
import {
  chatWidgetClearHistoryState,
  chatWidgetOrderContextState,
  chatWidgetPendingOrderContextState,
  chatWidgetPendingTurnContextState,
  initialAIMessageState,
  initialAITurnContextState,
  isAIAssistantExpandedState,
  isAIAssistantOpenState,
} from '@/features/aiAssistant/stores/aiAssistant'
import { track } from '@/lib/analytics/track'
import { activeConfigAtom } from '@/stores/activeConfig'
import {
  chatWidgetEnabledAtom,
  chatWidgetPendingMessageAtom,
  demoOptionsStore,
  resetDemoOptionsAtom,
} from '@/stores/demoOptions'

import { createTestStore } from '../../../helpers/jotai-wrapper'
import {
  buildProvidersWrapper,
  createMockConfig,
} from '../../../helpers/test-utils'

vi.mock('@/lib/analytics/track', () => {
  return { track: vi.fn() }
})

const pushMock = vi.fn()
const refineMock = vi.fn()

vi.mock('next/navigation', () => {return {
  useRouter: () => {return { push: pushMock }},
}})

vi.mock('react-instantsearch', () => {return {
  useSearchBox: () => {return { refine: refineMock }},
}})

const renderOpenPanel = (
  chatWidgetEnabled: boolean,
  chatWidgetAgentID = 'chat-agent-1',
) => {
  const store = createTestStore((s) => {
    s.set(
      activeConfigAtom,
      createMockConfig({ features: { agentStudio: { chatWidgetAgentID } } }),
    )
  })
  demoOptionsStore.set(chatWidgetEnabledAtom, chatWidgetEnabled)
  const { result } = renderHook(
    () => useOpenAssistantPanel({ basePath: '/ecommerce' }),
    { wrapper: buildProvidersWrapper({ store }).Wrapper },
  )
  return { store, result }
}

describe('useOpenAssistantPanel', () => {
  beforeEach(() => {
    pushMock.mockClear()
    refineMock.mockClear()
    vi.mocked(track).mockClear()
  })

  afterEach(() => {
    demoOptionsStore.set(resetDemoOptionsAtom)
  })

  describe('with the Chat widget toggle off', () => {
    it('opens the custom assistant panel with the message', () => {
      const { store, result } = renderOpenPanel(false)
      const { openWithMessage } = result.current

      openWithMessage('do you sell tents?')

      expect(store.get(isAIAssistantOpenState)).toBe(true)
      expect(store.get(isAIAssistantExpandedState)).toBe(true)
      expect(store.get(initialAIMessageState)).toBe('do you sell tents?')
      expect(store.get(chatWidgetPendingMessageAtom)).toBeNull()
      expect(refineMock).toHaveBeenCalledWith('')
      expect(pushMock).toHaveBeenCalledWith('/ecommerce/search')
    })

    it('honours the in-place options', () => {
      const { store, result } = renderOpenPanel(false)
      const { openWithMessage } = result.current

      openWithMessage('tell me more', {
        expanded: false,
        navigate: false,
        keepQuery: true,
      })

      expect(store.get(isAIAssistantExpandedState)).toBe(false)
      expect(refineMock).not.toHaveBeenCalled()
      expect(pushMock).not.toHaveBeenCalled()
    })

    it('stores turn context for the next assistant turn', () => {
      const { store, result } = renderOpenPanel(false)
      const turnContext = { searchRecovery: 'The search returned zero hits.' }

      result.current.openWithMessage('Help me recover this search', {
        navigate: false,
        turnContext,
      })

      expect(store.get(initialAITurnContextState)).toEqual(turnContext)
    })

    it('tracks assistant_opened when the panel goes from closed to open', () => {
      const { result } = renderOpenPanel(false)

      act(() => result.current.openWithMessage('do you sell tents?'))

      expect(track).toHaveBeenCalledTimes(1)
      expect(track).toHaveBeenCalledWith('assistant_opened', {
        surface: 'ai_assistant',
      })
    })

    it('does not track again while the panel is already open', () => {
      const { store, result } = renderOpenPanel(false)

      act(() => result.current.openWithMessage('first question'))
      act(() => result.current.openWithMessage('second question'))

      expect(track).toHaveBeenCalledTimes(1)

      act(() => store.set(isAIAssistantOpenState, false))
      act(() => result.current.openWithMessage('after closing'))

      expect(track).toHaveBeenCalledTimes(2)
    })
  })

  describe('with the Chat widget toggle on', () => {
    it('hands the message to the Chat widget instead of the panel', () => {
      const { store, result } = renderOpenPanel(true)
      const { openWithMessage } = result.current

      openWithMessage('do you sell tents?')

      expect(store.get(chatWidgetPendingMessageAtom)).toBe('do you sell tents?')
      expect(store.get(isAIAssistantOpenState)).toBe(false)
      expect(store.get(initialAIMessageState)).toBe('')
      expect(refineMock).toHaveBeenCalledWith('')
      expect(pushMock).toHaveBeenCalledWith('/ecommerce/search')
    })

    it('hands order context to the Chat widget with the message', () => {
      const { store, result } = renderOpenPanel(true)
      const { openWithMessage } = result.current

      openWithMessage('How should I care for my order?', {
        orderContext: {
          orderId: 'SW-TEST-0001',
          items: [{ objectID: 'p1', name: 'Trail Shoe' }],
        },
      })

      expect(store.get(chatWidgetOrderContextState)).toEqual({
        orderId: 'SW-TEST-0001',
        items: [{ objectID: 'p1', name: 'Trail Shoe' }],
      })
      expect(store.get(chatWidgetPendingOrderContextState)).toEqual({
        orderId: 'SW-TEST-0001',
        items: [{ objectID: 'p1', name: 'Trail Shoe' }],
      })
      expect(store.get(chatWidgetClearHistoryState)).toBe(true)
    })

    it('honours keepQuery and navigate', () => {
      const { store, result } = renderOpenPanel(true)
      const { openWithMessage } = result.current

      openWithMessage('tell me more', { navigate: false, keepQuery: true })

      expect(store.get(chatWidgetPendingMessageAtom)).toBe('tell me more')
      expect(refineMock).not.toHaveBeenCalled()
      expect(pushMock).not.toHaveBeenCalled()
    })

    it('passes turn context to the next Chat widget turn', () => {
      const { store, result } = renderOpenPanel(true)
      const turnContext = { searchRecovery: 'The search returned zero hits.' }

      result.current.openWithMessage('Help me recover this search', {
        navigate: false,
        turnContext,
      })

      expect(store.get(chatWidgetPendingTurnContextState)).toEqual(turnContext)
    })

    it('leaves open tracking to the Chat widget', () => {
      const { result } = renderOpenPanel(true)

      act(() => result.current.openWithMessage('do you sell tents?'))

      expect(track).not.toHaveBeenCalled()
    })
  })

  describe('with the Chat widget toggle on but no chat widget agent', () => {
    it('opens the custom assistant panel instead of the widget', () => {
      const { store, result } = renderOpenPanel(true, '')

      act(() => result.current.openWithMessage('do you sell tents?'))

      expect(store.get(isAIAssistantOpenState)).toBe(true)
      expect(store.get(initialAIMessageState)).toBe('do you sell tents?')
      expect(store.get(chatWidgetPendingMessageAtom)).toBeNull()
      expect(track).toHaveBeenCalledWith('assistant_opened', {
        surface: 'ai_assistant',
      })
    })
  })
})
