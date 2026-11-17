'use client'

import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { useInstantSearch } from 'react-instantsearch'

import {
  demoOptionsStore,
  queryCategorizationEnabledAtom,
} from '@/stores/demoOptions'

interface HierarchyPathItem {
  facetName: string
  facetValue: string
  depth: number
}

interface RawQueryCategory {
  bin?: string
  hierarchyPath?: HierarchyPathItem[]
}

interface QueryCategorizationExtension {
  categories?: RawQueryCategory[]
}

interface ResultsWithExtensions {
  extensions?: {
    queryCategorization?: QueryCategorizationExtension
  }
}

export interface DetectedCategory {
  pathValue: string
  label: string
  attributes: string[]
  value: string
  bin?: string
}

const EMPTY: DetectedCategory[] = []

export const useQueryCategories = (): DetectedCategory[] => {
  const enabled = useAtomValue(queryCategorizationEnabledAtom, {
    store: demoOptionsStore,
  })
  const { results } = useInstantSearch()

  const rawCategories = (
    results as unknown as ResultsWithExtensions | undefined
  )?.extensions?.queryCategorization?.categories

  const contentKey = enabled ? JSON.stringify(rawCategories ?? []) : ''

  return useMemo(() => {
    if (!enabled || !rawCategories?.length) return EMPTY

    const parsed = rawCategories
      .map((category): DetectedCategory | null => {
        const sorted = [...(category.hierarchyPath ?? [])].sort(
          (a, b) => a.depth - b.depth,
        )
        const hierarchyPath = Array.from(
          new Map(sorted.map((item) => [item.facetName, item])).values(),
        )

        if (!hierarchyPath.length) return null

        const attributes = hierarchyPath.map((item) => item.facetName)
        const deepestValue = hierarchyPath[hierarchyPath.length - 1].facetValue

        return {
          pathValue: hierarchyPath[0].facetValue,
          attributes,
          label: deepestValue,
          value: deepestValue,
          bin: category.bin,
        }
      })
      .filter((category): category is DetectedCategory => category !== null)

    return parsed.length ? parsed : EMPTY
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentKey])
}
