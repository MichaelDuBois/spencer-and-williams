import { atomWithStorage } from 'jotai/utils'

import { createSessionJSONStorage } from '@/stores/sessionJSONStorage'
import { DAY_MS } from '@/utilities/orderStatus'

export interface MediaListEntry {
  objectID: string
  /** Sort key — the list renders most-recently-added first. */
  addedAt: number
}

export interface MediaProgressEntry extends MediaListEntry {
  /** Fraction watched, 0-1. Drives the progress bar's width. */
  progress: number
}

/** One viewer's saved titles and part-watched titles. */
export interface MediaWatchState {
  myList: MediaListEntry[]
  continueWatching: MediaProgressEntry[]
}

/**
 * The bucket a viewer with no persona writes to — the same "anonymous" mode every
 * other vertical already has, not a profile of its own.
 */
export const ANONYMOUS_PROFILE_KEY = 'anonymous'

/**
 * Realtime personalization runs with no persona, so it would otherwise land in the
 * anonymous bucket and share both rails with it. It gets its own key instead: the
 * whole point of the mode is a profile built from this session's clicking.
 */
export const REALTIME_PROFILE_KEY = 'realtime'

/**
 * One bucket per persona id, plus REALTIME_PROFILE_KEY and ANONYMOUS_PROFILE_KEY
 * for the two modes that run without one.
 */
export type MediaWatchStateMap = Record<string, MediaWatchState>

export interface MediaProgressSeed {
  objectID: string
  progress: number
}

/** What config declares: objectIDs only, so a reindex cannot strand a record. */
export interface MediaWatchSeeds {
  myList?: string[]
  continueWatching?: MediaProgressSeed[]
}

export type MediaWatchSeedMap = Record<string, MediaWatchSeeds>

/** A factory, not a shared constant — callers spread and mutate their copy. */
export const createEmptyWatchState = (): MediaWatchState => {
  return { myList: [], continueWatching: [] }
}

const getStorageKey = (vertical: string) =>
  `spencer-williams-${vertical}-watch-state`

// Seeds are spaced a day apart, newest first, so a seeded list arrives already
// in the order the rails sort by rather than tying at a single timestamp.
const getSeedTimestamp = (now: number, index: number): number =>
  now - index * DAY_MS

export const expandWatchStateSeeds = (
  seeds: MediaWatchSeedMap,
  now: number = Date.now(),
): MediaWatchStateMap =>
  Object.fromEntries(
    Object.entries(seeds).map(([personaKey, personaSeeds]) => [
      personaKey,
      {
        myList: (personaSeeds.myList ?? []).map((objectID, index) => {
          return { objectID, addedAt: getSeedTimestamp(now, index) }
        }),
        continueWatching: (personaSeeds.continueWatching ?? []).map(
          (seed, index) => {
            return { ...seed, addedAt: getSeedTimestamp(now, index) }
          },
        ),
      },
    ]),
  )

const watchStateStorage = createSessionJSONStorage<MediaWatchStateMap>()

// Same one-shot write as `orderHistory`: puts the expanded seeds in
// sessionStorage without clobbering what a previous call — or the viewer's own
// clicking — already put there, so the seeds are inspectable in DevTools even on
// a page where nothing has been added. A plain storage write, not React state:
// `react-hooks/set-state-in-effect` forbids seeding from an effect. No-op during
// SSR, where sessionStorage does not exist.
const persistSeedMap = (vertical: string, map: MediaWatchStateMap): void => {
  if (typeof window === 'undefined') return

  const key = getStorageKey(vertical)
  if (sessionStorage.getItem(key) !== null) return

  sessionStorage.setItem(key, JSON.stringify(map))
}

const watchStateAtomCache = new Map<
  string,
  ReturnType<typeof atomWithStorage<MediaWatchStateMap>>
>()

/**
 * Cached per vertical, so `seeds` only takes effect on the first call for a given
 * vertical — one config per vertical makes that unambiguous.
 *
 * sessionStorage rather than localStorage, matching `cart` and `orderHistory`:
 * the state survives a reload, which is the point of the demo, but a new tab
 * starts from the seeds instead of inheriting yesterday's clicking.
 */
export const getMediaWatchStateAtom = (
  vertical: string,
  seeds: MediaWatchSeedMap = {},
) => {
  if (!watchStateAtomCache.has(vertical)) {
    // Expanded once and shared between the storage seed and the atom's initial
    // value, so the two agree on timestamps and we don't read the clock twice.
    const seedMap = expandWatchStateSeeds(seeds)
    persistSeedMap(vertical, seedMap)
    watchStateAtomCache.set(
      vertical,
      atomWithStorage<MediaWatchStateMap>(
        getStorageKey(vertical),
        seedMap,
        watchStateStorage,
        { getOnInit: true },
      ),
    )
  }

  return watchStateAtomCache.get(vertical)!
}
