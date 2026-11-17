'use client'

import { useSetAtom } from 'jotai'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useHierarchicalMenu } from 'react-instantsearch'

import {
  type DetectedCategory,
  useQueryCategories,
} from '@/hooks/useQueryCategories'
import { cn } from '@/lib/utils'
import { isFilterOpenAtom } from '@/stores/filterPanel'
import type { Variant } from '@/types'

const VARIANT_CLASSES: Record<
  Variant,
  { root: string; text: string; emphasis: string; cta: string }
> = {
  standard: {
    root: 'rounded-card border-border bg-muted/40 mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 border px-4 py-3 text-sm',
    text: 'text-muted-foreground',
    emphasis: 'text-foreground font-medium',
    cta: 'text-primary inline-flex items-center gap-1 font-medium hover:underline',
  },
  editorial: {
    root: 'border-border mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 border-y px-1 py-3 text-xs tracking-wide uppercase',
    text: 'text-muted-foreground',
    emphasis: 'text-foreground',
    cta: 'text-foreground inline-flex items-center gap-1 hover:opacity-70',
  },
}

interface QueryCatSuggestionProps {
  variant?: Variant
  className?: string
}

interface SuggestionBannerProps {
  category: DetectedCategory
  variant: Variant
  className?: string
}

const SuggestionBanner = ({
  category,
  variant,
  className,
}: SuggestionBannerProps) => {
  const setFilterOpen = useSetAtom(isFilterOpenAtom)
  const { items, refine } = useHierarchicalMenu({
    attributes: category.attributes,
  })

  const isAlreadyRefined = (function hasRefined(list: typeof items): boolean {
    return list.some(
      (item) =>
        (item.isRefined && item.value === category.value) ||
        (item.data ? hasRefined(item.data) : false),
    )
  })(items)

  if (isAlreadyRefined) return null

  const classes = VARIANT_CLASSES[variant]

  return (
    <div className={cn(classes.root, className)}>
      <Sparkles className="text-primary h-4 w-4 shrink-0" />
      <span className={classes.text}>Too many results? Search within</span>
      <span className={classes.emphasis}>{category.label}</span>
      <button
        type="button"
        onClick={() => {
          refine(category.value)
          setFilterOpen(true)
        }}
        className={cn('ml-auto cursor-pointer', classes.cta)}>
        Apply
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export const QueryCatSuggestion = ({
  variant = 'standard',
  className,
}: QueryCatSuggestionProps) => {
  const categories = useQueryCategories()
  const topCategory = categories[0]

  if (!topCategory) return null

  return (
    <SuggestionBanner
      category={topCategory}
      variant={variant}
      className={className}
    />
  )
}
