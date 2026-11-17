'use client'

import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { demoOptionsStore, resetDemoOptionsAtom } from '@/stores/demoOptions'
import { geoSearchStore, resetGeoSearchStateAtom } from '@/stores/geoSearch'
import {
  groceryDeliveryMethodStore,
  resetGroceryDeliveryMethodAtom,
} from '@/stores/groceryDeliveryMethod'
import {
  personalizationStore,
  resetPersonalizationAtom,
} from '@/stores/personalization'

// Call this from a component that only remounts on vertical change, not on environment toggle.
export const useResetVerticalScopedState = (slug: string) => {
  const resetPersonalization = useSetAtom(resetPersonalizationAtom, {
    store: personalizationStore,
  })
  const resetDemoOptions = useSetAtom(resetDemoOptionsAtom, {
    store: demoOptionsStore,
  })
  const resetGroceryDeliveryMethod = useSetAtom(
    resetGroceryDeliveryMethodAtom,
    { store: groceryDeliveryMethodStore },
  )
  const resetGeoSearchState = useSetAtom(resetGeoSearchStateAtom, {
    store: geoSearchStore,
  })

  useEffect(() => {
    resetPersonalization()
    resetDemoOptions()
    resetGroceryDeliveryMethod()
    resetGeoSearchState()
  }, [
    slug,
    resetPersonalization,
    resetDemoOptions,
    resetGroceryDeliveryMethod,
    resetGeoSearchState,
  ])
}
