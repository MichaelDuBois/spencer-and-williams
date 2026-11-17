import { beforeEach, describe, expect, it, vi } from 'vitest'

import { searchToolHandler } from '@/features/aiAssistant/tools/searchTool'
import type {
  ToolCall,
  ToolExecutionContext,
} from '@/features/aiAssistant/types'

describe('searchToolHandler.parseArgs', () => {
  it('reads queries from the "suggestions" key', () => {
    const queries = [{ query: 'shoes' }]
    expect(searchToolHandler.parseArgs({ suggestions: queries })).toEqual(
      queries,
    )
  })

  it('reads queries from the "queries" alias', () => {
    const queries = [{ query: 'boots' }]
    expect(searchToolHandler.parseArgs({ queries })).toEqual(queries)
  })

  it('returns null when neither key holds an array', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(searchToolHandler.parseArgs({})).toBeNull()
    expect(searchToolHandler.parseArgs({ suggestions: 'nope' })).toBeNull()
    vi.restoreAllMocks()
  })

  it('is registered under the search name', () => {
    expect(searchToolHandler.name).toBe('search')
  })
})

type FollowUpResult = { toolCalls: ToolCall[]; suggestions: string[] }

const buildContext = (
  followUp: FollowUpResult,
  opts: {
    summaries?: Array<{ objectID: string; [key: string]: unknown }>
    shownObjectIDs?: string[]
  } = {},
) =>
  ({
    assistantMessageId: 'msg-1',
    vertical: 'ecommerce',
    shownObjectIDs: opts.shownObjectIDs ?? [],
    appendDisplayResults: vi.fn(),
    appendNoResultsMessage: vi.fn(),
    appendSuggestActions: vi.fn(),
    setStreamingDisplay: vi.fn(),
    executeSearch: vi
      .fn()
      .mockResolvedValue({ summaries: opts.summaries ?? [] }),
    sendFollowUp: vi.fn().mockResolvedValue(followUp),
  }) as unknown as ToolExecutionContext

const toolCall = (name: string, args: Record<string, unknown>): ToolCall =>
  ({ id: 't1', name, args }) as ToolCall

