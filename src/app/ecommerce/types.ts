import type { EcommerceProductHitValues } from '@/app/ecommerce/hitValues.types'
import type { CreateConfigType } from '@/types'
import type { HitTemplate } from '@/types/hitTemplate.types'

export type EcommerceHitTemplate = HitTemplate<EcommerceProductHitValues>

export type EcommerceConfigType = CreateConfigType<
  EcommerceHitTemplate,
  {
    querySuggestions: undefined
    aiSuggestions: undefined
    locations: undefined
  }
>
