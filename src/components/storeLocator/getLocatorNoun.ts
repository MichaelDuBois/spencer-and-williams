import type { VerticalConfig } from '@/types'

export interface LocatorNoun {
  singular: string
  plural: string
}

export const getLocatorNoun = (config: VerticalConfig | null): LocatorNoun => {
  return {
    singular: config?.locator?.nounSingular ?? 'store',
    plural: config?.locator?.nounPlural ?? 'stores',
  }
}
