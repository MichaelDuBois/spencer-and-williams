import { createDisplayResultsStreamExtractor } from '@/features/aiAssistant/tools/parsing/createDisplayResultsStreamExtractor'
import type {
  MediaContentType,
  MediaDisplayGroup,
  MediaDisplayItem,
  PartialMediaDisplayGroup,
} from '@/features/aiAssistant/types'

export const extractMediaDisplayResultsStream =
  createDisplayResultsStreamExtractor<
    MediaDisplayGroup,
    PartialMediaDisplayGroup
  >({
    itemsField: 'items',
    typePattern: /"type"\s*:\s*"(movie|show)"/,
    validateCompleteGroup: (group): group is MediaDisplayGroup => {
      const g = group as Partial<MediaDisplayGroup>
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
      partial.type = value as MediaContentType
    },
    pushItem: (partial, item) => {
      partial.items.push(item as MediaDisplayItem)
    },
  })
