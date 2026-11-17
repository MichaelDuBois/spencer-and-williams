'use client'

import { useMediaViewerContext } from '@/app/media-entertainment/_hooks/useMediaViewerContext'

/**
 * Renders nothing — it exists to run the viewer-context hook once for the whole
 * vertical. Mounted in the layout rather than in the assistant panel so the note
 * is ready before the panel opens: the panel can set its first message and its
 * open flag in one tick, which leaves no render for a panel-mounted hook to
 * publish in. The note is therefore published on every media route, while the
 * title lookup behind it waits for the assistant's first open and stays resolved
 * afterwards — so it also never runs twice.
 */
export const MediaEntertainmentViewerContext = () => {
  useMediaViewerContext()

  return null
}
