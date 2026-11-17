'use client'

import { useAtomValue, useStore } from 'jotai'
import { useMemo, useState, useSyncExternalStore } from 'react'

import { useB2BCatalogPricing } from '@/app/b2b-warehouse/_hooks/useB2BCatalogPricing'
import { useB2BCustomerGroupPolicy } from '@/app/b2b-warehouse/_hooks/useB2BCustomerGroupPolicy'
import { useB2BPrepareCartProduct } from '@/app/b2b-warehouse/_hooks/useB2BPrepareCartProduct'
import { useB2BProductHitOptions } from '@/app/b2b-warehouse/_hooks/useB2BProductHitOptions'
import type { AssistantCatalog } from '@/features/aiAssistant/AssistantCatalogContext'
import {
  chatMessagesState,
  collectedObjectIDsState,
  followUpQueryState,
  initialAIMessageState,
  initialOrderContextState,
  isAssistantBusyState,
  productContextState,
  suggestionsState,
} from '@/features/aiAssistant/stores/aiAssistant'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useGetRawHit } from '@/hooks/useGetRawHit'

const createCatalogSession = (
  store: ReturnType<typeof useStore>,
  sessionKey: string,
) => {
  let controller: AbortController | null = null
  let session: { key: string; signal: AbortSignal } | null = null
  return {
    getSnapshot: () => session,
    subscribe: (onChange: () => void) => {
      controller = new AbortController()
      session = { key: sessionKey, signal: controller.signal }
      store.set(chatMessagesState, [])
      store.set(collectedObjectIDsState, [])
      store.set(suggestionsState, [])
      store.set(initialAIMessageState, '')
      store.set(initialOrderContextState, null)
      store.set(followUpQueryState, null)
      store.set(isAssistantBusyState, false)
      onChange()
      return () => {
        controller?.abort()
        session = null
      }
    },
    abort: () => controller?.abort(),
  }
}

export const useB2BAssistantCatalog = (): AssistantCatalog => {
  const config = useActiveConfig()
  const getPrice = useB2BCatalogPricing()
  const policy = useB2BCustomerGroupPolicy()
  const queryOptions = useB2BProductHitOptions()
  const store = useStore()
  const productContext = useAtomValue(productContextState)
  const { data: product } = useGetRawHit(
    productContext?.objectID ?? '',
    queryOptions,
  )
  const scope = JSON.stringify([
    config?.algolia.appId,
    config?.algolia.primaryIndex.name,
    'standard',
    policy,
  ])
  const [revision, setRevision] = useState(0)
  const sessionKey = JSON.stringify([scope, revision])
  const sessionStore = useMemo(
    () => createCatalogSession(store, sessionKey),
    [sessionKey, store],
  )
  const session = useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.getSnapshot,
    () => null,
  )
  const prepareCartProduct = useB2BPrepareCartProduct(session?.signal)
  const resetSession = () => {
    sessionStore.abort()
    setRevision((value) => value + 1)
  }
  const isReady =
    session?.key === sessionKey &&
    queryOptions.enabled !== false &&
    !session.signal.aborted

  return {
    getPrice,
    prepareCartProduct,
    queryOptions,
    productCacheKey: ['b2b-assistant-product', scope],
    signal: session?.signal,
    isReady,
    sessionKey,
    resetSession,
    productContext:
      isReady && product && productContext
        ? { ...productContext, pricing: getPrice(productContext.price) ?? null }
        : null,
    context:
      policy.status === 'ready'
        ? `[Catalog context: Customer group: ${policy.groupId ?? 'none'}. Warehouse: ${policy.warehouseId ?? 'all'}. Product searches are restricted to this catalog. For current products, price is the base price; use pricing.customerPrice as the customer unit price. Null pricing means a price is unavailable. Search price filters and sorting use base prices. Use returned products for recommendations. Cart and past orders are historical selections, not evidence of current product eligibility.]`
        : '',
  }
}
