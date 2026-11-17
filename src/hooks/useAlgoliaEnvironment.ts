'use client'

import { useAtom } from 'jotai'
import { useCallback } from 'react'

import { track } from '@/lib/analytics/track'
import {
  algoliaEnvironmentAtom,
  algoliaEnvironmentStore,
  stagingNoticeAcknowledgedAtom,
} from '@/stores/algoliaEnvironment'
import type { AlgoliaEnvironment } from '@/stores/algoliaEnvironment'

interface AlgoliaEnvironmentState {
  environment: AlgoliaEnvironment
  isStaging: boolean
  setEnvironment: (environment: AlgoliaEnvironment) => void
  hasAcknowledgedStagingNotice: boolean
  acknowledgeStagingNotice: () => void
}

export const useAlgoliaEnvironment = (): AlgoliaEnvironmentState => {
  // Pinned to the default store so landing, DemoBar and vertical trees agree.
  const [environment, setEnvironmentAtom] = useAtom(algoliaEnvironmentAtom, {
    store: algoliaEnvironmentStore,
  })
  const [hasAcknowledgedStagingNotice, setHasAcknowledged] = useAtom(
    stagingNoticeAcknowledgedAtom,
    { store: algoliaEnvironmentStore },
  )

  // Every switch, gated or not, is committed here.
  const setEnvironment = useCallback(
    (nextEnvironment: AlgoliaEnvironment) => {
      const from = algoliaEnvironmentStore.get(algoliaEnvironmentAtom)
      setEnvironmentAtom(nextEnvironment)
      if (from === nextEnvironment) return
      track('environment_switched', { from, to: nextEnvironment })
    },
    [setEnvironmentAtom],
  )

  const acknowledgeStagingNotice = useCallback(
    () => setHasAcknowledged(true),
    [setHasAcknowledged],
  )

  return {
    environment,
    isStaging: environment === 'staging',
    setEnvironment,
    hasAcknowledgedStagingNotice,
    acknowledgeStagingNotice,
  }
}
