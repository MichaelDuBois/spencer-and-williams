import { b2bContentVertical } from '@/features/aiAssistant/verticals/b2b-content-vertical'
import { b2bWarehouseVertical } from '@/features/aiAssistant/verticals/b2b-warehouse-vertical'
import { electronicsVertical } from '@/features/aiAssistant/verticals/electronics-vertical'
import { fashionVertical } from '@/features/aiAssistant/verticals/fashion-vertical'
import { furnishingVertical } from '@/features/aiAssistant/verticals/furnishing-vertical'
import { groceryVertical } from '@/features/aiAssistant/verticals/grocery-vertical'
import { mediaEntertainmentVertical } from '@/features/aiAssistant/verticals/media-entertainment-vertical'
import { productVertical } from '@/features/aiAssistant/verticals/product-vertical'
import { travelVertical } from '@/features/aiAssistant/verticals/travel-vertical'
import type { VerticalConfig } from '@/features/aiAssistant/verticals/types'

const verticalConfigBySlug: Record<string, VerticalConfig> = {
  ecommerce: productVertical,
  electronics: electronicsVertical,
  fashion: fashionVertical,
  furnishing: furnishingVertical,
  grocery: groceryVertical,
  travel: travelVertical,
  'b2b-content': b2bContentVertical,
  'b2b-warehouse': b2bWarehouseVertical,
  'media-entertainment': mediaEntertainmentVertical,
}

export const getVerticalConfig = (slug: string | undefined): VerticalConfig =>
  (slug && verticalConfigBySlug[slug]) || productVertical
