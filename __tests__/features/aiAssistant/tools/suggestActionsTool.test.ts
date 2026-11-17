import { describe, expect, it, vi } from 'vitest'

import {
  parseSuggestActionsArgs,
  suggestActionsToolHandler,
} from '@/features/aiAssistant/tools/suggestActionsTool'
import type { ToolExecutionContext } from '@/features/aiAssistant/types'

describe('parseSuggestActionsArgs', () => {
  it('returns the valid actions when label and url are non-empty strings', () => {
    const actions = [
      { label: 'Buy', url: '/buy' },
      { label: 'View', url: '/view' },
    ]
    expect(parseSuggestActionsArgs({ actions })).toEqual({ actions })
  })

  it('filters out actions missing a label or url', () => {
    const result = parseSuggestActionsArgs({
      actions: [
        { label: 'Keep', url: '/keep' },
        { label: '', url: '/empty-label' },
        { label: 'No url', url: '' },
        { label: 'Missing url' },
      ],
    })
    expect(result).toEqual({ actions: [{ label: 'Keep', url: '/keep' }] })
  })

  it('returns null when actions is not an array', () => {
    expect(parseSuggestActionsArgs({})).toBeNull()
    expect(parseSuggestActionsArgs({ actions: 'nope' })).toBeNull()
  })

  it('returns null when no action survives filtering', () => {
    expect(
      parseSuggestActionsArgs({ actions: [{ label: '', url: '' }] }),
    ).toBeNull()
  })

  it('parses a valid gartnerQuadrant alongside actions', () => {
    const actions = [{ label: 'Buy', url: '/buy' }]
    const gartnerQuadrant = {
      imageUrl: 'https://example.com/mq.png',
      url: 'https://example.com/mq',
    }
    expect(parseSuggestActionsArgs({ actions, gartnerQuadrant })).toEqual({
      actions,
      gartnerQuadrant,
    })
  })

  it('returns gartnerQuadrant even when there are no actions', () => {
    const gartnerQuadrant = {
      imageUrl: 'https://example.com/mq.png',
      url: 'https://example.com/mq',
    }
    expect(parseSuggestActionsArgs({ gartnerQuadrant })).toEqual({
      actions: [],
      gartnerQuadrant,
    })
  })

  it('omits gartnerQuadrant when imageUrl or url is missing', () => {
    const actions = [{ label: 'Buy', url: '/buy' }]
    expect(
      parseSuggestActionsArgs({
        actions,
        gartnerQuadrant: { imageUrl: 'https://example.com/mq.png' },
      }),
    ).toEqual({ actions, gartnerQuadrant: undefined })
  })

  it('returns null when neither valid actions nor gartnerQuadrant are present', () => {
    expect(
      parseSuggestActionsArgs({
        actions: [{ label: '', url: '' }],
        gartnerQuadrant: { url: 'https://example.com/mq' },
      }),
    ).toBeNull()
  })
})

describe('suggestActionsToolHandler', () => {
  it('is registered under the suggestActions name', () => {
    expect(suggestActionsToolHandler.name).toBe('suggestActions')
  })

  it('execute appends the actions to the assistant message', async () => {
    const context = {
      assistantMessageId: 'msg-1',
      appendSuggestActions: vi.fn(),
    } as unknown as ToolExecutionContext

    const actions = [{ label: 'Buy', url: '/buy' }]
    await suggestActionsToolHandler.execute({ actions }, context)

    expect(context.appendSuggestActions).toHaveBeenCalledWith(
      'msg-1',
      actions,
      undefined,
    )
  })

  it('execute forwards the gartnerQuadrant to the assistant message', async () => {
    const context = {
      assistantMessageId: 'msg-1',
      appendSuggestActions: vi.fn(),
    } as unknown as ToolExecutionContext

    const actions = [{ label: 'Buy', url: '/buy' }]
    const gartnerQuadrant = {
      imageUrl: 'https://example.com/mq.png',
      url: 'https://example.com/mq',
    }
    await suggestActionsToolHandler.execute(
      { actions, gartnerQuadrant },
      context,
    )

    expect(context.appendSuggestActions).toHaveBeenCalledWith(
      'msg-1',
      actions,
      gartnerQuadrant,
    )
  })
})
