import type { FashionProductHitValues } from '@/app/fashion/hitValues.types'
import { StarRating } from '@/components/ui/StarRating'

interface ProductInfoProps {
  product: FashionProductHitValues
}

export const ProductInfo = ({ product }: ProductInfoProps) => {
  const { name, brand, price, description, rating, reviewsCount } = product

  return (
    <>
      {brand && (
        <p className="text-muted-foreground text-xs tracking-widest uppercase">
          {brand}
        </p>
      )}
      <h1 className="font-secondary mt-2 text-3xl">{name}</h1>

      {typeof rating === 'number' && (
        <StarRating
          className="mt-3"
          rating={rating}
          count={reviewsCount}
          showCount={typeof reviewsCount === 'number'}
        />
      )}

      {typeof price === 'number' && (
        <p className="mt-4 text-lg">${price.toFixed(2)}</p>
      )}

      {description && (
        <p className="text-muted-foreground mt-8 text-sm leading-relaxed">
          {description}
        </p>
      )}
    </>
  )
}
