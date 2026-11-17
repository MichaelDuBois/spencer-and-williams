import { describe, expect, it } from 'vitest'

import {
  getOrderedSpeakerNames,
  getTranscriptTurns,
} from '@/app/travel/podcast/[id]/_utils/transcriptHelpers'

describe('getTranscriptTurns', () => {
  it('tags turns by speaker role using the hosts list', () => {
    const turns = getTranscriptTurns({
      transcript: [
        { speaker: 'Ada Lovelace', text: 'Welcome' },
        { speaker: 'Guest One', text: 'Thanks' },
      ],
      hosts: ['Ada Lovelace'],
    })
    expect(turns.map((t) => t.role)).toEqual(['host', 'guest'])
  })

  it('matches host names case- and whitespace-insensitively', () => {
    const turns = getTranscriptTurns({
      transcript: [{ speaker: '  ADA   lovelace ', text: 'Hi' }],
      hosts: ['Ada Lovelace'],
    })
    expect(turns[0].role).toBe('host')
  })

  it('returns an empty array when there is no transcript', () => {
    expect(getTranscriptTurns({ transcript: undefined, hosts: [] })).toEqual([])
  })
})

describe('getOrderedSpeakerNames', () => {
  it('lists hosts before guests', () => {
    expect(
      getOrderedSpeakerNames({ hosts: ['Ada'], guests: ['Linus'] }),
    ).toEqual(['Ada', 'Linus'])
  })

  it('dedupes by normalized name and drops empties', () => {
    expect(
      getOrderedSpeakerNames({
        hosts: ['Ada', ''],
        guests: ['ada', 'Linus'],
      }),
    ).toEqual(['Ada', 'Linus'])
  })
})
