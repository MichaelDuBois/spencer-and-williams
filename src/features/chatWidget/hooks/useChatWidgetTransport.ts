'use client'

import { useAtomValue } from 'jotai'
import { useLayoutEffect, useMemo } from 'react'

import {
  buildChatSearchParameters,
  getChatSearchIndexNames,
} from '@/features/chatWidget/utils/buildChatSearchParameters'
import {
  createChatWidgetTransport,
  getClientAlgoliaAgent,
  type ChatWidgetTransport,
} from '@/features/chatWidget/utils/chatWidgetTransport'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { usePersonalizationSearchParams } from '@/hooks/usePersonalizationSearchParams'
import { baseSearchClientAtom, searchClientAtom } from '@/stores/searchClient'

/** A stable Agent Studio transport that sends the active profile's search override. */
export const useChatWidgetTransport = (
  agentId: string,
): ChatWidgetTransport | undefined => {
  const config = useActiveConfig()
  const searchClient = useAtomValue(searchClientAtom)
  const baseSearchClient = useAtomValue(baseSearchClientAtom)
  const personalizationParams = usePersonalizationSearchParams()
  const algolia = config?.algolia
  const appId = algolia?.appId
  const apiKey = algolia?.apiKey
  const primaryIndexName = algolia?.primaryIndex?.name
  const extraIndexNames = config?.features?.agentStudio?.chatWidgetIndexNames
  const indexNames = useMemo(
    () => getChatSearchIndexNames(primaryIndexName, extraIndexNames),
    [primaryIndexName, extraIndexNames],
  )
  const handle = useMemo(() => {
    if (!appId || !apiKey) return undefined
    return createChatWidgetTransport({ appId, apiKey, agentId })
  }, [agentId, apiKey, appId])

  // Persona changes must reach the next request without recreating Chat.
  useLayoutEffect(() => {
    handle?.setRequestState({
      searchParameters: buildChatSearchParameters(
        indexNames,
        personalizationParams,
      ),
      algoliaAgent:
        getClientAlgoliaAgent(searchClient) ??
        getClientAlgoliaAgent(baseSearchClient),
    })
  }, [
    handle,
    indexNames,
    personalizationParams,
    searchClient,
    baseSearchClient,
  ])

  return handle?.transport
}
