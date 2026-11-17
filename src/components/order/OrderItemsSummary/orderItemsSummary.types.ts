import type { Order } from '@/stores/order'

export type Variant = 'standard' | 'editorial'

export interface OrderItemsSummaryProps {
  variant: Variant
  order: Order
}

export interface VariantClasses {
  wrapper: string
  title: string
  itemsList: string
  item: string
  thumbnail: string
  thumbnailImg: string
  details: string
  brand: string
  name: string
  quantity: string
  price: string
  totals: string
  totalsRow: string
  totalsLabel: string
  totalsValue: string
  totalsTotalRow: string
  shippingValue: string
  freeShippingLabel: string
}
