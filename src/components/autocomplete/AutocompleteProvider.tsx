'use client'

import { useAtomValue } from 'jotai'
import { useSearchParams } from 'next/navigation'
import { InstantSearchNext as InstantSearch } from 'react-instantsearch-nextjs'

import { useActiveConfig } from '@/hooks/useActiveConfig'
import { searchClientAtom } from '@/stores/searchClient'

interface AutocompleteProviderProps {
  children: React.ReactNode
}

export const AutocompleteProvider = ({
  children,
}: AutocompleteProviderProps) => {
  const searchClient = useAtomValue(searchClientAtom)
  const config = useActiveConfig()
  const searchParams = useSearchParams()

  const indexName = config?.algolia.primaryIndex.name

  if (!searchClient || !indexName) {
    return null
  }

  const query = searchParams.get('query') ?? undefined
  const initialUiState = query ? { [indexName]: { query } } : undefined

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={indexName}
      routing={false}
      initialUiState={initialUiState}
      future={{
        preserveSharedStateOnUnmount: true,
      }}>
      {children}
    </InstantSearch>
  )
}
