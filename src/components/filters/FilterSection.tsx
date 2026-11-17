'use client'

import { Plus } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { RefinementList } from 'react-instantsearch'

import { transitionSlow, transitionSmooth } from '@/lib/animations'
import { cn } from '@/lib/utils'
import type { FacetComponentProps, Variant } from '@/types'

const VARIANT_CLASSES: Record<
  Variant,
  { title: string; list: string; label: string; count: string }
> = {
  standard: {
    title: 'text-foreground font-medium capitalize',
    list: 'space-y-3',
    label:
      'cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground group-has-checked:font-medium group-has-checked:text-foreground',
    count: 'text-xs ml-2 text-muted-foreground/70',
  },
  editorial: {
    title: 'text-muted-foreground text-xs tracking-widest uppercase',
    list: 'space-y-1.5',
    label:
      'cursor-pointer text-xs tracking-wide text-muted-foreground transition-colors hover:text-foreground group-has-checked:text-foreground',
    count: 'text-micro ml-2 text-muted-foreground/50',
  },
}

export const FilterSection = ({
  title,
  attribute,
  defaultOpen = true,
  variant = 'standard',
}: FacetComponentProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const classes = VARIANT_CLASSES[variant]

  if (typeof attribute !== 'string') return null

  return (
    <div className="border-border border-b py-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center justify-between text-left">
        <span className={cn(classes.title)}>{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 225 : 0 }}
          transition={transitionSlow}>
          <Plus className="text-muted-foreground h-4 w-4" />
        </motion.div>
      </button>
      {/* Keep RefinementList mounted to prevent InstantSearch re-renders */}
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={transitionSmooth}
        className="overflow-hidden">
        <div className="pt-3">
          <RefinementList
            attribute={attribute}
            classNames={{
              list: classes.list,
              item: 'group flex items-center justify-between',
              label: classes.label,
              checkbox: 'hidden',
              count: classes.count,
            }}
          />
        </div>
      </motion.div>
    </div>
  )
}
