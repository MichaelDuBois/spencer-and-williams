import type { VariantClasses } from '@/components/header/CategoryNav/categoryNav.types'
import type { Variant } from '@/types'

export const VARIANT_CLASSES: Record<Variant, VariantClasses> = {
  standard: {
    mobileWrapper: 'bg-background lg:hidden',
    desktopWrapper: 'bg-background max-lg:hidden',
    desktopList:
      '-ml-2 flex items-center overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    desktopLink:
      'group text-muted-foreground hover:text-foreground hover:font-medium inline-flex items-center px-2 py-2 text-sm font-medium whitespace-nowrap transition-colors',
    popoverHeading:
      'text-muted-foreground pt-1 pb-2 text-micro font-medium tracking-wider uppercase',
    panel: 'text-sm',
    columnHeader:
      'text-foreground hover:font-medium block text-sm font-medium transition-colors',
    childLink:
      'text-muted-foreground hover:text-foreground hover:font-medium block py-1 text-sm font-medium transition-colors',
    drawerLink:
      'text-foreground hover:text-accent block py-2 text-sm font-medium transition-colors',
  },
  editorial: {
    mobileWrapper: 'border-border bg-background border-b lg:hidden',
    desktopWrapper: 'border-border bg-background border-b max-lg:hidden',
    desktopList:
      'flex items-center justify-center gap-10 overflow-x-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    desktopLink:
      'text-muted-foreground hover:text-foreground hover:font-medium inline-flex items-center font-inter text-xs tracking-widest uppercase whitespace-nowrap transition-colors',
    popoverHeading:
      'text-muted-foreground pt-1 pb-2 font-inter text-micro tracking-widest uppercase',
    panel: 'font-inter',
    columnHeader:
      'text-foreground hover:font-bold block font-inter text-xs font-medium tracking-widest uppercase transition-colors',
    childLink:
      'text-muted-foreground hover:text-foreground hover:font-medium block py-1 font-inter text-xs tracking-widest uppercase transition-colors',
    drawerLink:
      'text-foreground hover:text-accent block py-2 font-inter text-xs tracking-widest uppercase transition-colors',
  },
}
