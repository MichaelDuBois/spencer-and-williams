'use client'

import { useAtomValue, useStore } from 'jotai'

import {
  getB2BCatalogFilters,
  resolveB2BCustomerGroupPolicy,
} from '@/app/b2b-warehouse/_utils/customerGroupPolicy'
import { activeConfigAtom } from '@/stores/activeConfig'
import {
  activePersonaAtom,
  personalizationStore,
  realtimePersoEnabledAtom,
  realtimeSessionTokenAtom,
} from '@/stores/personalization'
import { baseSearchClientAtom } from '@/stores/searchClient'
import { selectedStoreAtom, selectedStoreStore } from '@/stores/selectedStore'

const clientIds = new WeakMap<object, number>()
let nextClientId = 0

const getClientId = (client: object | null) => {
  if (!client) return null
  if (!clientIds.has(client)) clientIds.set(client, ++nextClientId)
  return clientIds.get(client)
}

const readScope = (store: ReturnType<typeof useStore>) => {
  const client = store.get(baseSearchClientAtom)
  const config = store.get(activeConfigAtom)
  const profile = personalizationStore.get(activePersonaAtom)
  const isRealtime = personalizationStore.get(realtimePersoEnabledAtom)
  const policy = resolveB2BCustomerGroupPolicy({
    vertical: config?.slug,
    profile: isRealtime ? null : profile,
    selectedStore: selectedStoreStore.get(selectedStoreAtom),
  })
  return {
    config,
    client,
    policy,
    key: JSON.stringify([
      config?.algolia.appId,
      config?.algolia.primaryIndex.name,
      'standard',
      getClientId(client),
      policy,
      profile?.id,
      profile?.token,
      isRealtime,
      personalizationStore.get(realtimeSessionTokenAtom),
    ]),
  }
}

export const useB2BCartScope = () => {
  const store = useStore()
  useAtomValue(activeConfigAtom)
  useAtomValue(activePersonaAtom, { store: personalizationStore })
  useAtomValue(realtimePersoEnabledAtom, { store: personalizationStore })
  useAtomValue(realtimeSessionTokenAtom, { store: personalizationStore })
  useAtomValue(selectedStoreAtom, { store: selectedStoreStore })
  useAtomValue(baseSearchClientAtom)
  const scope = readScope(store)
  return {
    ...scope,
    filters: getB2BCatalogFilters(scope.policy),
    isCurrent: () => readScope(store).key === scope.key,
  }
}
