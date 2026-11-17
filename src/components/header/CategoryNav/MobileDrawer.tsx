'use client'

import { ChevronDown, ChevronRight, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { useState } from 'react'

import type {
  BuildHref,
  VariantClasses,
} from '@/components/header/CategoryNav/categoryNav.types'
import { transitionFast, transitionSmooth } from '@/lib/animations'
import { cn } from '@/lib/utils'
import type { NavigationItem } from '@/types/verticalConfig.types'

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  navigation: NavigationItem[]
  buildHref: BuildHref
  classes: VariantClasses
}

export const MobileDrawer = ({
  isOpen,
  onClose,
  navigation,
  buildHref,
  classes,
}: MobileDrawerProps) => (
  <AnimatePresence>
    {isOpen && (
      <div className="lg:hidden">
        <motion.div
          key="drawer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transitionSmooth}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40"
        />
        <motion.aside
          key="drawer-panel"
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={transitionSmooth}
          className={cn(
            'bg-background fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] overflow-y-auto p-6 shadow-xl',
            classes.panel,
          )}>
          <div className="mb-6 flex items-center justify-between">
            <span className={classes.popoverHeading}>Categories</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close categories"
              className="text-muted-foreground hover:text-foreground cursor-pointer rounded-full p-2 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav aria-label="Browse categories">
            <ul className="flex flex-col">
              {navigation.map((item) => (
                <DrawerItem
                  key={item.category}
                  item={item}
                  depth={0}
                  buildHref={buildHref}
                  classes={classes}
                  onNavigate={onClose}
                />
              ))}
            </ul>
          </nav>
        </motion.aside>
      </div>
    )}
  </AnimatePresence>
)

interface DrawerItemProps {
  item: NavigationItem
  depth: number
  buildHref: BuildHref
  classes: VariantClasses
  onNavigate: () => void
}

const DrawerItem = ({
  item,
  depth,
  buildHref,
  classes,
  onNavigate,
}: DrawerItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const itemHasChildren = Boolean(item.children?.length)

  return (
    <li>
      <div className="flex items-center justify-between gap-2">
        <Link
          href={buildHref(item.category)}
          onClick={onNavigate}
          className={cn(classes.drawerLink, 'flex-1')}>
          <span className={cn(depth === 1 && 'pl-4', depth >= 2 && 'pl-8')}>
            {item.label}
          </span>
        </Link>
        {itemHasChildren && (
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-label={
              isExpanded ? `Collapse ${item.label}` : `Expand ${item.label}`
            }
            aria-expanded={isExpanded}
            className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer p-2 transition-colors">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {itemHasChildren && isExpanded && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={transitionFast}
            className="overflow-hidden">
            {item.children?.map((child) => (
              <DrawerItem
                key={child.category}
                item={child}
                depth={depth + 1}
                buildHref={buildHref}
                classes={classes}
                onNavigate={onNavigate}
              />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  )
}
