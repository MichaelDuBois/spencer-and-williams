import type {
  B2BContentDisplayGroup,
  DisplayGroup,
  MediaDisplayGroup,
  TravelDisplayGroup,
} from '@/features/aiAssistant/types'

/**
 * Get item IDs from a group (handles products and the content verticals' items).
 */
export const getGroupItemIds = (
  group:
    | DisplayGroup
    | TravelDisplayGroup
    | B2BContentDisplayGroup
    | MediaDisplayGroup,
): string[] => {
  if ('products' in group && group.products) {
    return group.products.map((p) => p.objectID)
  }
  if ('items' in group && group.items) {
    return group.items.map((i) => i.objectID)
  }
  return []
}
