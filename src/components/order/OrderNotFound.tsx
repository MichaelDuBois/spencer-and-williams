import Link from 'next/link'

type Variant = 'standard' | 'editorial'

interface OrderNotFoundProps {
  variant: Variant
  continueShoppingHref: string
}

interface VariantClasses {
  wrapper: string
  title: string
  description: string
  link: string
}

const VARIANT_CLASSES: Record<Variant, VariantClasses> = {
  standard: {
    wrapper: 'container mx-auto px-4 py-16 text-center',
    title: 'mb-4 text-2xl font-bold',
    description: 'text-muted-foreground mb-6',
    link: 'text-primary hover:underline',
  },
  editorial: {
    wrapper: 'container mx-auto px-4 py-24 text-center',
    title: 'mb-4 font-secondary text-2xl tracking-[0.15em] uppercase',
    description: 'text-muted-foreground mb-8 text-sm',
    link: 'text-xs tracking-widest uppercase underline underline-offset-4 transition-opacity hover:opacity-70',
  },
}

export const OrderNotFound = ({
  variant,
  continueShoppingHref,
}: OrderNotFoundProps) => {
  const classes = VARIANT_CLASSES[variant]

  return (
    <div className={classes.wrapper}>
      <h1 className={classes.title}>Order Not Found</h1>
      <p className={classes.description}>
        We couldn&apos;t find this order. It may have expired.
      </p>
      <Link href={continueShoppingHref} className={classes.link}>
        Continue Shopping
      </Link>
    </div>
  )
}
