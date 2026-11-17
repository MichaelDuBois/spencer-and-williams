import type {
  Variant,
  VariantClasses,
} from '@/components/order/DeliveryTracker/deliveryTracker.types'

export const VARIANT_CLASSES: Record<Variant, VariantClasses> = {
  standard: {
    wrapper: 'border-border bg-card rounded-card border p-6',
    header: 'mb-6 flex items-center gap-2',
    title: 'text-lg font-semibold',
    headerIcon: 'text-primary h-5 w-5',
    progressTrackInset: 'right-6 left-6',
    progressFillInset: 'left-6',
    progressTrackThickness: 'h-0.5',
    progressTrackBg: 'bg-muted',
    progressFillBg: 'bg-primary',
    stepIconSize: 'h-4 w-4',
    circle:
      'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
    circleCompleted: 'border-primary bg-primary text-primary-foreground',
    circleIncomplete: 'border-border bg-background text-muted-foreground',
    label: 'mt-2 text-sm font-medium',
    labelCompleted: 'text-foreground',
    labelIncomplete: 'text-muted-foreground',
    date: 'text-muted-foreground text-xs',
    link: 'text-primary mt-6 block text-center text-sm hover:underline',
  },
  editorial: {
    wrapper: 'mt-12',
    header: '',
    title: 'mb-8 text-xs tracking-widest uppercase',
    headerIcon: '',
    progressTrackInset: 'right-8 left-8',
    progressFillInset: 'left-8',
    progressTrackThickness: 'h-px',
    progressTrackBg: 'bg-border/50',
    progressFillBg: 'bg-foreground',
    stepIconSize: 'h-3.5 w-3.5',
    circle:
      'flex h-10 w-10 items-center justify-center rounded-full border transition-colors',
    circleCompleted: 'border-foreground bg-foreground text-background',
    circleIncomplete: 'border-border/60 bg-background text-muted-foreground',
    label: 'mt-4 text-micro tracking-widest uppercase',
    labelCompleted: 'text-foreground',
    labelIncomplete: 'text-muted-foreground',
    date: 'text-muted-foreground mt-1 text-micro tracking-widest',
    link: 'mt-10 block text-center text-xs tracking-widest uppercase underline underline-offset-4 transition-opacity hover:opacity-70',
  },
}
