'use client'

import { Plus } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { useHierarchicalMenu } from 'react-instantsearch'

import { transitionSlow, transitionSmooth } from '@/lib/animations'
import { cn } from '@/lib/utils'
import type { FacetComponentProps, Variant } from '@/types'

const SEPARATOR = ' > '

type HierarchicalItem = ReturnType<typeof useHierarchicalMenu>['items'][number]

type VariantClasses = {
  title: string
  label: string
  labelSelected: string
  count: string
}

const VARIANT_CLASSES: Record<Variant, VariantClasses> = {
  standard: {
    title: 'text-foreground font-medium capitalize',
    label:
      'cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground',
    labelSelected: 'text-foreground font-medium',
    count: 'text-muted-foreground/70 ml-2 text-xs',
  },
  editorial: {
    title: 'text-muted-foreground text-xs tracking-widest uppercase',
    label:
      'cursor-pointer text-xs tracking-wide text-muted-foreground transition-colors hover:text-foreground',
    labelSelected: 'text-foreground',
    count: 'text-muted-foreground/50 ml-2 text-micro',
  },
}

const getLeafLabel = (label: string) => {
  const segments = label.split(SEPARATOR)
  return segments[segments.length - 1] ?? label
}

interface HierarchicalListProps {
  items: HierarchicalItem[]
  refine: (value: string) => void
  classes: VariantClasses
  level?: number
}

const HierarchicalList = ({
  items,
  refine,
  classes,
  level = 0,
}: HierarchicalListProps) => (
  <ul className={cn('space-y-3', level > 0 && 'mt-3 pl-3')}>
    {items.map((item) => (
      <li key={item.value}>
        <button
          type="button"
          onClick={() => refine(item.value)}
          className="flex w-full items-baseline justify-between text-left">
          <span
            className={cn(
              classes.label,
              item.isRefined && classes.labelSelected,
            )}>
            {getLeafLabel(item.label)}
          </span>
          <span className={cn(classes.count)}>{item.count}</span>
        </button>
        {item.data && item.data.length > 0 && (
          <HierarchicalList
            items={item.data}
            refine={refine}
            classes={classes}
            level={level + 1}
          />
        )}
      </li>
    ))}
  </ul>
)

export const HierarchicalFacet = ({
  title,
  attribute,
  defaultOpen = true,
  variant = 'standard',
}: FacetComponentProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const classes = VARIANT_CLASSES[variant]
  const levels = typeof attribute === 'string' ? [] : attribute
  const { items, refine, canRefine } = useHierarchicalMenu({
    attributes: [...levels],
  })

  if (levels.length === 0) return null
  if (!canRefine) return null

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
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={transitionSmooth}
        className="overflow-hidden">
        <div className="pt-3">
          <HierarchicalList items={items} refine={refine} classes={classes} />
        </div>
      </motion.div>
    </div>
  )
}
