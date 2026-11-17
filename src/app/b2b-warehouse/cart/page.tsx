'use client'

import Link from 'next/link'

import { B2BHit } from '@/app/b2b-warehouse/_components/B2BHit'
import { useB2BCart } from '@/app/b2b-warehouse/_hooks/useB2BCart'
import { useB2BProductHitOptions } from '@/app/b2b-warehouse/_hooks/useB2BProductHitOptions'
import { getB2BWarehouseProductHitValues } from '@/app/b2b-warehouse/_utils/getB2BWarehouseProductHitValues'
import { b2bWarehouseConfig } from '@/app/b2b-warehouse/config'
import { CartItemCard } from '@/components/cart/CartItemCard'
import { ProductRecommend } from '@/components/recommend/ProductRecommend'
import { Button } from '@/components/ui/button/Button'
import { useCheckout } from '@/hooks/useCheckout'

const LINE_STATUS = {
  eligible: '',
  unavailable:
    'Unavailable for your current customer group or warehouse. Remove this item or change your selection.',
  unpriced: 'Price unavailable. Remove this item to continue.',
  'invalid-quantity': 'Choose a smaller quantity to continue.',
}

const B2BWarehouseCartPage = () => {
  const cart = useB2BCart()
  const queryOptions = useB2BProductHitOptions()
  const { checkout, canCheckout } = useCheckout(
    '/b2b-warehouse',
    cart.checkoutOptions,
  )
  const hasItems = cart.items.length > 0
  const total = !hasItems
    ? '$0.00'
    : cart.isReady && Number.isSafeInteger(cart.quote.subtotalCents)
      ? `$${(cart.quote.subtotalCents / 100).toFixed(2)}`
      : '—'
  const notice = cart.isInvalid
    ? 'Choose a valid customer group and warehouse to continue.'
    : cart.isError
      ? 'Unable to check cart availability. Retry or remove items.'
      : !cart.isReady
        ? 'Checking prices and availability…'
        : !canCheckout
          ? 'Resolve the unavailable items before checkout. The subtotal includes eligible items only.'
          : null

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">
        Shopping Cart {hasItems && `(${cart.totalItems})`}
      </h1>
      {hasItems && notice && (
        <div role="status" className="bg-muted mb-4 rounded-lg p-4">
          <p>{notice}</p>
          {cart.isError && (
            <Button
              variant="secondary"
              onClick={() => void cart.retry()}
              className="mt-2">
              Retry availability check
            </Button>
          )}
        </div>
      )}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {!hasItems && (
            <div className="border-border bg-card rounded-card border p-8 text-center">
              <p>Your cart is empty.</p>
              <Link
                href="/b2b-warehouse/search"
                className="mt-4 inline-block underline">
                Continue Shopping
              </Link>
            </div>
          )}
          {cart.quote.lines.map((line) => (
            <CartItemCard
              key={line.item.objectID}
              variant="standard"
              item={line.item}
              onUpdateQuantity={cart.updateQuantity}
              onRemove={cart.removeItem}
              statusContent={
                cart.isReady && line.status !== 'eligible' ? (
                  <p className="text-destructive text-sm">
                    {LINE_STATUS[line.status]}
                  </p>
                ) : undefined
              }
              priceContent={
                line.price && line.lineTotalCents !== undefined ? (
                  <span className="inline-flex flex-wrap items-baseline gap-2">
                    {line.price.discountUnitCents > 0 && (
                      <del className="text-muted-foreground text-sm font-normal">
                        $
                        {(
                          (line.price.baseUnitCents * line.item.quantity) /
                          100
                        ).toFixed(2)}
                      </del>
                    )}
                    <span>${(line.lineTotalCents / 100).toFixed(2)}</span>
                  </span>
                ) : (
                  <span>—</span>
                )
              }
            />
          ))}
        </div>
        <div className="border-border bg-card rounded-card h-fit space-y-4 border p-6">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{total}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{hasItems ? 'Free' : 'Calculated at checkout'}</span>
          </div>
          <div className="border-border flex justify-between border-t pt-4 font-bold">
            <span>Total</span>
            <span>{total}</span>
          </div>
          <Button className="w-full" disabled={!canCheckout} onClick={checkout}>
            Checkout
          </Button>
          {b2bWarehouseConfig.features.orderHistory?.enabled && (
            <Button asChild variant="secondary" className="w-full">
              <Link href="/b2b-warehouse/orders">View order history</Link>
            </Button>
          )}
        </div>
      </div>
      {hasItems && (
        <ProductRecommend
          section="cart"
          objectID={cart.items[0].objectID}
          queryOptions={queryOptions}
          className="mt-16 space-y-16"
          renderItem={(hit) => (
            <B2BHit
              variant="standard"
              item={hit}
              template={b2bWarehouseConfig.algolia.primaryIndex.template}
              slug="b2b-warehouse"
              extractor={getB2BWarehouseProductHitValues}
            />
          )}
        />
      )}
    </div>
  )
}

export default B2BWarehouseCartPage
