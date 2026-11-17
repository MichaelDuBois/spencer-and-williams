'use client'

import { useActiveConfig } from '@/hooks/useActiveConfig'
import { usePreviewImages } from '@/hooks/usePreviewImages'
import type { HitQueryOptions } from '@/types/hitQueryOptions.types'

export const useCollectionImages = (queryOptions?: HitQueryOptions) => {
  const config = useActiveConfig()
  const collections = config?.collections ?? []
  const collectionNames = collections.map((c) => c.collection)
  const imageMap = usePreviewImages(
    collectionNames,
    '_collections',
    'collectionImages',
    queryOptions,
  )

  return { collections, imageMap }
}
