'use client'

import { useAtomValue } from 'jotai'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

import { resolveB2BCustomerGroupPolicy } from '@/app/b2b-warehouse/_utils/customerGroupPolicy'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import {
  activePersonaAtom,
  personalizationStore,
  realtimePersoEnabledAtom,
} from '@/stores/personalization'
import {
  ignoredUrlStoreIdAtom,
  selectedStoreAtom,
  selectedStoreStore,
} from '@/stores/selectedStore'

export const useB2BCustomerGroupPolicy = () => {
  const config = useActiveConfig()
  const profile = useAtomValue(activePersonaAtom, {
    store: personalizationStore,
  })
  const isRealtime = useAtomValue(realtimePersoEnabledAtom, {
    store: personalizationStore,
  })
  const selectedStore = useAtomValue(selectedStoreAtom, {
    store: selectedStoreStore,
  })
  const ignoredUrlStoreId = useAtomValue(ignoredUrlStoreIdAtom, {
    store: selectedStoreStore,
  })
  const vertical = config?.slug
  const urlStoreId = useSearchParams()?.get('storeId')

  return useMemo(() => {
    const isUrlStoreIgnored =
      urlStoreId != null &&
      ignoredUrlStoreId != null &&
      ignoredUrlStoreId.vertical === vertical &&
      ignoredUrlStoreId.storeId === urlStoreId
    const effectiveSelectedStore =
      selectedStore?.vertical === vertical
        ? selectedStore
        : urlStoreId && !isUrlStoreIgnored
          ? { vertical: 'b2b-warehouse', storeId: urlStoreId }
          : null

    return resolveB2BCustomerGroupPolicy({
      vertical,
      profile: isRealtime ? null : profile,
      selectedStore: effectiveSelectedStore,
    })
  }, [
    vertical,
    profile,
    isRealtime,
    selectedStore,
    urlStoreId,
    ignoredUrlStoreId,
  ])
}
