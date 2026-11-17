import type { B2BWarehouseProductHitValues } from '@/app/b2b-warehouse/hitValues.types'
import type { CreateConfigType } from '@/types'
import type { HitTemplate } from '@/types/hitTemplate.types'

export type B2BWarehouseHitTemplate = HitTemplate<B2BWarehouseProductHitValues>

export type B2BWarehouseConfigType = CreateConfigType<
  B2BWarehouseHitTemplate,
  {
    querySuggestions: undefined
    locations: undefined
    aiSuggestions: undefined
  }
>
