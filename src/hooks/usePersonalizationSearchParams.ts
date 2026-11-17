'use client'

import { useMemo } from 'react'

import { useActiveConfig } from '@/hooks/useActiveConfig'
import { usePersonalization } from '@/hooks/usePersonalization'
import {
  getPersonalizationSearchParams,
  isPersonalizationActive,
} from '@/utilities/personalizationParams'
import type { PersonalizationSearchParams } from '@/utilities/personalizationParams'

/** The active profile's search params, with an explicit `false` whenever the vertical supports personalization. */
export const usePersonalizationSearchParams =
  (): PersonalizationSearchParams => {
    const config = useActiveConfig()
    const { currentUserToken, currentOptionalFilters, mode } =
      usePersonalization()
    const isFeatureEnabled = config?.features?.personalization?.enabled

    return useMemo<PersonalizationSearchParams>(() => {
      return {
        ...(isFeatureEnabled ? { enablePersonalization: false } : {}),
        ...getPersonalizationSearchParams({
          personalization: {
            isActive: isPersonalizationActive({ mode, isFeatureEnabled }),
            currentUserToken,
            currentOptionalFilters,
          },
        }),
      }
    }, [isFeatureEnabled, mode, currentUserToken, currentOptionalFilters])
  }
