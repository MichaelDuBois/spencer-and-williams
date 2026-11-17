export type ProductCardSkeletonVariant = 'card' | 'grocery' | 'fashion'

interface ProductCardSkeletonProps {
  /** Matches the card layout of the vertical it stands in for. */
  variant?: ProductCardSkeletonVariant
}

export const ProductCardSkeleton = ({
  variant = 'card',
}: ProductCardSkeletonProps) => {
  if (variant === 'fashion') {
    return (
      <div className="w-40 shrink-0 animate-pulse">
        <div className="bg-background rounded-image aspect-3/4 w-full" />
        <div className="mt-4 space-y-1.5 text-center">
          <div className="bg-background mx-auto h-2.5 w-16" />
          <div className="bg-background mx-auto h-3 w-24" />
          <div className="bg-background mx-auto h-3 w-12" />
        </div>
      </div>
    )
  }

  if (variant === 'grocery') {
    return (
      <div className="border-border rounded-card w-40 shrink-0 animate-pulse overflow-hidden border">
        <div className="bg-card h-40 w-full" />
        <div className="space-y-1.5 p-3">
          <div className="bg-background/50 h-2.5 w-12 rounded" />
          <div className="bg-background/50 h-3.5 w-full rounded" />
          <div className="bg-background/50 h-4 w-14 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="border-border w-40 shrink-0 animate-pulse overflow-hidden rounded-lg border">
      <div className="bg-card h-40 w-full" />
      <div className="bg-muted space-y-1.5 p-3">
        <div className="bg-background/50 h-2.5 w-12 rounded" />
        <div className="bg-background/50 h-3 w-full rounded" />
        <div className="bg-background/50 h-3.5 w-14 rounded" />
      </div>
    </div>
  )
}
