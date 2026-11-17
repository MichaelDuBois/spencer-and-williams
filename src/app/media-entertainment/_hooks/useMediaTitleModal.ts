'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import type { MediaTitleHit } from '@/app/media-entertainment/hitValues.types'
import { useAssistantLinkClick } from '@/features/aiAssistant/hooks/ui/useAssistantLinkClick'
import { useInsightsEvents } from '@/hooks/useInsightsEvents'
import { selectedMediaTitleAtom } from '@/stores/mediaEntertainment'

/**
 * The opener, for every card on the page. Deliberately write-only as far as the
 * selected title goes: a browse page mounts hundreds of cards, and subscribing
 * each one to the selected title would re-render the lot every time the sheet
 * opens or closes.
 *
 * Also the single funnel for the click event. Every surface that opens a title
 * goes through here — cards, billboard, similar titles — so Insights sees one
 * click per open and realtime personalization has something to build a profile
 * from. Rail items carry the `__queryID` the event attributes back to.
 */
export const useOpenMediaTitle = () => {
  const setSelectedTitle = useSetAtom(selectedMediaTitleAtom)
  // A fullscreen assistant covers the sheet. Same dismissal every other vertical's
  // assistant card uses: dock an expanded panel, close it outright below `lg`,
  // where the panel has no docked width to shrink to.
  const dismissAssistantOverlay = useAssistantLinkClick()
  const { sendProductClickEvent } = useInsightsEvents()

  return useCallback(
    (title: MediaTitleHit) => {
      sendProductClickEvent(title, { surface: 'media_title' })
      dismissAssistantOverlay()
      setSelectedTitle(title)
    },
    [sendProductClickEvent, dismissAssistantOverlay, setSelectedTitle],
  )
}

/** The sheet's own view of the state. */
export const useMediaTitleModal = () => {
  const selectedTitle = useAtomValue(selectedMediaTitleAtom)
  const setSelectedTitle = useSetAtom(selectedMediaTitleAtom)

  const closeTitle = useCallback(
    () => setSelectedTitle(null),
    [setSelectedTitle],
  )

  return { selectedTitle, closeTitle }
}
