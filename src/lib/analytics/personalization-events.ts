import { readPersonalizationMode } from '@/lib/analytics/demo-context'
import { track } from '@/lib/analytics/track'
import type { SelectableProfile } from '@/types'

// Reads the mode around the store write so no component has to subscribe to it.
export const trackPersonalizationModeChange = (
  applyChange: () => void,
): void => {
  const from = readPersonalizationMode()
  applyChange()
  const to = readPersonalizationMode()
  if (from === to) return
  track('personalization_mode_changed', { from, to })
}

export const trackPersonaSelected = (profile: SelectableProfile): void => {
  track('persona_selected', {
    persona: profile.id,
    persona_type: profile.type ?? 'persona',
  })
}
