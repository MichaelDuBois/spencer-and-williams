'use client'

import { useAtomValue } from 'jotai'

import { useActiveConfig } from '@/hooks/useActiveConfig'
import { compositionEnabledAtom, demoOptionsStore } from '@/stores/demoOptions'

/**
 * Whether searches are *meant* to run through the Composition API: the vertical
 * configures a composition and the demo toggle is on.
 *
 * This is the toggle's intent, which is a render ahead of the client that
 * serves it — `CompositionProvider` swaps clients in an effect. Use it for
 * search parameters, which are read on the same render as the toggle. Anything
 * caching results must key on `searchClientKeyAtom` instead, or it caches the
 * outgoing client's results against the incoming client's identity.
 */
export const useIsCompositionActive = (): boolean => {
  const compositionEnabled = useAtomValue(compositionEnabledAtom, {
    store: demoOptionsStore,
  })
  const config = useActiveConfig()

  return (
    Boolean(config?.features?.composition?.compositionId) && compositionEnabled
  )
}
