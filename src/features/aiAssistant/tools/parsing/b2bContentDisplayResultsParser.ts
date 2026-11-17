import { createDisplayResultsStreamExtractor } from '@/features/aiAssistant/tools/parsing/createDisplayResultsStreamExtractor'
import type {
  B2BContentDisplayGroup,
  B2BContentDisplayItem,
  B2BContentType,
  PartialB2BContentDisplayGroup,
} from '@/features/aiAssistant/types'

export interface ExtractedB2BContentGroups {
  intro: string
  groups: B2BContentDisplayGroup[]
  streamingGroup: PartialB2BContentDisplayGroup | null
}

export const extractB2BContentDisplayResultsStream =
  createDisplayResultsStreamExtractor<
    B2BContentDisplayGroup,
    PartialB2BContentDisplayGroup
  >({
    itemsField: 'items',
    typePattern: /"type"\s*:\s*"(documentation|articles|blogs|resources)"/,
    validateCompleteGroup: (group): group is B2BContentDisplayGroup => {
      const g = group as Partial<B2BContentDisplayGroup>
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
      partial.type = value as B2BContentType
    },
    pushItem: (partial, item) => {
      partial.items.push(item as B2BContentDisplayItem)
    },
  })
