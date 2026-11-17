import type { CartItem } from '@/stores/cart'

import type { ReactNode } from 'react'

export type Variant = 'standard' | 'editorial'

export interface VariantClasses {
  wrapper: string
  imageWrapper: string
  image: string
  details: string
  topRow: string
  brand: string
  name: string
  bottomRow: string
  quantityWrapper: string
  quantityButton: string
  quantityDisplay: string
  price: string
  removeButton: string
}

export interface CartItemCardProps {
  variant: Variant
  priceContent?: ReactNode
  statusContent?: ReactNode
  item: CartItem
  onUpdateQuantity: (objectID: string, quantity: number) => void
  onRemove: (objectID: string) => void
}
