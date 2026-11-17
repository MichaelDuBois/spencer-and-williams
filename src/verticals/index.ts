import { b2bContentConfig } from '@/app/b2b-content/config'
import { b2bWarehouseConfig } from '@/app/b2b-warehouse/config'
import { ecommerceConfig } from '@/app/ecommerce/config'
import { electronicsConfig } from '@/app/electronics/config'
import { fashionConfig } from '@/app/fashion/config'
import { furnishingConfig } from '@/app/furnishing/config'
import { groceryConfig } from '@/app/grocery/config'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import { travelConfig } from '@/app/travel/config'
import type { Vertical } from '@/types'

export const verticals: Vertical[] = [
  { config: ecommerceConfig },
  { config: fashionConfig },
  { config: electronicsConfig },
  { config: furnishingConfig },
  { config: groceryConfig },
  { config: b2bWarehouseConfig },
  { config: travelConfig },
  { config: b2bContentConfig },
  { config: mediaEntertainmentConfig },
]
