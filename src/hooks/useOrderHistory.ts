'use client'

import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'

import { useActiveConfig } from '@/hooks/useActiveConfig'
import {
  getOrderHistoryAtom,
  GUEST_PERSONA_KEY,
  type OrderHistoryEntry,
} from '@/stores/orderHistory'
import {
  activePersonaAtom,
  personalizationStore,
} from '@/stores/personalization'

export const useOrderHistory = () => {
  const config = useActiveConfig()
  const vertical = config?.slug ?? 'default'
  const orderHistory = config?.features?.orderHistory
  const seeds = orderHistory?.enabled ? orderHistory.seeds : undefined

  const [historyMap, setHistoryMap] = useAtom(
    getOrderHistoryAtom(vertical, seeds ?? {}),
  )
  const persona = useAtomValue(activePersonaAtom, {
    store: personalizationStore,
  })
  const personaKey = persona?.id ?? GUEST_PERSONA_KEY

  const orders = useMemo(
    () => historyMap[personaKey] ?? [],
    [historyMap, personaKey],
  )

  const addOrderToHistory = useCallback(
    (entry: OrderHistoryEntry) => {
      setHistoryMap((prev) => {
        return {
          ...prev,
          [personaKey]: [entry, ...(prev[personaKey] ?? [])],
        }
      })
    },
    [setHistoryMap, personaKey],
  )

  return { orders, addOrderToHistory, personaKey }
}
