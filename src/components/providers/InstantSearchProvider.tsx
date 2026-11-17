'use client'

import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { useSearchBox } from 'react-instantsearch'
import { InstantSearchNext as InstantSearch } from 'react-instantsearch-nextjs'

import { SearchConfigure } from '@/components/providers/SearchConfigure'
import { InstantSearchChatWidget } from '@/features/chatWidget'
import { ChatCompareBar } from '@/features/chatWidget/components/ChatCompareBar'
import { searchClientAtom } from '@/stores/searchClient'

import type { liteClient } from 'algoliasearch/lite'

const VirtualSearchBox = () => {
  useSearchBox()
  return null
}

interface InstantSearchProviderProps {
  indexName: string
  routing?: boolean
  children: React.ReactNode
}

export const InstantSearchProvider = (props: InstantSearchProviderProps) => {
  const searchClient = useAtomValue(searchClientAtom)
  return searchClient ? (
    <ActiveInstantSearchProvider {...props} searchClient={searchClient} />
  ) : null
}

interface ActiveInstantSearchProviderProps extends InstantSearchProviderProps {
  searchClient: ReturnType<typeof liteClient>
}

const ActiveInstantSearchProvider = ({
  indexName,
  routing = true,
  children,
  searchClient,
}: ActiveInstantSearchProviderProps) => {
  // react-instantsearch-core's useInstantSearchApi changes indexName through
  // helper.setIndex().search(), retaining the instance. InstantSearch constructs
  // mainIndex once; its indexId defaults to the initial indexName, and UI state
  // stays keyed by getIndexId(). Layouts survive route changes (e.g. travel's
  // articles ↔ podcasts), so URL mapping must keep that mount-time key too.
  const [routingIndexId] = useState(indexName)

  const routingConfig = routing
    ? {
        stateMapping: {
          stateToRoute(uiState: Record<string, Record<string, unknown>>) {
            const indexUiState = uiState[routingIndexId] || {}
            return {
              query: indexUiState.query || undefined,
            }
          },
          routeToState(routeState: Record<string, unknown>) {
            return {
              [routingIndexId]: {
                query: routeState.query as string | undefined,
              },
            }
          },
        },
      }
    : false

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={indexName}
      routing={routingConfig}
      insights={true}
      future={{
        preserveSharedStateOnUnmount: true,
      }}>
      <VirtualSearchBox />
      <SearchConfigure />
      <InstantSearchChatWidget />
      <ChatCompareBar />
      {children}
    </InstantSearch>
  )
}
