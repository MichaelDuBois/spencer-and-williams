import type {
  Variant,
  VariantClasses,
} from '@/components/cart/CartItemCard/cartItemCard.types'

export const VARIANT_CLASSES: Record<Variant, VariantClasses> = {
  standard: {
    wrapper: 'border-border bg-card rounded-card flex gap-4 border p-4',
    imageWrapper:
      'bg-muted relative h-24 w-24 shrink-0 overflow-hidden rounded-lg',
    image: 'object-contain',
    details: 'flex flex-1 flex-col',
    topRow: 'flex items-start justify-between',
    brand: 'text-muted-foreground text-xs tracking-wide uppercase',
    name: 'font-semibold',
    bottomRow: 'mt-auto flex items-center justify-between pt-2',
    quantityWrapper: 'flex items-center gap-2',
    quantityButton:
      'border-border bg-background hover:bg-muted flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border transition-colors',
    quantityDisplay: 'w-8 text-center font-medium',
    price: 'font-semibold',
    removeButton:
      'text-muted-foreground hover:text-destructive cursor-pointer p-1 transition-colors',
  },
  editorial: {
    wrapper: 'border-border/30 flex gap-6 border-b py-6 first:border-t',
    imageWrapper:
      'bg-muted relative aspect-3/4 w-24 shrink-0 overflow-hidden sm:w-32',
    image: 'object-cover',
    details: 'flex flex-1 flex-col',
    topRow: 'flex items-start justify-between gap-4',
    brand: 'text-muted-foreground text-micro tracking-widest uppercase',
    name: 'mt-1 font-secondary text-base leading-snug',
    bottomRow: 'mt-auto flex items-end justify-between pt-4',
    quantityWrapper: 'inline-flex items-center',
    quantityButton:
      'border-border/40 hover:border-foreground flex h-8 w-8 cursor-pointer items-center justify-center border text-sm transition-colors',
    quantityDisplay:
      'border-border/40 flex h-8 w-10 items-center justify-center border-t border-b text-xs tracking-widest tabular-nums',
    price: 'font-secondary text-sm whitespace-nowrap',
    removeButton:
      'text-muted-foreground hover:text-foreground cursor-pointer text-micro tracking-widest uppercase underline-offset-4 transition-colors hover:underline',
  },
}
