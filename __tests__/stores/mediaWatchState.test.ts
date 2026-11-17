import { describe, expect, it } from 'vitest'

import {
  createEmptyWatchState,
  expandWatchStateSeeds,
  getMediaWatchStateAtom,
  type MediaWatchSeedMap,
} from '@/stores/mediaWatchState'

import { createTestStore } from '@tests/helpers/jotai-wrapper'

const DAY_MS = 24 * 60 * 60 * 1000

const SEEDS: MediaWatchSeedMap = {
  'marvel-fan': {
    myList: ['movie_1', 'movie_2'],
    continueWatching: [{ objectID: 'movie_3', progress: 0.4 }],
  },
  'kids-family': {
    continueWatching: [{ objectID: 'movie_4', progress: 0.9 }],
  },
}

const NOW = 1_700_000_000_000

describe('expandWatchStateSeeds', () => {
  it('keys one bucket per persona and keeps the declared progress', () => {
    const expanded = expandWatchStateSeeds(SEEDS, NOW)

    expect(Object.keys(expanded)).toEqual(['marvel-fan', 'kids-family'])
    expect(expanded['marvel-fan'].continueWatching).toEqual([
      { objectID: 'movie_3', addedAt: NOW, progress: 0.4 },
    ])
  })

  it('stamps seeds a day apart, newest first, so the rails have an order', () => {
    const { myList } = expandWatchStateSeeds(SEEDS, NOW)['marvel-fan']

    expect(myList).toEqual([
      { objectID: 'movie_1', addedAt: NOW },
      { objectID: 'movie_2', addedAt: NOW - DAY_MS },
    ])
  })

  it('fills in the list a bucket does not declare', () => {
    const expanded = expandWatchStateSeeds(SEEDS, NOW)

    expect(expanded['kids-family'].myList).toEqual([])
  })

  it('expands an empty seed map to an empty state map', () => {
    expect(expandWatchStateSeeds({}, NOW)).toEqual({})
  })
})

describe('createEmptyWatchState', () => {
  it('returns a fresh object each call, so callers cannot share one', () => {
    const first = createEmptyWatchState()
    first.myList.push({ objectID: 'movie_1', addedAt: NOW })

    expect(createEmptyWatchState().myList).toEqual([])
  })
})

describe('getMediaWatchStateAtom', () => {
  it('starts from the expanded seeds', () => {
    sessionStorage.clear()
    const store = createTestStore()

    const state = store.get(getMediaWatchStateAtom('seeded-vertical', SEEDS))

    expect(state['marvel-fan'].myList.map((entry) => entry.objectID)).toEqual([
      'movie_1',
      'movie_2',
    ])
  })

  it('has no bucket for a profile the seeds do not name', () => {
    sessionStorage.clear()
    const store = createTestStore()

    const state = store.get(getMediaWatchStateAtom('anonymous-vertical', SEEDS))

    expect(state.anonymous).toBeUndefined()
  })

  it('writes the seeds to sessionStorage, so they are inspectable', () => {
    sessionStorage.clear()
    const store = createTestStore()

    store.get(getMediaWatchStateAtom('persisted-vertical', SEEDS))

    const raw = sessionStorage.getItem(
      'spencer-williams-persisted-vertical-watch-state',
    )
    expect(JSON.parse(raw!)['marvel-fan'].continueWatching).toHaveLength(1)
  })

  it('returns the same atom per vertical, so later seeds cannot re-seed it', () => {
    sessionStorage.clear()
    const first = getMediaWatchStateAtom('cached-vertical', SEEDS)
    const second = getMediaWatchStateAtom('cached-vertical', {
      other: { myList: ['movie_9'] },
    })

    expect(second).toBe(first)
  })

  it('leaves an existing session payload alone rather than re-seeding over it', () => {
    sessionStorage.clear()
    const key = 'spencer-williams-resumed-vertical-watch-state'
    const saved = {
      anonymous: { myList: [{ objectID: 'movie_saved', addedAt: NOW }], continueWatching: [] },
    }
    sessionStorage.setItem(key, JSON.stringify(saved))

    const store = createTestStore()
    const state = store.get(getMediaWatchStateAtom('resumed-vertical', SEEDS))

    expect(state).toEqual(saved)
    expect(JSON.parse(sessionStorage.getItem(key)!)).toEqual(saved)
  })
})
