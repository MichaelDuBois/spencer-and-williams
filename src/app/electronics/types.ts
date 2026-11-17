import type { ElectronicsProductHitValues } from '@/app/electronics/hitValues.types'
import type { CreateConfigType } from '@/types'
import type { HitTemplate } from '@/types/hitTemplate.types'

export type ElectronicsHitTemplate = HitTemplate<ElectronicsProductHitValues>

export type ElectronicsConfigType = CreateConfigType<
  ElectronicsHitTemplate,
  {
    querySuggestions: undefined
    aiSuggestions: undefined
    locations: undefined
  }
>
