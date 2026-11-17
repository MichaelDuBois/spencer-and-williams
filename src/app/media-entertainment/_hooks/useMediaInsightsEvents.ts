'use client'

import { useCallback } from 'react'

import type { MediaTitleHit } from '@/app/media-entertainment/hitValues.types'
import { useInsightsEvents } from '@/hooks/useInsightsEvents'
import { track, type ProductEventProperties } from '@/lib/analytics/track'

/** Dashboard-facing names: the action taken, not the title it was taken on. */
export const ADD_TO_LIST_EVENT_NAME = 'Title Added to My List'
export const PLAY_EVENT_NAME = 'Title Played'

/**
 * The media vertical's two conversions.
 *
 * Wraps the shared generic sender so the event names and the `__queryID` mapping
 * live in one place, and callers say what happened rather than restating the
 * Insights payload at every site. Each also sends its Amplitude event here, ahead
 * of the Insights sender and its no-index early return.
 */
export const useMediaInsightsEvents = () => {
  const { sendConversionEvent } = useInsightsEvents()

  const sendAddToListEvent = useCallback(
    (title: MediaTitleHit) => {
      track('title_added_to_list', toTitleEventProperties(title))
      sendConversionEvent({
        objectID: title.objectID,
        eventName: ADD_TO_LIST_EVENT_NAME,
        queryID: title.__queryID,
      })
    },
    [sendConversionEvent],
  )

  const sendPlayEvent = useCallback(
    (title: MediaTitleHit) => {
      track('title_played', toTitleEventProperties(title))
      sendConversionEvent({
        objectID: title.objectID,
        eventName: PLAY_EVENT_NAME,
        queryID: title.__queryID,
      })
    },
    [sendConversionEvent],
  )

  return { sendAddToListEvent, sendPlayEvent }
}

const toTitleEventProperties = (
  title: MediaTitleHit,
): ProductEventProperties => {
  return {
    objectID: title.objectID,
    ...(title.__queryID ? { queryID: title.__queryID } : {}),
  }
}
