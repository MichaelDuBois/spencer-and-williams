'use client'

import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'

import { useIsRestrictedProfile } from '@/app/media-entertainment/_hooks/useIsRestrictedProfile'
import { useMediaWatchRails } from '@/app/media-entertainment/_hooks/useMediaWatchRails'
import { useSetProductContext } from '@/features/aiAssistant/hooks/useSetProductContext'
import {
  isAIAssistantOpenState,
  viewerContextState,
} from '@/features/aiAssistant/stores/aiAssistant'
import { buildMediaViewerContext } from '@/features/aiAssistant/utils/buildMediaViewerContext'
import { usePersonalization } from '@/hooks/usePersonalization'
import {
  activePersonaAtom,
  personalizationStore,
} from '@/stores/personalization'

/**
 * Publishes the "who is watching" note the assistant prepends to each turn.
 *
 * Reuses the watch rails' own resolver, so the agent hears about exactly the
 * titles the viewer can see on screen — no second fetch, and nothing named that
 * the UI has not resolved yet.
 *
 * The note itself is published on every route, unconditionally: the panel writes
 * its opening message and its open flag in the same tick, so a context that only
 * appeared on open would miss turn 1. Only the title lookup is gated — it waits
 * for the assistant's first open, then stays resolved for the session, so a
 * viewer who never opens the panel pays for no request.
 */
export const useMediaViewerContext = () => {
  const { mode } = usePersonalization()
  const persona = useAtomValue(activePersonaAtom, {
    store: personalizationStore,
  })
  const isRestrictedProfile = useIsRestrictedProfile()

  const isAssistantOpen = useAtomValue(isAIAssistantOpenState)
  const [hasOpenedAssistant, setHasOpenedAssistant] = useState(isAssistantOpen)
  if (isAssistantOpen && !hasOpenedAssistant) setHasOpenedAssistant(true)

  const { myListTitles, continueWatchingTitles } = useMediaWatchRails({
    resolveMissing: hasOpenedAssistant,
  })

  const context = useMemo(
    () =>
      buildMediaViewerContext({
        mode,
        persona,
        myList: myListTitles,
        continueWatching: continueWatchingTitles,
        isRestrictedProfile,
      }),
    [mode, persona, myListTitles, continueWatchingTitles, isRestrictedProfile],
  )

  useSetProductContext(viewerContextState, context)
}
