import Link from 'next/link'

type Variant = 'standard' | 'editorial'

interface OrderContinueShoppingProps {
  variant: Variant
  continueShoppingHref: string
}

interface VariantClasses {
  wrapper: string
  message: string
  link: string
}

const VARIANT_CLASSES: Record<Variant, VariantClasses> = {
  standard: {
    wrapper: 'border-border mt-10 border-t pt-8 text-center',
    message: 'text-muted-foreground mb-4 text-sm',
    link: 'text-primary inline-block text-sm hover:underline',
  },
  editorial: {
    wrapper: 'border-border/30 mt-16 border-t pt-12 text-center',
    message: 'text-muted-foreground mb-6 text-sm',
    link: 'inline-block text-xs tracking-widest uppercase underline underline-offset-4 transition-opacity hover:opacity-70',
  },
}

export const OrderContinueShopping = ({
  variant,
  continueShoppingHref,
}: OrderContinueShoppingProps) => {
  const classes = VARIANT_CLASSES[variant]

  return (
    <div className={classes.wrapper}>
      <p className={classes.message}>
        A confirmation has been sent to your inbox.
      </p>
      <Link href={continueShoppingHref} className={classes.link}>
        Continue Shopping
      </Link>
    </div>
  )
}
