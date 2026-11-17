import { createDisplayResultsStreamExtractor } from '@/features/aiAssistant/tools/parsing/createDisplayResultsStreamExtractor'
import type {
  DisplayGroup,
  DisplayProduct,
  PartialDisplayGroup,
} from '@/features/aiAssistant/types'

interface ExtractedGroups {
  intro: string
  groups: DisplayGroup[]
  streamingGroup: PartialDisplayGroup | null
}

const extractDisplayResultsStream = createDisplayResultsStreamExtractor<
  DisplayGroup,
  PartialDisplayGroup
>({
  itemsField: 'products',
  validateCompleteGroup: (group): group is DisplayGroup => {
    const g = group as Partial<DisplayGroup>
    return Boolean(g.title && g.products?.length)
  },
  createPartial: () => {
    return { title: null, why: null, products: [] }
  },
  pushItem: (partial, item) => {
    partial.products.push(item as DisplayProduct)
  },
})

export { extractDisplayResultsStream, type ExtractedGroups }
