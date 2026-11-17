import {
  Building2,
  Clapperboard,
  Laptop,
  LayoutGrid,
  Plane,
  Shirt,
  ShoppingBasket,
  ShoppingCart,
  Sofa,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

export const VERTICAL_ICONS: Record<string, LucideIcon> = {
  ecommerce: ShoppingCart,
  fashion: Shirt,
  electronics: Laptop,
  grocery: ShoppingBasket,
  travel: Plane,
  'b2b-content': Building2,
  'b2b-warehouse': Wrench,
  furnishing: Sofa,
  'media-entertainment': Clapperboard,
}

export const FALLBACK_VERTICAL_ICON: LucideIcon = LayoutGrid
