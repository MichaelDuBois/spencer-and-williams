import type { Variant } from '@/types'

interface FooterProps {
  variant: Variant
  name: string
  description: string
  sections: FooterSection[]
}

interface FooterSection {
  title: string
  items: string[]
}

interface VariantClasses {
  footer: string
  container: string
  grid: string
  brandTitle: string
  brandDescription: string
  sectionTitle: string
  list: string
  copyright: string
  copyrightText: string
}

const VARIANT_CLASSES: Record<Variant, VariantClasses> = {
  standard: {
    footer: 'border-border bg-muted border-t',
    container: 'container mx-auto px-4 py-8',
    grid: 'grid grid-cols-1 gap-8 md:grid-cols-4',
    brandTitle: 'mb-4 font-semibold',
    brandDescription: 'text-muted-foreground text-sm',
    sectionTitle: 'mb-4 font-medium',
    list: 'space-y-2',
    copyright:
      'border-border text-muted-foreground mt-8 border-t pt-8 text-center text-sm',
    copyrightText: '',
  },
  editorial: {
    footer: 'border-border bg-background border-t',
    container: 'container mx-auto px-4 py-16',
    grid: 'grid grid-cols-1 gap-12 md:grid-cols-4',
    brandTitle: 'font-secondary text-xl tracking-[0.2em] uppercase',
    brandDescription:
      'text-muted-foreground mt-4 max-w-sm text-sm leading-relaxed',
    sectionTitle: 'mb-6 text-xs tracking-widest uppercase',
    list: 'space-y-3',
    copyright: 'border-border/30 mt-16 border-t pt-8',
    copyrightText:
      'text-muted-foreground text-center text-xs tracking-widest uppercase',
  },
}

const FooterLink = ({ children }: { children: React.ReactNode }) => (
  <li className="hover:text-foreground cursor-pointer transition-colors">
    {children}
  </li>
)

const FooterSectionComponent = ({
  title,
  items,
  titleClassName,
  listClassName,
}: {
  title: string
  items: string[]
  titleClassName: string
  listClassName: string
}) => (
  <div>
    <h4 className={titleClassName}>{title}</h4>
    <ul className={`text-muted-foreground text-sm ${listClassName}`}>
      {items.map((item) => (
        <FooterLink key={item}>{item}</FooterLink>
      ))}
    </ul>
  </div>
)

export const Footer = ({
  variant,
  name,
  description,
  sections,
}: FooterProps) => {
  const classes = VARIANT_CLASSES[variant]

  return (
    <footer id="site-footer" className={classes.footer}>
      <div className={classes.container}>
        <div className={classes.grid}>
          <div className={variant === 'editorial' ? 'md:col-span-2' : ''}>
            <h3 className={classes.brandTitle}>{name}</h3>
            <p className={classes.brandDescription}>{description}</p>
          </div>
          {sections.map((section) => (
            <FooterSectionComponent
              key={section.title}
              title={section.title}
              items={section.items}
              titleClassName={classes.sectionTitle}
              listClassName={classes.list}
            />
          ))}
        </div>
        <div className={classes.copyright}>
          <p className={classes.copyrightText}>
            © 2026 {name} Demo for Algolia.
          </p>
        </div>
      </div>
    </footer>
  )
}
