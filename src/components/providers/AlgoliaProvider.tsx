'use client'

import { liteClient as algoliasearch } from 'algoliasearch/lite'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { initInsights } from '@/lib/init-insights'
import { baseSearchClientAtom } from '@/stores/searchClient'

interface AlgoliaProviderProps {
  appId: string
  apiKey: string
  children: React.ReactNode
}

export const AlgoliaProvider = ({
  appId,
  apiKey,
  children,
}: AlgoliaProviderProps) => {
  const setBaseSearchClient = useSetAtom(baseSearchClientAtom)

  useEffect(() => {
    if (!appId || !apiKey) return

    // InstantSearch's insights middleware sends against whatever the singleton holds.
    initInsights(appId, apiKey)

    const baseClient = algoliasearch(appId, apiKey)
    setBaseSearchClient(baseClient)

    return () => {
      setBaseSearchClient(null)
    }
  }, [appId, apiKey, setBaseSearchClient])

  return <>{children}</>
}
