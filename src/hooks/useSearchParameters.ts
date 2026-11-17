'use client'

import { useAtomValue } from 'jotai'

import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useIsCompositionActive } from '@/hooks/useIsCompositionActive'
import { usePersonalization } from '@/hooks/usePersonalization'
import {
  demoOptionsStore,
  distinctEnabledAtom,
  dynamicReRankingEnabledAtom,
  neuralSearchEnabledAtom,
} from '@/stores/demoOptions'
import { isPersonalizationActive } from '@/utilities/personalizationParams'

export type SearchParameters = {
  clickAnalytics: boolean
  userToken?: string
  enablePersonalization?: boolean
  optionalFilters?: string[]
  getRankingInfo?: boolean
  enableReRanking?: boolean
  disableNeuralSearch?: boolean
  distinct?: boolean
}

export const useSearchParameters = (): SearchParameters => {
  const { currentUserToken, currentOptionalFilters, mode } =
    usePersonalization()
  const dynamicReRankingEnabled = useAtomValue(dynamicReRankingEnabledAtom, {
    store: demoOptionsStore,
  })
  const neuralSearchEnabled = useAtomValue(neuralSearchEnabledAtom, {
    store: demoOptionsStore,
  })
  const distinctEnabled = useAtomValue(distinctEnabledAtom, {
    store: demoOptionsStore,
  })
  const isCompositionActive = useIsCompositionActive()
  const config = useActiveConfig()

  const hasPersonalization = config?.features?.personalization?.enabled
  const hasDynamicReRanking = config?.features?.dynamicReRanking?.enabled
  const hasNeuralSearch = config?.features?.neuralSearch?.enabled
  const hasDistinct = config?.features?.distinct?.enabled
  const personalizationActive = isPersonalizationActive({
    mode,
    isFeatureEnabled: hasPersonalization,
  })

  return {
    clickAnalytics: true,
    ...(currentUserToken && { userToken: currentUserToken }),
    ...(hasPersonalization && { enablePersonalization: personalizationActive }),
    ...(personalizationActive && {
      optionalFilters: currentOptionalFilters,
      getRankingInfo: true,
    }),
    ...(hasDynamicReRanking && { enableReRanking: dynamicReRankingEnabled }),
    ...(hasNeuralSearch && { disableNeuralSearch: !neuralSearchEnabled }),
    ...(hasDistinct && !isCompositionActive && { distinct: distinctEnabled }),
  }
}
