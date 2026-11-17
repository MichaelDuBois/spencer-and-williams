'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useStore } from 'jotai'

import { useB2BCartScope } from '@/app/b2b-warehouse/_hooks/useB2BCartScope'
import { fetchB2BCartProducts } from '@/app/b2b-warehouse/_utils/fetchB2BCartProducts'
import { getB2BCartQuote } from '@/app/b2b-warehouse/_utils/getB2BCartQuote'
import { b2bWarehouseConfig } from '@/app/b2b-warehouse/config'
import { useCart } from '@/hooks/useCart'
import { getCartAtom } from '@/stores/cart'

export const useB2BCart = () => {
  const cart = useCart()
  const store = useStore()
  const queryClient = useQueryClient()
  const scope = useB2BCartScope()
  const objectIDs = cart.items.map((item) => item.objectID).sort()
  const queryKey = ['b2b-cart', scope.key, objectIDs]
  const index = scope.config?.algolia.primaryIndex.name
  const template = b2bWarehouseConfig.algolia.primaryIndex.template!
  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) =>
      fetchB2BCartProducts(
        scope.client!,
        index!,
        objectIDs,
        scope.filters,
        signal,
      ),
    enabled:
      scope.policy.status === 'ready' &&
      !!scope.client &&
      !!index &&
      objectIDs.length > 0,
    staleTime: 0,
    retry: false,
  })
  const isReady =
    !!scope.client &&
    !!index &&
    scope.policy.status === 'ready' &&
    query.fetchStatus === 'idle' &&
    query.isSuccess
  const quote = getB2BCartQuote(
    cart.items,
    isReady ? query.data : [],
    scope.policy,
    template,
  )
  const canCheckout = isReady && quote.canCheckout
  const getSnapshot = (products = query.data) => {
    const state = queryClient.getQueryState(queryKey)
    const currentQuote = getB2BCartQuote(
      cart.items,
      products ?? [],
      scope.policy,
      template,
    )
    if (
      !currentQuote.canCheckout ||
      !scope.isCurrent() ||
      store.get(getCartAtom('b2b-warehouse')).items !== cart.items ||
      state?.fetchStatus !== 'idle' ||
      state.status !== 'success' ||
      state.data !== products
    )
      return null
    return {
      items: currentQuote.orderItems,
      subtotal: currentQuote.subtotalCents / 100,
    }
  }
  const getFreshSnapshot = async () => {
    const result = await query.refetch()

    return result.isSuccess ? getSnapshot(result.data) : null
  }
  return {
    ...cart,
    quote,
    isReady,
    isError: query.isError,
    isInvalid: scope.policy.status !== 'ready',
    retry: () => query.refetch(),
    checkoutOptions: { canCheckout, getSnapshot, getFreshSnapshot },
  }
}