describe('searchToolHandler.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('opens then clears the streaming display around the search', async () => {
    const context = buildContext({ toolCalls: [], suggestions: [] })

    await searchToolHandler.execute([{ query: 'shoes' }], context)

    expect(context.setStreamingDisplay).toHaveBeenCalledTimes(2)
    expect(context.setStreamingDisplay).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ isStreaming: true }),
    )
    expect(context.setStreamingDisplay).toHaveBeenLastCalledWith(null)
  })

  it('appends display results with the executed queries when items are valid', async () => {
    const context = buildContext({
      toolCalls: [
        toolCall('displayResults', {
          intro: '',
          groups: [
            { title: 'Shoes', why: '', products: [{ objectID: 'p1' }] },
            { title: 'Boots', why: '', products: [{ objectID: 'p2' }] },
          ],
        }),
      ],
      suggestions: ['next'],
    })

    const result = await searchToolHandler.execute(
      [{ query: 'shoes' }, { query: 'boots' }],
      context,
    )

    expect(context.appendDisplayResults).toHaveBeenCalledWith('msg-1', {
      intro: '',
      groups: [
        { title: 'Shoes', why: '', products: [{ objectID: 'p1' }] },
        { title: 'Boots', why: '', products: [{ objectID: 'p2' }] },
      ],
      queries: ['shoes', 'boots'],
    })
    expect(result).toEqual({ suggestions: ['next'] })
  })

  it('keeps queries aligned when empty display groups are removed', async () => {
    const context = buildContext({
      toolCalls: [
        toolCall('displayResults', {
          intro: '',
          groups: [
            { title: 'Running shoes', why: '', products: [] },
            {
              title: 'Hiking boots',
              why: '',
              products: [{ objectID: 'p1' }],
            },
          ],
        }),
      ],
      suggestions: [],
    })

    await searchToolHandler.execute(
      [{ query: 'running shoes' }, { query: 'hiking boots' }],
      context,
    )

    expect(context.appendDisplayResults).toHaveBeenCalledWith('msg-1', {
      intro: '',
      groups: [
        {
          title: 'Hiking boots',
          why: '',
          products: [{ objectID: 'p1' }],
        },
      ],
      queries: ['hiking boots'],
    })
  })

  it('attaches the search attribution to the displayed products', async () => {
    const context = buildContext(
      {
        toolCalls: [
          toolCall('displayResults', {
            intro: '',
            groups: [
              {
                title: 'Shoes',
                why: '',
                products: [{ objectID: 'p1', why: 'Best' }],
              },
            ],
          }),
        ],
        suggestions: [],
      },
      {
        summaries: [
          { objectID: 'p1', name: 'Trail Runner', price: 89, queryID: 'q1', position: 3 },
        ],
      },
    )

    await searchToolHandler.execute([{ query: 'shoes' }], context)

    expect(context.appendDisplayResults).toHaveBeenCalledWith('msg-1', {
      intro: '',
      groups: [
        {
          title: 'Shoes',
          why: '',
          products: [
            { objectID: 'p1', why: 'Best', queryID: 'q1', position: 3 },
          ],
        },
      ],
      queries: ['shoes'],
    })
  })

  it('appends a no-results message when displayResults has no items', async () => {
    const context = buildContext({
      toolCalls: [
        toolCall('displayResults', { intro: '', groups: [] }),
      ],
      suggestions: [],
    })

    await searchToolHandler.execute([{ query: 'shoes' }], context)

    expect(context.appendNoResultsMessage).toHaveBeenCalledWith('msg-1')
    expect(context.appendDisplayResults).not.toHaveBeenCalled()
  })

  it('forwards parsed actions from a suggestActions tool call', async () => {
    const context = buildContext({
      toolCalls: [
        toolCall('suggestActions', {
          actions: [{ label: 'Buy', url: '/buy' }],
        }),
      ],
      suggestions: [],
    })

    await searchToolHandler.execute([{ query: 'shoes' }], context)

    expect(context.appendSuggestActions).toHaveBeenCalledWith(
      'msg-1',
      [{ label: 'Buy', url: '/buy' }],
      undefined,
    )
  })

  it('excludes already-shown items from the pool sent to the agent', async () => {
    const summaries = [
      { objectID: 'p1', name: 'A', price: 1 },
      { objectID: 'p2', name: 'B', price: 2 },
      { objectID: 'p3', name: 'C', price: 3 },
      { objectID: 'p4', name: 'D', price: 4 },
    ]
    const context = buildContext(
      { toolCalls: [], suggestions: [] },
      { summaries, shownObjectIDs: ['p1', 'p2'] },
    )

    await searchToolHandler.execute([{ query: 'dresses' }], context)

    expect(context.sendFollowUp).toHaveBeenCalledWith([
      { objectID: 'p3', name: 'C', price: 3 },
      { objectID: 'p4', name: 'D', price: 4 },
    ])
  })

  it('sends the agent a slim follow-up payload without attribution', async () => {
    const summaries = [
      { objectID: 'p1', name: 'A', price: 1, queryID: 'q1', position: 2 },
      { objectID: 'p2', name: 'B', price: 2, queryID: 'q2', position: 5 },
    ]
    const context = buildContext(
      { toolCalls: [], suggestions: [] },
      { summaries },
    )

    await searchToolHandler.execute([{ query: 'shoes' }], context)

    expect(context.sendFollowUp).toHaveBeenCalledWith([
      { objectID: 'p1', name: 'A', price: 1 },
      { objectID: 'p2', name: 'B', price: 2 },
    ])
  })

  it('keeps the full pool when nothing has been shown', async () => {
    const summaries = [
      { objectID: 'p1', name: 'A', price: 1 },
      { objectID: 'p2', name: 'B', price: 2 },
    ]
    const context = buildContext(
      { toolCalls: [], suggestions: [] },
      { summaries, shownObjectIDs: [] },
    )

    await searchToolHandler.execute([{ query: 'dresses' }], context)

    expect(context.sendFollowUp).toHaveBeenCalledWith(summaries)
  })

  it('falls back to the full pool when every candidate was already shown', async () => {
    const summaries = [
      { objectID: 'p1', name: 'A', price: 1 },
      { objectID: 'p2', name: 'B', price: 2 },
    ]
    const context = buildContext(
      { toolCalls: [], suggestions: [] },
      { summaries, shownObjectIDs: ['p1', 'p2'] },
    )

    await searchToolHandler.execute([{ query: 'dresses' }], context)

    expect(context.sendFollowUp).toHaveBeenCalledWith(summaries)
  })

  it('clears the streaming display and rethrows when the search fails', async () => {
    const context = buildContext({ toolCalls: [], suggestions: [] })
    const failure = new Error('network down')
    vi.mocked(context.executeSearch).mockRejectedValueOnce(failure)

    await expect(
      searchToolHandler.execute([{ query: 'shoes' }], context),
    ).rejects.toThrow('network down')
    expect(context.setStreamingDisplay).toHaveBeenLastCalledWith(null)
  })
})
