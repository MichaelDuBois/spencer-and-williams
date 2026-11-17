'use client'

import { useAtom } from 'jotai'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'

import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useGetRawHit } from '@/hooks/useGetRawHit'
import {
  ignoredUrlStoreIdAtom,
  selectedStoreAtom,
  selectedStoreStore,
} from '@/stores/selectedStore'
import type { GenericLocation } from '@/types/location.types'

export interface UseStoreIdFilterReturn {
  storeId: string | null
  store: GenericLocation | null
  isLoading: boolean
  select: (storeId: string) => void
  clear: () => void
}

export const useStoreIdFilter = (): UseStoreIdFilterReturn => {
  const config = useActiveConfig()
  const slug = config?.slug ?? ''
  const locationsIndex = config?.algolia.indices.locations?.name
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [selected, setSelected] = useAtom(selectedStoreAtom, {
    store: selectedStoreStore,
  })
  const [ignoredUrlStoreId, setIgnoredUrlStoreId] = useAtom(
    ignoredUrlStoreIdAtom,
    { store: selectedStoreStore },
  )
  // Only surface the store when it belongs to the active vertical — switching
  // verticals therefore reads as "no store" without needing an explicit reset.
  const storeId = selected?.vertical === slug ? selected.storeId : null

  // Hydrate the selection from an incoming `?storeId=` link (the store locator
  // "Shop at this store" flow). Each (vertical, storeId) pair is consumed once,
  // so clearing can't be undone by this effect re-firing before the async URL
  // update strips the param.
  const urlStoreId = params.get('storeId')
  const hydratedKeyRef = useRef<string | null>(null)
  useEffect(() => {
    if (!config) return
    if (!urlStoreId) {
      // The param is gone, so the window this guard protects has closed.
      // Re-arm it, or navigating back to the same store — or picking it again
      // after clear() — would leave `?storeId=` in the URL but not in state.
      hydratedKeyRef.current = null
      setIgnoredUrlStoreId(null)
      return
    }
    // A param cleared in this vertical never re-hydrates, even across remounts.
    if (
      ignoredUrlStoreId?.vertical === slug &&
      ignoredUrlStoreId.storeId === urlStoreId
    ) {
      return
    }
    const key = `${slug}:${urlStoreId}`
    if (hydratedKeyRef.current === key) return
    hydratedKeyRef.current = key
    setSelected({ vertical: slug, storeId: urlStoreId })
  }, [
    config,
    slug,
    urlStoreId,
    ignoredUrlStoreId,
    setSelected,
    setIgnoredUrlStoreId,
  ])

  const { data: store, isLoading } = useGetRawHit<GenericLocation>(
    storeId ?? '',
    { indexName: locationsIndex },
  )

  const select = useCallback(
    (nextStoreId: string) => {
      setIgnoredUrlStoreId(null)
      setSelected({ vertical: slug, storeId: nextStoreId })
    },
    [setSelected, setIgnoredUrlStoreId, slug],
  )

  const clear = useCallback(() => {
    const urlStoreId = params.get('storeId')
    setSelected(null)
    setIgnoredUrlStoreId(
      urlStoreId ? { vertical: slug, storeId: urlStoreId } : null,
    )
    // Drop any lingering `?storeId=` so it can't re-hydrate the atom on re-render.
    if (urlStoreId) {
      const next = new URLSearchParams(params.toString())
      next.delete('storeId')
      const qs = next.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    }
  }, [setSelected, setIgnoredUrlStoreId, params, router, pathname, slug])

  return { storeId, store: store ?? null, isLoading, select, clear }
}
