import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { IMAGE_ONLY_MESSAGE } from '@/features/aiAssistant/constants'
import { useChatWidgetTracking } from '@/features/chatWidget/hooks/useChatWidgetTracking'
import { track } from '@/lib/analytics/track'

import type { UIMessage } from 'instantsearch.js/es/lib/chat'

vi.mock('@/lib/analytics/track', () => {
  return { track: vi.fn() }
})

const conversation = (
  userMessageId: string,
  answerId = 'answer',
): UIMessage[] =>
  [
    { id: userMessageId, role: 'user', parts: [{ type: 'text', text: 'tents?' }] },
    { id: answerId, role: 'assistant', parts: [{ type: 'text', text: 'Sure!' }] },
  ] as UIMessage[]

const AGENT_ID = 'agent-1'

describe('useChatWidgetTracking', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.mocked(track).mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('tracks the user message when its answer finishes', () => {
    const { result } = renderHook(() => useChatWidgetTracking(true, AGENT_ID))
    act(() => result.current.handleFinish({ messages: conversation('u1') }))

    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith('assistant_message_sent', {
      surface: 'chat_widget',
      message: 'tents?',
    })
  })

  it('tracks an image-only placeholder as an empty message', () => {
    const { result } = renderHook(() => useChatWidgetTracking(true, AGENT_ID))
    const messages = conversation('u1')
    messages[0] = {
      ...messages[0],
      metadata: { chatImage: { isImageOnly: true } },
      parts: [{ type: 'text', text: IMAGE_ONLY_MESSAGE }],
    }

    act(() => result.current.handleFinish({ messages }))

    expect(track).toHaveBeenCalledWith('assistant_message_sent', {
      surface: 'chat_widget',
      message: '',
    })
  })

  it('tracks a real caption that matches the image-only placeholder', () => {
    const { result } = renderHook(() => useChatWidgetTracking(true, AGENT_ID))
    const messages = conversation('u1')
    messages[0] = {
      ...messages[0],
      metadata: { chatImage: { isImageOnly: false } },
      parts: [{ type: 'text', text: IMAGE_ONLY_MESSAGE }],
    }

    act(() => result.current.handleFinish({ messages }))

    expect(track).toHaveBeenCalledWith('assistant_message_sent', {
      surface: 'chat_widget',
      message: IMAGE_ONLY_MESSAGE,
    })
  })

  it('does not re-track a turn that finishes again', () => {
    const { result } = renderHook(() => useChatWidgetTracking(true, AGENT_ID))
    const messages = conversation('u1')
    act(() => result.current.handleFinish({ messages }))
    act(() => result.current.handleFinish({ messages }))

    expect(track).toHaveBeenCalledTimes(1)
  })

  it('does not re-track the user message of a regenerated answer', () => {
    const { result } = renderHook(() => useChatWidgetTracking(true, AGENT_ID))
    act(() =>
      result.current.handleFinish({ messages: conversation('u1', 'answer-1') }),
    )
    act(() =>
      result.current.handleFinish({ messages: conversation('u1', 'answer-2') }),
    )

    expect(track).toHaveBeenCalledTimes(1)
  })

  it('tracks each new user message', () => {
    const { result } = renderHook(() => useChatWidgetTracking(true, AGENT_ID))
    act(() => result.current.handleFinish({ messages: conversation('u1') }))
    act(() => result.current.handleFinish({ messages: conversation('u2') }))

    expect(track).toHaveBeenCalledTimes(2)
  })

  it('does not re-track a restored user message after a remount', () => {
    const firstMount = renderHook(() => useChatWidgetTracking(true, AGENT_ID))
    act(() =>
      firstMount.result.current.handleFinish({
        messages: conversation('u1', 'answer-1'),
      }),
    )
    firstMount.unmount()

    const secondMount = renderHook(() => useChatWidgetTracking(true, AGENT_ID))
    act(() =>
      secondMount.result.current.handleFinish({
        messages: conversation('u1', 'answer-2'),
      }),
    )

    expect(track).toHaveBeenCalledTimes(1)
  })

  it('scopes tracked user messages to their agent', () => {
    const firstAgent = renderHook(() => useChatWidgetTracking(true, AGENT_ID))
    act(() =>
      firstAgent.result.current.handleFinish({ messages: conversation('u1') }),
    )

    const otherAgent = renderHook(() => useChatWidgetTracking(true, 'agent-2'))
    act(() =>
      otherAgent.result.current.handleFinish({ messages: conversation('u1') }),
    )

    expect(track).toHaveBeenCalledTimes(2)
  })

  it('keeps the stored ids bounded', () => {
    const { result } = renderHook(() => useChatWidgetTracking(true, AGENT_ID))
    for (let index = 0; index < 205; index++) {
      act(() =>
        result.current.handleFinish({ messages: conversation(`u${index}`) }),
      )
    }

    const stored: unknown = JSON.parse(
      sessionStorage.getItem(
        'spencer-williams-chat-widget-tracked-messages-agent-1',
      ) ?? '[]',
    )
    expect(stored).toHaveLength(200)
    expect(stored).toContain('u204')
    expect(stored).not.toContain('u0')
  })

  it('still dedupes in memory when sessionStorage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage disabled')
    })
    const { result } = renderHook(() => useChatWidgetTracking(true, AGENT_ID))
    act(() =>
      result.current.handleFinish({ messages: conversation('u1', 'answer-1') }),
    )
    act(() =>
      result.current.handleFinish({ messages: conversation('u1', 'answer-2') }),
    )
    act(() => result.current.handleFinish({ messages: conversation('u2') }))

    expect(track).toHaveBeenCalledTimes(2)
  })
})
