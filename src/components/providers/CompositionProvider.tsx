'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { createCompositionSearchClient } from '@/lib/create-composition-search-client'
import { compositionEnabledAtom, demoOptionsStore } from '@/stores/demoOptions'
import {
  baseSearchClientAtom,
  searchClientAtom,
  searchClientKeyAtom,
} from '@/stores/searchClient'
import type {
  CompositionConfig,
  IndexReplica,
} from '@/types/verticalConfig.types'

interface CompositionProviderProps {
  appId: string
  apiKey: string
  primaryIndexName: string
  replicas?: IndexReplica[]
  compositionConfig?: CompositionConfig
  children: React.ReactNode
}

export const CompositionProvider = ({
  appId,
  apiKey,
  primaryIndexName,
  replicas,
  compositionConfig,
  children,
}: CompositionProviderProps) => {
  const baseClient = useAtomValue(baseSearchClientAtom)
  const setSearchClient = useSetAtom(searchClientAtom)
  const setSearchClientKey = useSetAtom(searchClientKeyAtom)
  const compositionEnabled = useAtomValue(compositionEnabledAtom, {
    store: demoOptionsStore,
  })

  // Depend on the id, not the config object: a re-minted config must not re-mint the client.
  const compositionId = compositionConfig?.compositionId

  useEffect(() => {
    if (!baseClient) return

    if (compositionId && compositionEnabled) {
      const compositionClient = createCompositionSearchClient({
        baseClient,
        appId,
        apiKey,
        compositionId,
        primaryIndexName,
        replicas,
      })
      setSearchClient(compositionClient)
      // Set with the client, never from the toggle: consumers key their caches
      // on this, and a key that moved a render ahead of the client would cache
      // the outgoing client's results against the incoming client's identity.
      setSearchClientKey('composition')
    } else {
      setSearchClient(baseClient)
      setSearchClientKey('standard')
    }

    return () => {
      setSearchClient(null)
      setSearchClientKey(null)
    }
  }, [
    baseClient,
    compositionEnabled,
    compositionId,
    appId,
    apiKey,
    primaryIndexName,
    replicas,
    setSearchClient,
    setSearchClientKey,
  ])

  return <>{children}</>
}
