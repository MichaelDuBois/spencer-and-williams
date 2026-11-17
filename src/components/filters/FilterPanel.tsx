'use client'

import { SlidersHorizontal, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { ClearAllButton } from '@/components/filters/ClearAllButton'
import { CurrentRefinements } from '@/components/filters/CurrentRefinements'
import { Button } from '@/components/ui/button/Button'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { DURATION_NORMAL, EASE_SMOOTH } from '@/lib/animations'
import { cn } from '@/lib/utils'
import type { FacetConfig } from '@/types'

interface FilterPanelProps {
  children: React.ReactNode
  className?: string
  facets?: FacetConfig[]
  collapsible?: boolean
  isOpen?: boolean
  onToggle?: () => void
}

export const FilterPanel = ({
  children,
  className,
  facets,
  collapsible,
  isOpen,
  onToggle,
}: FilterPanelProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const isDesktopExpanded = !collapsible || isOpen

  useBodyScrollLock(isMobileOpen)

  return (
    <>
      {/* Mobile: trigger button */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          className="group rounded-button mb-2 w-full"
          onClick={() => setIsMobileOpen(true)}>
          <SlidersHorizontal className="text-accent h-4 w-4 group-hover:text-white" />
          Filters
        </Button>
        <div className="mt-3">
          <CurrentRefinements facets={facets} />
        </div>
      </div>

      {/* Mobile: backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            key="filter-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION_NORMAL, ease: EASE_SMOOTH }}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop: grid sidebar / Mobile: slide-in panel */}
      <aside
        className={cn(
          'lg:min-w-0',
          'max-lg:bg-background max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50 max-lg:w-full max-lg:overflow-y-auto max-lg:p-6 max-lg:shadow-xl',
          'max-lg:transition-transform max-lg:duration-200 max-lg:ease-out',
          isMobileOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full',
          className,
        )}>
        {/* Mobile header */}
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="text-lg font-medium">Filters</span>
          </div>
          <div className="flex items-center gap-3">
            <ClearAllButton />
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="text-muted-foreground hover:text-foreground -mr-2 cursor-pointer rounded-full p-2 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          className={cn(
            'lg:sticky lg:top-4 lg:transition-opacity lg:duration-300',
            isDesktopExpanded
              ? 'lg:opacity-100'
              : 'lg:pointer-events-none lg:opacity-0',
          )}>
          {/* Desktop header */}
          <div className="mt-1 mb-4 flex items-center justify-between max-lg:hidden">
            {collapsible ? (
              <button
                type="button"
                onClick={onToggle}
                className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-2 text-xs tracking-widest uppercase transition-colors">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span className="text-foreground">Filters</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="font-medium">Filters</span>
              </div>
            )}
            <ClearAllButton variant={collapsible ? 'editorial' : 'standard'} />
          </div>

          <CurrentRefinements
            facets={facets}
            variant={collapsible ? 'editorial' : 'standard'}
          />
          {children}
        </div>
      </aside>
    </>
  )
}
