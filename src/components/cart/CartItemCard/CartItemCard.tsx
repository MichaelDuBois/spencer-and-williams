'use client'

import { Minus, Plus, Trash2 } from 'lucide-react'

import type { CartItemCardProps } from '@/components/cart/CartItemCard/cartItemCard.types'
import { VARIANT_CLASSES } from '@/components/cart/CartItemCard/cartItemCardVariants'
import { Image } from '@/components/image/Image'

export const CartItemCard = ({
  variant,
  item,
  priceContent,
  statusContent,
  onUpdateQuantity,
  onRemove,
}: CartItemCardProps) => {
  const classes = VARIANT_CLASSES[variant]
  const isEditorial = variant === 'editorial'
  const lineTotal = `$${((item.price ?? 0) * item.quantity).toFixed(2)}`

  return (
    <div className={classes.wrapper}>
      {/* Image */}
      <div className={classes.imageWrapper}>
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(min-width: 640px) 128px, 96px"
          className={classes.image}
        />
      </div>

      {/* Details */}
      <div className={classes.details}>
        <div className={classes.topRow}>
          <div>
            {item.brand && <p className={classes.brand}>{item.brand}</p>}
            <h3 className={classes.name}>{item.name}</h3>
          </div>
          {isEditorial ? (
            <p className={classes.price}>{priceContent ?? lineTotal}</p>
          ) : (
            <button
              type="button"
              onClick={() => onRemove(item.objectID)}
              className={classes.removeButton}
              aria-label="Remove item">
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>

        {statusContent}
        <div className={classes.bottomRow}>
          {/* Quantity controls */}
          <div className={classes.quantityWrapper}>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.objectID, item.quantity - 1)}
              className={classes.quantityButton}
              aria-label="Decrease quantity">
              {isEditorial ? '−' : <Minus className="h-4 w-4" />}
            </button>
            <span className={classes.quantityDisplay}>{item.quantity}</span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.objectID, item.quantity + 1)}
              className={classes.quantityButton}
              aria-label="Increase quantity">
              {isEditorial ? '+' : <Plus className="h-4 w-4" />}
            </button>
          </div>

          {isEditorial ? (
            <button
              type="button"
              onClick={() => onRemove(item.objectID)}
              className={classes.removeButton}>
              Remove
            </button>
          ) : (
            <p className={classes.price}>{priceContent ?? lineTotal}</p>
          )}
        </div>
      </div>
    </div>
  )
}
