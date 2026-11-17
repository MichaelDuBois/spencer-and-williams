import type { SelectableProfile } from '@/types'

export type PersonalizationMode =
  | 'anonymous'
  | 'persona'
  | 'realtime'
  | 'customerGroup'

interface GetPersonalizationModeArgs {
  persona: SelectableProfile | null
  realtimeEnabled: boolean
}

export const getPersonalizationMode = ({
  persona,
  realtimeEnabled,
}: GetPersonalizationModeArgs): PersonalizationMode => {
  if (realtimeEnabled) return 'realtime'
  if (persona?.type === 'customerGroup') return 'customerGroup'
  return persona ? 'persona' : 'anonymous'
}
