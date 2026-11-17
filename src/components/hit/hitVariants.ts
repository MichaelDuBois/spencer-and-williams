import type { Variant, VariantClasses } from '@/components/hit/hit.types'

export const VARIANT_CLASSES: Record<Variant, VariantClasses> = {
  standard: {
    actionContainer: 'px-4 pb-4',
    article:
      'group rounded-card border-border bg-muted flex h-full w-full flex-col overflow-hidden border transition-shadow duration-200 hover:shadow-lg',
    composedArticle: 'border-accent',
    imageContainer: 'bg-card h-64 w-full p-6',
    image: 'h-full w-full object-contain',
    contentContainer: 'flex flex-1 flex-col p-4',
    brand: 'text-muted-foreground text-xs font-medium tracking-wide uppercase',
    name: 'text-foreground mt-1 line-clamp-1 font-semibold',
    category: 'text-muted-foreground mt-0.5 line-clamp-1 text-sm',
    rating: 'mt-2 flex items-center gap-1 text-sm',
    footer: 'mt-3 flex items-center',
    price: 'text-foreground font-bold',
    addToCartConfig: { compact: true, className: 'ml-auto' },
    forYouBadge:
      'bg-accent/15 text-accent ring-accent/25 absolute top-2 left-2 z-10 rounded-full px-2 py-0.5 text-micro font-medium tracking-wide ring-1 backdrop-blur-md',
  },
  'b2b-warehouse': {
    actionContainer: 'px-4 pb-4',
    article:
      'group rounded-card border-border bg-muted flex h-full w-full flex-col overflow-hidden border transition-shadow duration-200 hover:shadow-lg',
    composedArticle: 'border-accent',
    imageContainer: 'bg-card h-64 w-full p-6',
    image: 'h-full w-full object-contain',
    contentContainer: 'flex flex-1 flex-col p-4',
    brand: 'text-muted-foreground text-xs font-medium tracking-wide uppercase',
    name: 'text-foreground mt-1 line-clamp-2 font-semibold',
    category: 'text-muted-foreground mt-0.5 line-clamp-1 text-sm',
    rating: 'mt-2 flex items-center gap-1 text-sm',
    footer: 'mt-auto flex items-center pt-3',
    price: 'text-foreground font-bold',
    addToCartConfig: { compact: true, className: 'ml-auto' },
    forYouBadge:
      'bg-accent/15 text-accent ring-accent/25 absolute top-2 left-2 z-10 rounded-full px-2 py-0.5 text-micro font-medium tracking-wide ring-1 backdrop-blur-md',
  },
  grocery: {
    actionContainer: 'px-4 pb-4',
    article:
      'group rounded-card border-border bg-card flex h-full w-full flex-col overflow-hidden border transition-shadow duration-200 hover:shadow-md',
    composedArticle: 'border-accent',
    sponsoredArticle: 'border-2 border-accent',
    imageContainer: 'h-40 w-full p-4',
    image: 'h-full w-full object-contain',
    contentContainer: 'flex flex-1 flex-col p-3',
    brand: 'text-muted-foreground text-xs font-medium tracking-wide uppercase',
    name: 'text-foreground mt-0.5 line-clamp-2 text-sm font-medium leading-snug',
    servingSize: 'text-muted-foreground mt-2 text-xs',
    price: 'text-foreground text-lg font-bold',
    footer: 'mt-auto pt-3',
    addToCartConfig: {
      label: 'Add',
      showIcon: false,
      animated: false,
      className: 'mt-2 rounded-md',
    },
    forYouBadge:
      'bg-accent/15 text-accent ring-accent/25 absolute top-2 left-2 z-10 rounded-full px-2 py-0.5 text-micro font-medium tracking-wide ring-1 backdrop-blur-md',
  },
  editorial: {
    actionContainer: 'px-2 pt-2 pb-2 text-center',
    article: 'group',
    composedArticle: 'flex h-full flex-col border border-accent pb-4',
    composedImageContainer: 'px-4',
    imageContainer: 'relative aspect-3/4 overflow-hidden',
    image:
      'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105',
    contentContainer: 'mt-4 px-2 text-center',
    brand: 'text-muted-foreground text-xs tracking-widest uppercase',
    name: 'mt-1 font-secondary text-sm',
    price: 'mt-2 text-sm',
    variantRow: 'mt-3 flex items-center justify-center gap-2 px-2',
    forYouBadge:
      'text-accent absolute top-3 left-3 z-10 text-micro tracking-widest uppercase italic',
  },
}
