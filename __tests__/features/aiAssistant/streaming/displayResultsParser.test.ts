import { describe, expect, it } from 'vitest'

import { extractDisplayResultsStream } from '@/features/aiAssistant/tools/parsing/displayResultsParser'

describe('extractDisplayResultsStream', () => {
  it('extracts the intro from the buffer', () => {
    const result = extractDisplayResultsStream(
      '{"intro":"Here are some picks","groups":[]}',
    )
    expect(result.intro).toBe('Here are some picks')
    expect(result.groups).toEqual([])
  })

  it('extracts a fully streamed group with its products', () => {
    const buffer =
      '{"intro":"x","groups":[{"title":"Shoes","products":[{"objectID":"p1"}]}]}'
    const result = extractDisplayResultsStream(buffer)
    expect(result.groups).toHaveLength(1)
    expect(result.groups[0].title).toBe('Shoes')
    expect(result.groups[0].products).toEqual([{ objectID: 'p1' }])
    expect(result.streamingGroup).toBeNull()
  })

  it('exposes the in-progress group as streamingGroup with its title', () => {
    const buffer = '{"groups":[{"title":"Boots","products":['
    const result = extractDisplayResultsStream(buffer)
    expect(result.groups).toEqual([])
    expect(result.streamingGroup?.title).toBe('Boots')
    expect(result.streamingGroup?.products).toEqual([])
  })

  it('marks a streaming group incomplete while its products array is open', () => {
    const buffer =
      '{"groups":[{"title":"Boots","products":[{"objectID":"p1"},{"objectID":"p2"}'
    const result = extractDisplayResultsStream(buffer)
    expect(result.streamingGroup?.products).toHaveLength(2)
    expect(result.streamingGroup?.itemsComplete).toBe(false)
  })

  it('marks a streaming group complete once its products array is closed', () => {
    // Array closed with `]`, but the group object `}` has not arrived yet.
    const buffer =
      '{"groups":[{"title":"Boots","products":[{"objectID":"p1"},{"objectID":"p2"}],"why":"'
    const result = extractDisplayResultsStream(buffer)
    expect(result.streamingGroup?.products).toHaveLength(2)
    expect(result.streamingGroup?.itemsComplete).toBe(true)
  })

  it('extracts a partial intro before its closing quote arrives', () => {
    const result = extractDisplayResultsStream('{"intro":"Men\'s sneakers un')
    expect(result.intro).toBe("Men's sneakers un")
  })

  it('unescapes newlines in the streaming intro field', () => {
    const result = extractDisplayResultsStream('{"intro":"Line1\\nLine2')
    expect(result.intro).toBe('Line1\nLine2')
  })

  it('returns empty groups when no "groups" key is present', () => {
    const result = extractDisplayResultsStream('{"intro":"only intro"}')
    expect(result.intro).toBe('only intro')
    expect(result.groups).toEqual([])
    expect(result.streamingGroup).toBeNull()
  })

  it('skips invalid groups and groups failing validation', () => {
    const buffer =
      '{"groups":[{"title":"NoProducts"},{"title":"Bad",},{"title":"Ok","products":[{"objectID":"p1"}]}]}'
    const result = extractDisplayResultsStream(buffer)
    expect(result.groups.map((g) => g.title)).toEqual(['Ok'])
  })

  it('skips a completed group whose products array is empty', () => {
    const buffer =
      '{"groups":[{"title":"Empty","products":[]},{"title":"Ok","products":[{"objectID":"p1"}]}]}'
    const result = extractDisplayResultsStream(buffer)
    expect(result.groups.map((g) => g.title)).toEqual(['Ok'])
  })

  it('unescapes newlines in the streaming answer field', () => {
    const result = extractDisplayResultsStream('{"answer":"Line1\\nLine2"}')
    expect(result.answer).toBe('Line1\nLine2')
  })

  it('keeps a streaming title containing escaped quotes intact', () => {
    const buffer =
      '{"groups":[{"title":"The \\"Best\\" Boots","products":[{"objectID":"p1"}'
    const result = extractDisplayResultsStream(buffer)
    expect(result.streamingGroup?.title).toBe('The "Best" Boots')
  })

  it('keeps a streaming why containing escaped quotes intact', () => {
    const buffer =
      '{"groups":[{"title":"Boots","why":"Rated \\"top pick\\" by editors","products":['
    const result = extractDisplayResultsStream(buffer)
    expect(result.streamingGroup?.why).toBe('Rated "top pick" by editors')
  })

  it('unescapes tabs, carriage returns and solidus in the streaming answer', () => {
    const result = extractDisplayResultsStream(
      '{"answer":"a\\tb\\rc\\/d\\\\e"}',
    )
    expect(result.answer).toBe('a\tb\rc/d\\e')
  })

  it('unescapes unicode escapes in the streaming answer', () => {
    const result = extractDisplayResultsStream('{"answer":"caf\\u00e9"}')
    expect(result.answer).toBe('café')
  })

  it('leaves a half-streamed unicode escape untouched', () => {
    const result = extractDisplayResultsStream('{"answer":"caf\\u00')
    expect(result.answer).toBe('caf\\u00')
  })
})
