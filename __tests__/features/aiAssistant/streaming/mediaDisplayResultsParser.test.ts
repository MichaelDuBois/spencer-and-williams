import { describe, expect, it } from 'vitest'

import { extractMediaDisplayResultsStream } from '@/features/aiAssistant/tools/parsing/mediaDisplayResultsParser'

describe('extractMediaDisplayResultsStream', () => {
  it('extracts the intro ahead of any group', () => {
    const result = extractMediaDisplayResultsStream(
      '{"intro":"Three smart comedies","groups":[]}',
    )

    expect(result.intro).toBe('Three smart comedies')
    expect(result.groups).toEqual([])
  })

  it('extracts a fully streamed group with its titles', () => {
    const buffer =
      '{"intro":"x","groups":[{"type":"movie","title":"Smart comedies","items":[{"objectID":"movie_1","why":"Deadpan"}]}]}'
    const result = extractMediaDisplayResultsStream(buffer)

    expect(result.groups).toHaveLength(1)
    expect(result.groups[0].title).toBe('Smart comedies')
    expect(result.groups[0].items).toEqual([
      { objectID: 'movie_1', why: 'Deadpan' },
    ])
    expect(result.streamingGroup).toBeNull()
  })

  it('exposes the in-progress group while its items array is open', () => {
    const buffer =
      '{"groups":[{"type":"show","title":"Short series","items":[{"objectID":"show_1"}'
    const result = extractMediaDisplayResultsStream(buffer)

    expect(result.groups).toEqual([])
    expect(result.streamingGroup?.title).toBe('Short series')
    expect(result.streamingGroup?.items).toHaveLength(1)
    expect(result.streamingGroup?.itemsComplete).toBe(false)
  })

  // 'movie' and 'show' are what `record_type` holds.
  it('recognises both media content types', () => {
    for (const type of ['movie', 'show']) {
      const result = extractMediaDisplayResultsStream(
        `{"groups":[{"type":"${type}","title":"T","items":[{"objectID":"1"}]}]}`,
      )

      expect(result.groups[0].type).toBe(type)
    }
  })

  it('drops a group that streamed no titles', () => {
    const result = extractMediaDisplayResultsStream(
      '{"groups":[{"type":"movie","title":"Empty","items":[]}]}',
    )

    expect(result.groups).toEqual([])
  })
})
