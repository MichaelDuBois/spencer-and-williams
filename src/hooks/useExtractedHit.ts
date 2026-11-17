'use client'

import { useMemo } from 'react'

import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useGetRawHit, type UseGetRawHitOptions } from '@/hooks/useGetRawHit'
import type { RecordHit } from '@/types/recordHit.types'

interface UseExtractedHitArgs<TRaw extends RecordHit, TTemplate, TValues> {
  template: TTemplate | undefined
  extractor: (raw: TRaw, template: TTemplate, slug: string) => TValues
  indexName?: string
  queryOptions?: UseGetRawHitOptions
}

export const useExtractedHit = <TRaw extends RecordHit, TTemplate, TValues>(
  objectID: string,
  {
    template,
    extractor,
    indexName,
    queryOptions,
  }: UseExtractedHitArgs<TRaw, TTemplate, TValues>,
) => {
  const slug = useActiveConfig()?.slug
  const {
    data: raw,
    isLoading,
    isError,
  } = useGetRawHit<TRaw>(objectID, {
    ...queryOptions,
    indexName: indexName ?? queryOptions?.indexName,
  })

  const data = useMemo(() => {
    if (!raw || !template || !slug) return null
    return extractor(raw, template, slug)
  }, [raw, template, extractor, slug])

  return { data, isLoading, isError }
}
