import { describe, it, expect, vi } from 'vitest'

import { parseAgentStreamResponse } from '@/features/aiAssistant/streaming/agentStreamParser'

// parseAgentStreamResponse reads an SSE stream chunk by chunk,
// accumulating text deltas, tool calls, messageId, and suggestions.

/**
 * Helper: creates a fake ReadableStreamDefaultReader from an array of strings.
 * Each string simulates a chunk of data arriving from the network.
 */
const createMockByteReader = (
  chunks: Uint8Array[],
): ReadableStreamDefaultReader<Uint8Array> => {
  let index = 0

  return {
    read: vi.fn(async () => {
      if (index >= chunks.length) {
        return { done: true, value: undefined } as ReadableStreamReadDoneResult<Uint8Array>
      }
      const chunk = chunks[index]
      index++
      return {
        done: false,
        value: chunk,
      } as ReadableStreamReadResult<Uint8Array>
    }),
    releaseLock: vi.fn(),
    cancel: vi.fn(),
    closed: Promise.resolve(undefined),
  } as unknown as ReadableStreamDefaultReader<Uint8Array>
}

const createMockReader = (
  chunks: string[],
): ReadableStreamDefaultReader<Uint8Array> => {
  const encoder = new TextEncoder()
  return createMockByteReader(chunks.map((chunk) => encoder.encode(chunk)))
}

