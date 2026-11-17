import type { FurnishingProductHitValues } from '@/app/furnishing/hitValues.types'

interface FurnishingStyleBadgesProps {
  product: FurnishingProductHitValues
}

export const FurnishingStyleBadges = ({
  product,
}: FurnishingStyleBadgesProps) => {
  const badges = [product.style, product.productType].filter(
    (badge): badge is string => Boolean(badge),
  )

  if (badges.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <span
          key={badge}
          className="bg-accent/10 text-accent rounded-badge inline-flex items-center px-2.5 py-1 text-xs font-medium">
          {badge}
        </span>
      ))}
    </div>
  )
}
