import type { FurnishingProductHitValues } from '@/app/furnishing/hitValues.types'
import type { CreateConfigType } from '@/types'
import type { HitTemplate } from '@/types/hitTemplate.types'

export type FurnishingHitTemplate = HitTemplate<FurnishingProductHitValues>

export type FurnishingConfigType = CreateConfigType<
  FurnishingHitTemplate,
  {
    querySuggestions: undefined
    aiSuggestions: undefined
    locations: undefined
  }
>
