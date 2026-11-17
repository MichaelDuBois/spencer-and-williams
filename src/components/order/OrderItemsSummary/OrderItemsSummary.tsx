import { Image } from '@/components/image/Image'
import type { OrderItemsSummaryProps } from '@/components/order/OrderItemsSummary/orderItemsSummary.types'
import { VARIANT_CLASSES } from '@/components/order/OrderItemsSummary/orderItemsSummaryVariants'

export const OrderItemsSummary = ({
  variant,
  order,
}: OrderItemsSummaryProps) => {
  const classes = VARIANT_CLASSES[variant]
  const sectionTitle =
    variant === 'editorial' ? 'Order Details' : 'Order Summary'

  return (
    <div className={classes.wrapper}>
      <h2 className={classes.title}>{sectionTitle}</h2>

      <div className={classes.itemsList}>
        {order.items.map((item) => (
          <div key={item.objectID} className={classes.item}>
            <div className={classes.thumbnail}>
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="96px"
                className={classes.thumbnailImg}
              />
            </div>

            {variant === 'editorial' ? (
              <div className={classes.details}>
                <div>
                  {item.brand && <p className={classes.brand}>{item.brand}</p>}
                  <h3 className={classes.name}>{item.name}</h3>
                  <p className={classes.quantity}>Qty {item.quantity}</p>
                </div>
                <p className={classes.price}>
                  ${((item.price ?? 0) * item.quantity).toFixed(2)}
                </p>
              </div>
            ) : (
              <>
                <div className={classes.details}>
                  <p className={classes.name}>{item.name}</p>
                  {item.brand && <p className={classes.brand}>{item.brand}</p>}
                  <p className={classes.quantity}>Qty: {item.quantity}</p>
                </div>
                <div className={classes.price}>
                  <p>${((item.price ?? 0) * item.quantity).toFixed(2)}</p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className={classes.totals}>
        <div className={classes.totalsRow}>
          <span className={classes.totalsLabel}>Subtotal</span>
          <span className={classes.totalsValue}>
            ${order.subtotal.toFixed(2)}
          </span>
        </div>
        <div className={classes.totalsRow}>
          <span className={classes.totalsLabel}>Shipping</span>
          <span className={classes.shippingValue}>
            {order.shipping === 0
              ? classes.freeShippingLabel
              : `$${order.shipping.toFixed(2)}`}
          </span>
        </div>
        <div className={classes.totalsTotalRow}>
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
