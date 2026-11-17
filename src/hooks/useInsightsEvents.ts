'use client'

import { useAtomValue } from 'jotai'
import { useCallback, useEffect } from 'react'
import aa from 'search-insights'

import { useCurrentUserToken } from '@/hooks/usePersonalization'
import type { ProductRecommendModel } from '@/hooks/useRecommend'
import { trackProductClick } from '@/lib/analytics/product-click-events'
import {
  track,
  type AddToCartSurface,
  type ProductClickSurface,
} from '@/lib/analytics/track'
import { initInsights } from '@/lib/init-insights'
import { activeConfigAtom } from '@/stores/activeConfig'

const CURRENCY = 'USD'

interface ClickHit {
  objectID: string
  __queryID?: string
  __position?: number
}

interface ProductClickOptions {
  surface: ProductClickSurface
  model?: ProductRecommendModel
}

interface AddToCartInput {
  objectID: string
  queryID?: string
  price?: number
  discount?: number
  quantity?: number
}

interface AddToCartEventOptions {
  surface: AddToCartSurface
  model?: ProductRecommendModel
}

interface PurchaseItem {
  objectID: string
  price?: number
  discount?: number
  quantity?: number
  queryID?: string
}

interface ConversionInput {
  objectID: string
  /** Shows up in the dashboard's event list, so name the action, not the object. */
  eventName: string
  queryID?: string
}

export const useInsightsEvents = () => {
  const config = useAtomValue(activeConfigAtom)
  const userToken = useCurrentUserToken()

  const appId = config?.algolia.appId ?? ''
  const apiKey = config?.algolia.apiKey ?? ''
  const index = config?.algolia.primaryIndex.name ?? ''

  // Backstop for manual events: `AlgoliaProvider` already inits on mount.
  useEffect(() => {
    initInsights(appId, apiKey)
  }, [appId, apiKey])

  const sendProductClickEvent = useCallback(
    (hit: ClickHit, { surface, model }: ProductClickOptions) => {
      trackProductClick(hit, { surface, model, index })
      if (!index) return

      if (hit.__queryID) {
        aa('clickedObjectIDsAfterSearch', {
          index,
          eventName: 'Product Clicked',
          queryID: hit.__queryID,
          objectIDs: [hit.objectID],
          positions: [hit.__position ?? 1],
          ...(userToken ? { userToken } : {}),
        })
      } else {
        aa('clickedObjectIDs', {
          index,
          eventName: 'Product Clicked',
          objectIDs: [hit.objectID],
          ...(userToken ? { userToken } : {}),
        })
      }
    },
    [index, userToken],
  )

  const sendAddToCartEvent = useCallback(
    (
      { objectID, queryID, price, discount, quantity = 1 }: AddToCartInput,
      { surface, model }: AddToCartEventOptions,
    ) => {
      track('add_to_cart', {
        objectID,
        surface,
        ...(model ? { model } : {}),
        quantity,
        ...(price !== undefined ? { price } : {}),
        ...(queryID ? { queryID } : {}),
      })
      if (!index) return

      const objectData = [
        {
          price: price ?? 0,
          quantity,
          ...(discount !== undefined ? { discount } : {}),
        },
      ]
      const value = Math.round((price ?? 0) * quantity * 100) / 100

      if (queryID) {
        aa('addedToCartObjectIDsAfterSearch', {
          index,
          eventName: 'Product Added to Cart',
          queryID,
          objectIDs: [objectID],
          objectData,
          value,
          currency: CURRENCY,
          ...(userToken ? { userToken } : {}),
        })
      } else {
        aa('addedToCartObjectIDs', {
          index,
          eventName: 'Product Added to Cart',
          objectIDs: [objectID],
          objectData,
          value,
          currency: CURRENCY,
          ...(userToken ? { userToken } : {}),
        })
      }
    },
    [index, userToken],
  )

  const sendPurchaseEvent = useCallback(
    (items: PurchaseItem[]) => {
      if (items.length === 0) return

      const toObjectData = (item: PurchaseItem) => {
        return {
          price: Math.round((item.price ?? 0) * 100) / 100,
          quantity: item.quantity ?? 1,
          discount: item.discount ?? 0,
        }
      }
      const sumValue = (list: PurchaseItem[]) =>
        Math.round(
          list.reduce(
            (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1),
            0,
          ) * 100,
        ) / 100

      // One event per checkout, before the Insights batches split the items.
      const orderValue = sumValue(items)
      track('checkout_completed', {
        item_count: items.reduce((sum, item) => sum + (item.quantity ?? 1), 0),
        order_value: orderValue,
        currency: CURRENCY,
        $revenue: orderValue,
      })
      if (!index) return

      const attributed = items.filter((item) => item.queryID)
      const unattributed = items.filter((item) => !item.queryID)

      if (attributed.length > 0) {
        aa('purchasedObjectIDsAfterSearch', {
          index,
          eventName: 'Product Purchased',
          objectIDs: attributed.map((item) => item.objectID),
          objectData: attributed.map((item) => {
            return {
              ...toObjectData(item),
              queryID: item.queryID,
            }
          }),
          value: sumValue(attributed),
          currency: CURRENCY,
          ...(userToken ? { userToken } : {}),
        })
      }

      if (unattributed.length > 0) {
        aa('purchasedObjectIDs', {
          index,
          eventName: 'Product Purchased',
          objectIDs: unattributed.map((item) => item.objectID),
          objectData: unattributed.map(toObjectData),
          value: sumValue(unattributed),
          currency: CURRENCY,
          ...(userToken ? { userToken } : {}),
        })
      }
    },
    [index, userToken],
  )

  // The non-commerce conversion: no price, no quantity, no currency. Saving a
  // title to a list is the media equivalent of an add-to-cart, and realtime
  // personalization needs it — a profile built from clicks alone reads every
  // title the viewer bounced off as an interest.
  const sendConversionEvent = useCallback(
    ({ objectID, eventName, queryID }: ConversionInput) => {
      if (!index) return

      if (queryID) {
        aa('convertedObjectIDsAfterSearch', {
          index,
          eventName,
          queryID,
          objectIDs: [objectID],
          ...(userToken ? { userToken } : {}),
        })
      } else {
        aa('convertedObjectIDs', {
          index,
          eventName,
          objectIDs: [objectID],
          ...(userToken ? { userToken } : {}),
        })
      }
    },
    [index, userToken],
  )

  return {
    sendProductClickEvent,
    sendAddToCartEvent,
    sendPurchaseEvent,
    sendConversionEvent,
  }
}
