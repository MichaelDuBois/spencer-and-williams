'use client'

import { useStats } from 'react-instantsearch'

import { cn } from '@/lib/utils'
import type { Variant } from '@/types'

const VARIANT_CLASSES: Record<
  Variant,
  { wrapper: string; heading: string; count: string }
> = {
  standard: {
    wrapper: 'mb-6 flex items-baseline gap-3',
    heading: 'text-foreground text-3xl font-bold',
    count: 'text-muted-foreground text-sm',
  },
  editorial: {
    wrapper: 'mb-8 flex items-baseline gap-3',
    heading:
      'text-muted-foreground font-secondary text-xl tracking-[0.15em] uppercase',
    count: 'text-muted-foreground mt-4 text-sm',
  },
}

interface SearchResultsHeaderProps {
  label: string
  /**
   * The surface the results are narrowed to. Named in the query heading so a
   * category page reads as a search within that category, not across the index.
   */
  scope?: string
  showResultCount?: boolean
  variant?: Variant
  className?: string
  headingClassName?: string
}

export const SearchResultsHeader = ({
  label,
  scope,
  showResultCount = false,
  variant = 'standard',
  className,
  headingClassName,
}: SearchResultsHeaderProps) => {
  const { query, nbHits } = useStats()
  const classes = VARIANT_CLASSES[variant]

  return (
    <div className={cn(classes.wrapper, className)}>
      <h1 className={cn(classes.heading, headingClassName)}>
        {getHeading({ query, label, scope })}
      </h1>
      {showResultCount && <p className={cn(classes.count)}>{nbHits} results</p>}
    </div>
  )
}

interface GetHeadingArgs {
  query: string
  label: string
  scope?: string
}

const getHeading = ({ query, label, scope }: GetHeadingArgs): string => {
  if (!query) return label
  if (!scope) return `Results for "${query}"`

  return `Results for "${query}" in ${scope}`
}
