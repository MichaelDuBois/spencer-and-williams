export interface ProductPriceQuote {
  basePrice: number
  customerPrice: number
  discountAmount: number
}

export type ProductPriceResolver = (
  basePrice: number | undefined,
) => ProductPriceQuote | undefined

export interface ProductPriceProps {
  price?: number
  className?: string
}
