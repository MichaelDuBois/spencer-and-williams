import type { Variant } from '@/components/cart/CartItemCard'
import type { CartPageContentClasses } from '@/components/cart/CartPageContent/cartPageContent.types'

export const VARIANT_CLASSES: Record<Variant, CartPageContentClasses> = {
  standard: {
    grid: 'grid grid-cols-1 gap-8 lg:grid-cols-3',
    emptyWrapper: 'border-border bg-card rounded-card border p-8 text-center',
    emptyMessage: 'text-muted-foreground',
    continueShoppingLink: 'text-primary mt-4 inline-block hover:underline',
    orderHistoryLink: 'text-primary mt-4 inline-block hover:underline',
    itemsWrapper: 'space-y-4',
    summaryCard: 'border-border bg-card rounded-card border p-6',
    summaryHeading: 'mb-4 text-lg font-semibold',
    summaryDetails: 'space-y-2 text-sm',
    shippingValue: '',
    totalRow:
      'border-border flex justify-between border-t pt-2 text-base font-semibold',
    checkoutButton: 'rounded-button mt-6 w-full py-3',
  },
  editorial: {
    grid: 'grid grid-cols-1 gap-12 lg:grid-cols-3',
    emptyWrapper: 'border-border/30 border-y py-16 text-center',
    emptyMessage: 'text-muted-foreground text-sm',
    continueShoppingLink:
      'mt-6 inline-block text-xs tracking-widest uppercase underline underline-offset-4 transition-opacity hover:opacity-70',
    orderHistoryLink:
      'mt-6 inline-block text-xs tracking-widest uppercase underline underline-offset-4 transition-opacity hover:opacity-70',
    itemsWrapper: '',
    summaryCard: 'border-border/30 border p-8',
    summaryHeading: 'mb-8 text-xs tracking-widest uppercase',
    summaryDetails: 'space-y-4 text-sm',
    shippingValue: 'text-xs',
    totalRow: 'border-border/30 flex justify-between border-t pt-4',
    checkoutButton:
      'mt-8 w-full rounded-button py-4 text-xs tracking-widest uppercase',
  },
}
