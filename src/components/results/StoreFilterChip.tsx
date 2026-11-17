'use client'

import { X } from 'lucide-react'
import Link from 'next/link'

import { getLocatorNoun } from '@/components/storeLocator/getLocatorNoun'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useStoreIdFilter } from '@/hooks/useStoreIdFilter'
import { cn } from '@/lib/utils'
import type { Variant } from '@/types'
import { getLocationName } from '@/types/location.types'

interface StoreFilterChipProps {
  variant?: Variant
}

const VARIANT_CLASSES = {
  standard: {
    badge: 'bg-muted flex items-center gap-1 rounded-full px-3 py-1 text-sm',
    label: 'text-muted-foreground capitalize',
    value: 'text-foreground',
    icon: 'text-muted-foreground hover:text-foreground h-3.5 w-3.5',
  },
  editorial: {
    badge:
      'bg-muted flex items-center gap-1 rounded-full px-2.5 py-1 text-xs tracking-wide',
    label: 'text-muted-foreground uppercase',
    value: 'text-foreground',
    icon: 'text-muted-foreground hover:text-foreground h-3 w-3',
  },
} as const

export const StoreFilterChip = ({
  variant = 'standard',
}: StoreFilterChipProps = {}) => {
  const { storeId, store, clear } = useStoreIdFilter()
  const config = useActiveConfig()
  if (!storeId || !config) return null

  const { singular } = getLocatorNoun(config)
  const name = store
    ? getLocationName(store, config.slug)
    : `Unknown ${singular}`
  const classes = VARIANT_CLASSES[variant]

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <div className={classes.badge}>
        <span className={classes.label}>{singular}:</span>
        <Link
          href={`/${config.slug}/stores?storeId=${encodeURIComponent(storeId)}`}
          className={cn(classes.value, 'hover:underline')}>
          {name}
        </Link>
        <button
          type="button"
          onClick={clear}
          aria-label={`Clear ${singular} filter`}
          className="hover:text-accent ml-1 cursor-pointer transition-colors">
          <X className={classes.icon} />
        </button>
      </div>
    </div>
  )
}
