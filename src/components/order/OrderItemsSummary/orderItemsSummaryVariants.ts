import type {
  Variant,
  VariantClasses,
} from '@/components/order/OrderItemsSummary/orderItemsSummary.types'

export const VARIANT_CLASSES: Record<Variant, VariantClasses> = {
  standard: {
    wrapper: 'border-border bg-card rounded-card border p-6',
    title: 'mb-4 text-lg font-semibold',
    itemsList: 'divide-border divide-y',
    item: 'flex gap-3 py-3 first:pt-0 last:pb-0',
    thumbnail:
      'bg-muted relative h-16 w-16 shrink-0 overflow-hidden rounded-lg',
    thumbnailImg: 'object-contain',
    details: 'flex flex-1 flex-col justify-center',
    brand: 'text-muted-foreground text-xs',
    name: 'text-sm leading-tight font-medium',
    quantity: 'text-muted-foreground text-xs',
    price: 'flex items-center text-sm font-medium',
    totals: 'border-border mt-4 space-y-2 border-t pt-4 text-sm',
    totalsRow: 'flex justify-between',
    totalsLabel: 'text-muted-foreground',
    totalsValue: '',
    totalsTotalRow: 'flex justify-between text-base font-semibold',
    shippingValue: '',
    freeShippingLabel: 'Free',
  },
  editorial: {
    wrapper: 'mt-12',
    title: 'mb-6 text-xs tracking-widest uppercase',
    itemsList: '',
    item: 'border-border/30 flex gap-6 border-b py-6 first:border-t',
    thumbnail:
      'bg-muted relative aspect-3/4 w-20 shrink-0 overflow-hidden sm:w-24',
    thumbnailImg: 'object-cover',
    details: 'flex flex-1 items-start justify-between gap-4',
    brand: 'text-muted-foreground text-micro tracking-widest uppercase',
    name: 'mt-1 font-secondary text-base leading-snug',
    quantity: 'text-muted-foreground mt-2 text-xs tracking-widest uppercase',
    price: 'font-secondary text-sm whitespace-nowrap',
    totals: 'mt-8 ml-auto max-w-sm space-y-4 text-sm',
    totalsRow: 'flex justify-between',
    totalsLabel: 'text-muted-foreground',
    totalsValue: '',
    totalsTotalRow: 'border-border/30 flex justify-between border-t pt-4',
    shippingValue: 'text-xs',
    freeShippingLabel: 'Complimentary',
  },
}
