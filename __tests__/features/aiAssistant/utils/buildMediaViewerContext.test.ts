import { describe, expect, it } from 'vitest'

import { buildMediaViewerContext } from '@/features/aiAssistant/utils/buildMediaViewerContext'
import type { BuildMediaViewerContextArgs } from '@/features/aiAssistant/utils/buildMediaViewerContext'
import type { Persona } from '@/types'

const persona = {
  id: 'marvel-fan',
  label: 'Ava',
  description: 'watches everything with a cape in it',
  affinities: { genres: ['Action', 'Science Fiction'], keywords: [] },
} as unknown as Persona

const buildArgs = (
  overrides: Partial<BuildMediaViewerContextArgs> = {},
): BuildMediaViewerContextArgs => {
  return {
    mode: 'anonymous',
    persona: null,
    myList: [],
    continueWatching: [],
    isRestrictedProfile: false,
    ...overrides,
  }
}

describe('buildMediaViewerContext', () => {
  it('returns null when there is nothing to say', () => {
    expect(buildMediaViewerContext(buildArgs())).toBeNull()
  })

  it('names the profile and its taste in persona mode', () => {
    const context = buildMediaViewerContext(
      buildArgs({ mode: 'persona', persona }),
    )

    expect(context).toContain('[Context:')
    expect(context).toContain('"Ava"')
    expect(context).toContain('watches everything with a cape in it')
    expect(context).toContain('genres: Action, Science Fiction')
  })

  it('omits empty affinity groups', () => {
    const context = buildMediaViewerContext(
      buildArgs({ mode: 'persona', persona }),
    )

    expect(context).not.toContain('keywords')
  })

  it('says taste is being learned in realtime mode', () => {
    const context = buildMediaViewerContext(buildArgs({ mode: 'realtime' }))

    expect(context).toContain('no saved profile')
  })

  it('ignores the persona when the mode is not persona', () => {
    const context = buildMediaViewerContext(
      buildArgs({ mode: 'anonymous', persona }),
    )

    expect(context).toBeNull()
  })

  it('reports Continue Watching progress as a percentage', () => {
    const context = buildMediaViewerContext(
      buildArgs({
        continueWatching: [
          { title: 'Chernobyl', releaseYear: '2019', progress: 0.45 },
        ],
      }),
    )

    expect(context).toContain('Chernobyl (2019) — 45% watched')
  })

  it('lists My List titles and tells the agent not to repeat them', () => {
    const context = buildMediaViewerContext(
      buildArgs({ myList: [{ title: 'Fargo', releaseYear: '1996' }] }),
    )

    expect(context).toContain('Fargo (1996)')
    expect(context).toContain('Do not recommend these again')
  })

  it('names a title without its year when the year is missing', () => {
    const context = buildMediaViewerContext(
      buildArgs({ myList: [{ title: 'Fargo' }] }),
    )

    expect(context).toContain('Fargo.')
    expect(context).not.toContain('Fargo (')
  })

  // The lists grow as the viewer clicks, and they share a budget with the
  // conversation itself.
  it('caps each list so a long watchlist cannot crowd out the question', () => {
    const myList = Array.from({ length: 30 }, (_, index) => {return {
      title: `Title ${index + 1}`,
    }})

    const context = buildMediaViewerContext(buildArgs({ myList })) ?? ''

    expect(context).toContain('Title 12')
    expect(context).not.toContain('Title 13')
  })

  it('states the kids constraint without offering to refuse', () => {
    const context = buildMediaViewerContext(
      buildArgs({ isRestrictedProfile: true }),
    )

    expect(context).toContain('kids profile')
    expect(context).toContain('never say you are unable to help')
  })
})
