'use client'

import { useEffect, useRef } from 'react'

import { MediaEntertainmentProfilePicker } from '@/app/media-entertainment/_components/MediaEntertainmentProfilePicker'
import { useMediaProfile } from '@/app/media-entertainment/_hooks/useMediaProfile'

/**
 * Reconnects a persisted profile choice to the shared personalization store, then
 * renders the picker.
 *
 * The store's atoms are in-memory by design, so a reload leaves them anonymous
 * while sessionStorage still remembers who was watching. Without this, every
 * reload would silently switch the viewer to the anonymous bucket and empty both
 * profile rails.
 *
 * Mounted once in the layout, so the restore runs exactly once per session rather
 * than once per consumer of `useMediaProfile`.
 */
export const MediaEntertainmentProfileGate = () => {
  const { choice, restoreChoice } = useMediaProfile()
  const hasRestored = useRef(false)

  useEffect(() => {
    // `choice` arrives on the first client render (the atom reads storage on
    // init), but the guard keeps a later choice change — the viewer picking a
    // different profile — from being treated as another restore.
    if (hasRestored.current || !choice) return

    hasRestored.current = true
    restoreChoice(choice)
  }, [choice, restoreChoice])

  return <MediaEntertainmentProfilePicker />
}
