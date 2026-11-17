'use client'

import { useB2BProductHitOptions } from '@/app/b2b-warehouse/_hooks/useB2BProductHitOptions'
import {
  getProductHitDefinition,
  type ProductHitDefinition,
} from '@/components/hit/productHitRegistry'
import type { HitQueryOptions } from '@/types/hitQueryOptions.types'

interface UseProductHitDefinitionResult {
  definition: ProductHitDefinition | undefined
  queryOptions: HitQueryOptions | undefined
}

export const useProductHitDefinition = (
  slug: string | undefined,
): UseProductHitDefinitionResult => {
  const b2bQueryOptions = useB2BProductHitOptions()
  const definition = getProductHitDefinition(slug)

  return {
    definition,
    queryOptions: definition?.usesScopedQueryOptions
      ? b2bQueryOptions
      : undefined,
  }
}
