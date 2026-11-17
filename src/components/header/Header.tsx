import Link from 'next/link'
import { Children, ReactNode, ReactElement } from 'react'

import { Logo } from '@/components/Logo'
import type { Variant } from '@/types'

interface NavItem {
  label: string
  href: string
}

interface VariantClasses {
  header: string
  container: string
  innerWrapper: string
  leftSection: string
  logo: string
  nav: string
  link: string
  centerSection: string
  rightSection: string
}

const VARIANT_CLASSES: Record<Variant, VariantClasses> = {
  standard: {
    header: 'bg-background border-b border-border',
    container: 'container mx-auto px-6 py-3',
    innerWrapper:
      'grid grid-cols-[1fr_auto] md:grid-cols-[1fr_minmax(0,2fr)_1fr] items-center gap-x-4 gap-y-2.5',
    leftSection: 'flex items-center',
    logo: '',
    nav: 'hidden',
    link: '',
    centerSection:
      'flex justify-center w-full order-last col-span-2 md:order-0 md:col-span-1',
    rightSection: 'flex items-center gap-2 justify-end',
  },
  editorial: {
    header: 'border-border bg-background border-b',
    container: 'container mx-auto px-4 py-5',
    innerWrapper:
      'grid grid-cols-[1fr_auto] md:grid-cols-[1fr_minmax(0,2fr)_1fr] items-center gap-x-4 gap-y-2.5',
    leftSection: 'flex items-center',
    logo: 'font-secondary text-2xl tracking-[0.3em] uppercase',
    nav: 'absolute left-1/2 -translate-x-1/2 flex items-center gap-8',
    link: 'text-xs tracking-widest uppercase hover:text-primary transition-colors',
    centerSection:
      'flex justify-center w-full order-last col-span-2 md:order-0 md:col-span-1',
    rightSection: 'flex items-center gap-4 justify-end',
  },
}

interface MainNavProps {
  items?: NavItem[]
  basePath?: string
  children?: ReactNode
}

const MainNav = ({ items = [], basePath = '', children }: MainNavProps) => (
  <>
    {items.map((item) => (
      <Link key={item.label} href={`${basePath}${item.href}`}>
        {item.label}
      </Link>
    ))}
    {children}
  </>
)

interface CenterSectionProps {
  children: ReactNode
}

const CenterSection = ({ children }: CenterSectionProps) => <>{children}</>

interface RightSectionProps {
  children: ReactNode
}

const RightSection = ({ children }: RightSectionProps) => <>{children}</>

interface HeaderProps {
  variant: Variant
  logo: string
  basePath: string
  children: ReactNode
}

export const Header = ({ variant, logo, basePath, children }: HeaderProps) => {
  const classes = VARIANT_CLASSES[variant]

  let mainNavElement: ReactElement<MainNavProps> | null = null
  let centerSectionElement: ReactElement<CenterSectionProps> | null = null
  let rightSectionElement: ReactElement<RightSectionProps> | null = null

  Children.forEach(children, (child) => {
    if (child && typeof child === 'object' && 'type' in child) {
      if (child.type === MainNav) {
        mainNavElement = child as ReactElement<MainNavProps>
      }
      if (child.type === CenterSection) {
        centerSectionElement = child as ReactElement<CenterSectionProps>
      }
      if (child.type === RightSection) {
        rightSectionElement = child as ReactElement<RightSectionProps>
      }
    }
  })

  return (
    <header className={classes.header}>
      <div className={classes.container}>
        <div className={classes.innerWrapper}>
          <div className={classes.leftSection}>
            <Logo src={logo} href={basePath} className={classes.logo} />
            <nav className={classes.nav}>{mainNavElement}</nav>
          </div>
          <div className={classes.centerSection}>{centerSectionElement}</div>
          <div className={classes.rightSection}>{rightSectionElement}</div>
        </div>
      </div>
    </header>
  )
}

Header.MainNav = MainNav
Header.CenterSection = CenterSection
Header.RightSection = RightSection
