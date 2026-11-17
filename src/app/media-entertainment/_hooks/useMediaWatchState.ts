'use client'

import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { useMediaInsightsEvents } from '@/app/media-entertainment/_hooks/useMediaInsightsEvents'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import type { MediaTitleHit } from '@/app/media-entertainment/hitValues.types'
import { mediaTitleRecordsAtom } from '@/stores/mediaEntertainment'
import {
  ANONYMOUS_PROFILE_KEY,
  createEmptyWatchState,
  getMediaWatchStateAtom,
  type MediaProgressEntry,
  type MediaWatchState,
  REALTIME_PROFILE_KEY,
} from '@/stores/mediaWatchState'
import {
  activePersonaAtom,
  personalizationStore,
  realtimePersoEnabledAtom,
} from '@/stores/personalization'

/**
 * Where a title lands the first time Play is pressed. Not 0: a zero-width bar is
 * indistinguishable from no bar, and the point of the button is that pressing it
 * visibly does something.
 */
export const INITIAL_PROGRESS = 0.06

/** How far each subsequent Play advances it, so pressing again also shows. */
export const PROGRESS_STEP = 0.17

/** Never 1 — a finished title would drop out of Continue Watching entirely. */
export const MAX_PROGRESS = 0.94

const { slug } = mediaEntertainmentConfig

/** Most-recently-touched first, which is the order both rails render in. */
const byNewestFirst = <T extends { addedAt: number }>(entries: T[]): T[] =>
  [...entries].sort((a, b) => b.addedAt - a.addedAt)

export const advanceProgress = (current: number | undefined): number =>
  Math.min(
    current === undefined ? INITIAL_PROGRESS : current + PROGRESS_STEP,
    MAX_PROGRESS,
  )

/**
 * My List and Continue Watching for the active profile.
 *
 * Every mutation is a synchronous atom write, so a toggle paints on the click with
 * no request and no spinner. The persisted state holds objectIDs and progress
 * only; the hit values that let a rail paint immediately go into the in-memory
 * `mediaTitleRecordsAtom` alongside it.
 */
export const useMediaWatchState = () => {
  const [stateMap, setStateMap] = useAtom(
    getMediaWatchStateAtom(slug, mediaEntertainmentConfig.watchStateSeeds),
  )
  const persona = useAtomValue(activePersonaAtom, {
    store: personalizationStore,
  })
  const realtimeEnabled = useAtomValue(realtimePersoEnabledAtom, {
    store: personalizationStore,
  })
  const rememberRecords = useSetAtom(mediaTitleRecordsAtom)
  const { sendAddToListEvent, sendPlayEvent } = useMediaInsightsEvents()

  const profileKey =
    persona?.id ??
    (realtimeEnabled ? REALTIME_PROFILE_KEY : ANONYMOUS_PROFILE_KEY)
  const profileState = stateMap[profileKey]

  const myList = useMemo(
    () => byNewestFirst(profileState?.myList ?? []),
    [profileState],
  )

  const continueWatching = useMemo(
    () => byNewestFirst(profileState?.continueWatching ?? []),
    [profileState],
  )

  const myListIds = useMemo(
    () => new Set(myList.map((entry) => entry.objectID)),
    [myList],
  )

  const updateProfile = useCallback(
    (update: (current: MediaWatchState) => MediaWatchState) => {
      setStateMap((prev) => {
        return {
          ...prev,
          [profileKey]: update(prev[profileKey] ?? createEmptyWatchState()),
        }
      })
    },
    [setStateMap, profileKey],
  )

  // Cached here rather than in the persisted state: it is what lets a title
  // appear in a rail on the click, before any rehydration query resolves.
  const rememberTitle = useCallback(
    (title: MediaTitleHit) => {
      rememberRecords((prev) => {
        return { ...prev, [title.objectID]: title }
      })
    },
    [rememberRecords],
  )

  const isInMyList = useCallback(
    (objectID: string) => myListIds.has(objectID),
    [myListIds],
  )

  const toggleMyList = useCallback(
    (title: MediaTitleHit) => {
      const wasInList = myListIds.has(title.objectID)

      rememberTitle(title)
      updateProfile((current) => {
        return {
          ...current,
          myList: wasInList
            ? current.myList.filter(
                (entry) => entry.objectID !== title.objectID,
              )
            : [
                { objectID: title.objectID, addedAt: Date.now() },
                ...current.myList,
              ],
        }
      })

      // Only the add is a signal. A remove is arguably negative interest, and
      // Insights has no vocabulary for that, so sending nothing beats sending a
      // conversion that says the opposite of what happened.
      if (!wasInList) {
        sendAddToListEvent(title)
      }
    },
    [myListIds, rememberTitle, updateProfile, sendAddToListEvent],
  )

  /**
   * Play. Puts the title in Continue Watching, or nudges an existing entry
   * forward, and moves it to the front of the rail either way.
   */
  const markInProgress = useCallback(
    (title: MediaTitleHit) => {
      rememberTitle(title)
      updateProfile((current) => {
        const existing = current.continueWatching.find(
          (entry) => entry.objectID === title.objectID,
        )
        const entry: MediaProgressEntry = {
          objectID: title.objectID,
          addedAt: Date.now(),
          progress: advanceProgress(existing?.progress),
        }

        return {
          ...current,
          continueWatching: [
            entry,
            ...current.continueWatching.filter(
              (candidate) => candidate.objectID !== title.objectID,
            ),
          ],
        }
      })

      sendPlayEvent(title)
    },
    [rememberTitle, updateProfile, sendPlayEvent],
  )

  const removeFromContinueWatching = useCallback(
    (objectID: string) => {
      updateProfile((current) => {
        return {
          ...current,
          continueWatching: current.continueWatching.filter(
            (entry) => entry.objectID !== objectID,
          ),
        }
      })
    },
    [updateProfile],
  )

  return {
    profileKey,
    myList,
    continueWatching,
    isInMyList,
    toggleMyList,
    markInProgress,
    removeFromContinueWatching,
    rememberTitle,
  }
}
