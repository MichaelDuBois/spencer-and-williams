'use client'

import { useAtomValue } from 'jotai'
import { Configure } from 'react-instantsearch'

import { StoreFilterConfigure } from '@/components/results/StoreFilterConfigure'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useSearchParameters } from '@/hooks/useSearchParameters'
import {
  demoOptionsStore,
  dynamicFacetOrderingEnabledAtom,
  queryCategorizationEnabledAtom,
} from '@/stores/demoOptions'

export const SearchConfigure = () => {
  const searchParameters = useSearchParameters()
  const config = useActiveConfig()

  const queryCategorizationEnabled = useAtomValue(
    queryCategorizationEnabledAtom,
    { store: demoOptionsStore },
  )
  const dynamicFacetOrderingEnabled = useAtomValue(
    dynamicFacetOrderingEnabledAtom,
    { store: demoOptionsStore },
  )

  const hasQueryCategorization = config?.features?.queryCategorization?.enabled
  const hasDynamicFacetOrdering =
    config?.features?.dynamicFacetOrdering?.enabled

  const extensions: Record<string, unknown> = {}
  if (hasQueryCategorization && queryCategorizationEnabled) {
    extensions.queryCategorization = {
      enableAutoFiltering: true,
      enableCategoriesRetrieval: true,
    }
  }
  if (hasDynamicFacetOrdering && dynamicFacetOrderingEnabled) {
    extensions['*'] = {
      input: {
        enableDynamicFaceting: true,
        dynamicFacetsScope: 'all',
      },
    }
  }

  const hasExtensions = Object.keys(extensions).length > 0

  return (
    <>
      <Configure {...searchParameters} {...(hasExtensions && { extensions })} />
      {config?.slug === 'b2b-warehouse' && <StoreFilterConfigure />}
    </>
  )
}
