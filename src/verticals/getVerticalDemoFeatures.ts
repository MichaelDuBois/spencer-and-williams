import { DEMO_FEATURES, LANDING_FEATURE_IDS } from '@/lib/demo-features'
import type { VerticalConfig } from '@/types'

export const getVerticalDemoFeatures = (config: VerticalConfig): string[] =>
  LANDING_FEATURE_IDS.filter((id) => DEMO_FEATURES[id].isEnabled(config)).map(
    (id) => DEMO_FEATURES[id].label,
  )
