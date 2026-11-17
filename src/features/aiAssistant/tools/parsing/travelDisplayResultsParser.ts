import { createDisplayResultsStreamExtractor } from '@/features/aiAssistant/tools/parsing/createDisplayResultsStreamExtractor'
import type {
  PartialTravelDisplayGroup,
  TravelContentType,
  TravelDisplayGroup,
  TravelDisplayItem,
} from '@/features/aiAssistant/types'

export interface ExtractedTravelGroups {
  intro: string
  groups: TravelDisplayGroup[]
  streamingGroup: PartialTravelDisplayGroup | null
}

export const extractTravelDisplayResultsStream =
  createDisplayResultsStreamExtractor<
    TravelDisplayGroup,
    PartialTravelDisplayGroup
  >({
    itemsField: 'items',
    typePattern: /"type"\s*:\s*"(articles|podcasts|activities)"/,
    validateCompleteGroup: (group): group is TravelDisplayGroup => {
      const g = group as Partial<TravelDisplayGroup>
      return Boolean(g.title && g.items?.length && g.type)
    },
    createPartial: () => {
      return {
        title: null,
        type: null,
        why: null,
        items: [],
      }
    },
    setPartialType: (partial, value) => {
      partial.type = value as TravelContentType
    },
    pushItem: (partial, item) => {
      partial.items.push(item as TravelDisplayItem)
    },
  })
