'use client'

import { ReceiptText } from 'lucide-react'
import Link from 'next/link'

import { CartItemCard } from '@/components/cart/CartItemCard'
import type { CartPageContentProps } from '@/components/cart/CartPageContent/cartPageContent.types'
import { VARIANT_CLASSES } from '@/components/cart/CartPageContent/cartPageContentVariants'
import { ProductRecommend } from '@/components/recommend/ProductRecommend'
import { Button } from '@/components/ui/button/Button'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useCart } from '@/hooks/useCart'
import { useCheckout } from '@/hooks/useCheckout'

export const CartPageContent = ({
  variant,
  basePath,
  recommendRenderItem,
  recommendVariant,
  recommendQueryOptions,
}: CartPageContentProps) => {
  const { items, totalItems, totalPrice, updateQuantity, removeItem } =
    useCart()
  const { checkout, canCheckout } = useCheckout(basePath)
  const config = useActiveConfig()
  const showOrderHistoryLink = config?.features?.orderHistory?.enabled ?? false
  const classes = VARIANT_CLASSES[variant]
  const isEditorial = variant === 'editorial'
  const isEmpty = items.length === 0

  const emptyState = (
    <div className={classes.emptyWrapper}>
      <p className={classes.emptyMessage}>
        {isEditorial ? 'Your shopping bag is empty.' : 'Your cart is empty.'}
      </p>
      <Link
        href={`${basePath}/search`}
        className={classes.continueShoppingLink}>
        Continue Shopping
      </Link>
      {isEditorial && showOrderHistoryLink && (
        <div>
          <Link
            href={`${basePath}/orders`}
            className={classes.orderHistoryLink}>
            View order history
          </Link>
        </div>
      )}
    </div>
  )

  const itemsList = (
    <div className={classes.itemsWrapper || undefined}>
      {items.map((item) => (
        <CartItemCard
          key={item.objectID}
          variant={variant}
          item={item}
          onUpdateQuantity={updateQuantity}
          onRemove={removeItem}
        />
      ))}
    </div>
  )

  const orderSummary = (
    <div className="lg:col-span-1">
      <div className={classes.summaryCard}>
        <h2 className={classes.summaryHeading}>Order Summary</h2>
        <div className={classes.summaryDetails}>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {isEditorial
                ? `Subtotal (${totalItems} ${totalItems === 1 ? 'item' : 'items'})`
                : 'Subtotal'}
            </span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span className={classes.shippingValue || undefined}>
              {isEditorial
                ? 'Complimentary'
                : isEmpty
                  ? 'Calculated at checkout'
                  : 'Free'}
            </span>
          </div>
          <div className={classes.totalRow}>
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </div>
        <Button
          onClick={checkout}
          disabled={!canCheckout}
          className={classes.checkoutButton}>
          {isEditorial ? 'Proceed to Checkout' : 'Checkout'}
        </Button>
        {showOrderHistoryLink && (
          <Button
            asChild
            variant="secondary"
            className={`${classes.checkoutButton ?? ''} hover:bg-accent hover:text-accent-foreground mt-3 w-full`}>
            <Link href={`${basePath}/orders`}>
              <ReceiptText className="h-4 w-4" />
              View order history
            </Link>
          </Button>
        )}
      </div>
    </div>
  )

  const recommendSection = !isEmpty && (
    <ProductRecommend
      section="cart"
      queryOptions={recommendQueryOptions}
      objectID={items[0].objectID}
      className="mt-16 space-y-16"
      variant={recommendVariant}
      renderItem={recommendRenderItem}
    />
  )

  // Editorial: empty state replaces the entire grid
  if (isEditorial) {
    if (isEmpty) return emptyState
    return (
      <>
        <div className={classes.grid}>
          <div className="lg:col-span-2">{itemsList}</div>
          {orderSummary}
        </div>
        {recommendSection}
      </>
    )
  }

  // Standard: empty state sits inside the grid, summary always visible
  return (
    <>
      <div className={classes.grid}>
        <div className="lg:col-span-2">{isEmpty ? emptyState : itemsList}</div>
        {orderSummary}
      </div>
      {recommendSection}
    </>
  )
}