describe('parseAgentStreamResponse', () => {
  describe('text-delta events', () => {
    it('accumulates text from text-delta events', async () => {
      const reader = createMockReader([
        'data: {"type":"text-delta","delta":"Hello "}\n',
        'data: {"type":"text-delta","delta":"world"}\n',
        'data: [DONE]\n',
      ])

      const onTextDelta = vi.fn()
      const result = await parseAgentStreamResponse(reader, onTextDelta)

      expect(result.textContent).toBe('Hello world')
    })

    it('calls onTextDelta for each text-delta event', async () => {
      const reader = createMockReader([
        'data: {"type":"text-delta","delta":"Hello "}\n',
        'data: {"type":"text-delta","delta":"world"}\n',
        'data: [DONE]\n',
      ])

      const onTextDelta = vi.fn()
      await parseAgentStreamResponse(reader, onTextDelta)

      expect(onTextDelta).toHaveBeenCalledTimes(2)
      expect(onTextDelta).toHaveBeenCalledWith('Hello ')
      expect(onTextDelta).toHaveBeenCalledWith('world')
    })
  })

  describe('tool call events', () => {
    it('parses tool-input-start → tool-input-delta → tool-input-available into a ToolCall', async () => {
      const reader = createMockReader([
        'data: {"type":"tool-input-start","toolCallId":"tc_1","toolName":"search"}\n',
        'data: {"type":"tool-input-delta","toolCallId":"tc_1","inputTextDelta":"{\\"query\\":\\"shoes\\"}"}\n',
        'data: {"type":"tool-input-available","toolCallId":"tc_1","toolName":"search","input":{"query":"shoes"}}\n',
        'data: [DONE]\n',
      ])

      const onTextDelta = vi.fn()
      const result = await parseAgentStreamResponse(reader, onTextDelta)

      expect(result.toolCalls).toHaveLength(1)
      expect(result.toolCalls[0]).toEqual({
        id: 'tc_1',
        name: 'search',
        args: { query: 'shoes' },
      })
    })

    it('calls onToolInputDelta with accumulated buffer', async () => {
      const reader = createMockReader([
        'data: {"type":"tool-input-start","toolCallId":"tc_1","toolName":"search"}\n',
        'data: {"type":"tool-input-delta","toolCallId":"tc_1","inputTextDelta":"part1"}\n',
        'data: {"type":"tool-input-delta","toolCallId":"tc_1","inputTextDelta":"part2"}\n',
        'data: [DONE]\n',
      ])

      const onTextDelta = vi.fn()
      const onToolInputDelta = vi.fn()
      await parseAgentStreamResponse(reader, onTextDelta, onToolInputDelta)

      expect(onToolInputDelta).toHaveBeenCalledTimes(2)
      expect(onToolInputDelta).toHaveBeenCalledWith(
        'tc_1',
        'search',
        'part1',
        'part1',
      )
      expect(onToolInputDelta).toHaveBeenCalledWith(
        'tc_1',
        'search',
        'part2',
        'part1part2',
      )
    })
  })

  describe('messageId', () => {
    it('captures messageId from start event', async () => {
      const reader = createMockReader([
        'data: {"type":"start","messageId":"msg_abc123"}\n',
        'data: [DONE]\n',
      ])

      const onTextDelta = vi.fn()
      const result = await parseAgentStreamResponse(reader, onTextDelta)

      expect(result.messageId).toBe('msg_abc123')
    })

    it('returns null messageId when no start event', async () => {
      const reader = createMockReader([
        'data: {"type":"text-delta","delta":"hi"}\n',
        'data: [DONE]\n',
      ])

      const onTextDelta = vi.fn()
      const result = await parseAgentStreamResponse(reader, onTextDelta)

      expect(result.messageId).toBeNull()
    })
  })

  describe('suggestions', () => {
    it('captures suggestions from data-suggestions event', async () => {
      const reader = createMockReader([
        'data: {"type":"data-suggestions","data":{"suggestions":["try shoes","try boots"]}}\n',
        'data: [DONE]\n',
      ])

      const onTextDelta = vi.fn()
      const result = await parseAgentStreamResponse(reader, onTextDelta)

      expect(result.suggestions).toEqual(['try shoes', 'try boots'])
    })

    it('returns empty suggestions when no data-suggestions event', async () => {
      const reader = createMockReader([
        'data: {"type":"text-delta","delta":"hi"}\n',
        'data: [DONE]\n',
      ])

      const onTextDelta = vi.fn()
      const result = await parseAgentStreamResponse(reader, onTextDelta)

      expect(result.suggestions).toEqual([])
    })
  })

  describe('[DONE] signal', () => {
    it('returns accumulated result on [DONE]', async () => {
      const reader = createMockReader([
        'data: {"type":"start","messageId":"msg_1"}\n',
        'data: {"type":"text-delta","delta":"Hello"}\n',
        'data: {"type":"data-suggestions","data":{"suggestions":["a","b"]}}\n',
        'data: [DONE]\n',
      ])

      const onTextDelta = vi.fn()
      const result = await parseAgentStreamResponse(reader, onTextDelta)

      expect(result).toEqual({
        textContent: 'Hello',
        toolCalls: [],
        messageId: 'msg_1',
        suggestions: ['a', 'b'],
      })
    })
  })

  describe('chunked data', () => {
    it('handles chunks split in the middle of a line', async () => {
      const reader = createMockReader([
        'data: {"type":"text-del',
        'ta","delta":"Hello"}\n',
        'data: [DONE]\n',
      ])

      const onTextDelta = vi.fn()
      const result = await parseAgentStreamResponse(reader, onTextDelta)

      expect(result.textContent).toBe('Hello')
    })

    it('handles multiple events in a single chunk', async () => {
      const reader = createMockReader([
        'data: {"type":"text-delta","delta":"A"}\ndata: {"type":"text-delta","delta":"B"}\n',
        'data: [DONE]\n',
      ])

      const onTextDelta = vi.fn()
      const result = await parseAgentStreamResponse(reader, onTextDelta)

      expect(result.textContent).toBe('AB')
    })
  })

  describe('non-JSON lines', () => {
    it('ignores lines that are not valid JSON', async () => {
      const reader = createMockReader([
        'data: not-json-at-all\n',
        'data: {"type":"text-delta","delta":"OK"}\n',
        'data: [DONE]\n',
      ])

      const onTextDelta = vi.fn()
      const result = await parseAgentStreamResponse(reader, onTextDelta)

      expect(result.textContent).toBe('OK')
    })
  })

  describe('stream end without [DONE]', () => {
    it('returns accumulated result when stream ends without [DONE]', async () => {
      const reader = createMockReader([
        'data: {"type":"text-delta","delta":"partial"}\n',
      ])

      const onTextDelta = vi.fn()
      const result = await parseAgentStreamResponse(reader, onTextDelta)

      expect(result.textContent).toBe('partial')
      expect(result.toolCalls).toEqual([])
    })

    it('processes a final line that has no trailing newline', async () => {
      const reader = createMockReader([
        'data: {"type":"text-delta","delta":"first"}\n',
        'data: {"type":"text-delta","delta":"last"}',
      ])

      const result = await parseAgentStreamResponse(reader, vi.fn())

      expect(result.textContent).toBe('firstlast')
    })

    it('keeps a tool call announced on the unterminated final line', async () => {
      const reader = createMockReader([
        'data: {"type":"tool-input-available","toolCallId":"tc_1","toolName":"search","input":{"query":"shoes"}}',
      ])

      const result = await parseAgentStreamResponse(reader, vi.fn())

      expect(result.toolCalls).toEqual([
        { id: 'tc_1', name: 'search', args: { query: 'shoes' } },
      ])
    })
  })

  describe('multi-byte characters', () => {
    it('recovers a multi-byte character split across the final chunk', async () => {
      const payload = 'data: {"type":"text-delta","delta":"café"}'
      const encoder = new TextEncoder()
      const encoded = encoder.encode(payload)
      // 'é' is two UTF-8 bytes. Split between them so the first chunk ends on a
      // lone lead byte, which the decoder holds back until it is flushed.
      const splitAt =
        encoder.encode(payload.slice(0, payload.indexOf('é'))).length + 1

      const reader = createMockByteReader([
        encoded.slice(0, splitAt),
        encoded.slice(splitAt),
      ])

      const result = await parseAgentStreamResponse(reader, vi.fn())

      expect(result.textContent).toBe('café')
    })
  })

  it('releases the reader lock', async () => {
    const reader = createMockReader(['data: [DONE]\n'])

    await parseAgentStreamResponse(reader, vi.fn())

    expect(reader.releaseLock).toHaveBeenCalled()
  })
})
