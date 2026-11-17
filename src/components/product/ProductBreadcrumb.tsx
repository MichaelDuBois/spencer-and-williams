import Link from 'next/link'
import { Fragment } from 'react'

type BreadcrumbVariant = 'standard' | 'editorial'

interface ProductBreadcrumbProps {
  slug: string
  searchLabel: string
  productName: string
  homeLabel?: string
  variant?: BreadcrumbVariant
  categories?: { label: string; href: string }[]
}

const VARIANT_CLASSES: Record<
  BreadcrumbVariant,
  { nav: string; separator: string; link: string; current: string }
> = {
  standard: {
    nav: 'text-muted-foreground mb-6 text-sm',
    separator: 'mx-2',
    link: 'hover:text-accent transition-colors',
    current: 'text-foreground inline-block max-w-50 truncate align-bottom',
  },
  editorial: {
    nav: 'text-muted-foreground mb-12 text-xs tracking-widest uppercase',
    separator: 'mx-3',
    link: 'hover:text-foreground transition-colors',
    current: 'text-foreground',
  },
}

export const ProductBreadcrumb = ({
  slug,
  searchLabel,
  productName,
  homeLabel = 'Home',
  variant = 'standard',
  categories,
}: ProductBreadcrumbProps) => {
  const classes = VARIANT_CLASSES[variant]
  const crumbs =
    categories && categories.length > 0
      ? categories
      : [{ label: searchLabel, href: `/${slug}/search` }]

  return (
    <nav className={classes.nav}>
      <Link href={`/${slug}`} className={classes.link}>
        {homeLabel}
      </Link>
      {crumbs.map(({ label, href }) => (
        <Fragment key={href}>
          <span className={classes.separator}>/</span>
          <Link href={href} className={classes.link}>
            {label}
          </Link>
        </Fragment>
      ))}
      <span className={classes.separator}>/</span>
      <span className={classes.current}>{productName}</span>
    </nav>
  )
}
