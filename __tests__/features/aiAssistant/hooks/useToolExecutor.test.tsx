import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { MessageStateAPI } from '@/features/aiAssistant/hooks/useMessageState'
import { useToolExecutor } from '@/features/aiAssistant/hooks/useToolExecutor'
import type { ToolCall } from '@/features/aiAssistant/types'

const buildMessageState = () =>
  ({
    appendDisplayResults: vi.fn(),
    appendOrderHistory: vi.fn(),
    appendSuggestActions: vi.fn(),
    appendNoResultsMessage: vi.fn(),
  }) as unknown as MessageStateAPI

const setup = (messageState: MessageStateAPI) =>
  renderHook(() =>
    useToolExecutor({
      messageState,
      sendCompletion: vi.fn(),
      search: vi.fn(),
      vertical: 'ecommerce',
      orders: [],
    }),
  )

describe('useToolExecutor.executeToolCalls', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('routes a displayResults call to the handler and injects the vertical', async () => {
    const messageState = buildMessageState()
    const { result } = setup(messageState)

    const toolCalls = [
      {
        name: 'displayResults',
        args: { groups: [{ products: [{ objectID: 'p1' }] }] },
      },
    ] as unknown as ToolCall[]

    await result.current.executeToolCalls(toolCalls, 'msg-1', [])

    expect(messageState.appendDisplayResults).toHaveBeenCalledWith('msg-1', {
      groups: [{ products: [{ objectID: 'p1' }] }],
      vertical: 'ecommerce',
    })
  })

  it('appends a no-results message when the display group has no items', async () => {
    const messageState = buildMessageState()
    const { result } = setup(messageState)

    const toolCalls = [
      { name: 'displayResults', args: { groups: [{ products: [] }] } },
    ] as unknown as ToolCall[]

    await result.current.executeToolCalls(toolCalls, 'msg-2', [])

    expect(messageState.appendNoResultsMessage).toHaveBeenCalledWith('msg-2')
    expect(messageState.appendDisplayResults).not.toHaveBeenCalled()
  })

  it('ignores an unknown tool without throwing', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const messageState = buildMessageState()
    const { result } = setup(messageState)

    const toolCalls = [
      { name: 'mysteryTool', args: {} },
    ] as unknown as ToolCall[]

    const outcome = await result.current.executeToolCalls(
      toolCalls,
      'msg-3',
      [],
    )

    expect(outcome).toEqual({ suggestions: [] })
    expect(messageState.appendDisplayResults).not.toHaveBeenCalled()
  })
})

it('stops a pending search before follow-up and display when its session aborts', async () => {
  const messageState = buildMessageState()
  const pending = Promise.withResolvers<{ summaries: [] }>()
  const sendCompletion = vi.fn()
  const controller = new AbortController()
  const { result } = renderHook(() =>
    useToolExecutor({
      messageState,
      sendCompletion,
      search: () => pending.promise,
      vertical: 'b2b-warehouse',
      orders: [],
    }),
  )
  await act(async () => {
    const request = result.current.executeToolCalls(
      [{ id: 's1', name: 'search', args: { queries: [{ query: 'drill' }] } }],
      'msg',
      [],
      controller.signal,
    )
    controller.abort()
    pending.resolve({ summaries: [] })
    await expect(request).rejects.toMatchObject({ name: 'AbortError' })
  })
  expect(sendCompletion).not.toHaveBeenCalled()
  expect(messageState.appendDisplayResults).not.toHaveBeenCalled()
  expect(messageState.appendNoResultsMessage).not.toHaveBeenCalled()
})
