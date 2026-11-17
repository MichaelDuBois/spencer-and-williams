'use client'

import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'

import type {
  BuildHref,
  VariantClasses,
} from '@/components/header/CategoryNav/categoryNav.types'
import { Image } from '@/components/image/Image'
import {
  DURATION_LAYOUT,
  EASE_LAYOUT,
  transitionSmooth,
} from '@/lib/animations'
import { cn } from '@/lib/utils'
import type { Variant } from '@/types'
import type { NavigationItem } from '@/types/verticalConfig.types'

interface MegaMenuProps {
  navigation: NavigationItem[]
  openCategory: string | null
  variant: Variant
  showPanelPadding: boolean
  buildHref: BuildHref
  classes: VariantClasses
  onClose: () => void
}

export const MegaMenu = ({
  navigation,
  openCategory,
  variant,
  showPanelPadding,
  buildHref,
  classes,
  onClose,
}: MegaMenuProps) => {
  const activeItem = navigation.find((item) => item.category === openCategory)
  const isEditorial = variant === 'editorial'

  // Editorial (fashion) reveals the panel by dragging its height down slowly;
  // standard fades in with a subtle downward offset.
  const motionProps = isEditorial
    ? {
        initial: { height: 0 },
        animate: { height: 'auto' as const },
        exit: { height: 0 },
        transition: { duration: DURATION_LAYOUT, ease: EASE_LAYOUT },
      }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 8 },
        transition: transitionSmooth,
      }

  return (
    <AnimatePresence>
      {activeItem && hasChildren(activeItem) && (
        <>
          <motion.div
            key="mega-menu-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transitionSmooth}
            onMouseEnter={onClose}
            className="bg-foreground/20 absolute inset-x-0 top-full z-40 h-screen"
          />
          <motion.div
            key="mega-menu"
            {...motionProps}
            className={cn(
              'absolute inset-x-0 top-full z-50',
              isEditorial && 'overflow-hidden',
              // Mirror the nav bar's right padding when the assistant panel is
              // open so the dropdown stays aligned with the category links.
              showPanelPadding && 'lg:pr-(--assistant-panel-width,400px)',
            )}>
            {/* Same container + padding as the nav bar so the panel aligns
                with the logo and category links. */}
            <div className="container mx-auto px-6">
              <div
                className={cn(
                  'bg-background border-border flex gap-8 border p-6 shadow-lg',
                  classes.panel,
                )}>
                <div className="min-w-0 flex-1">
                  <MegaMenuContent
                    item={activeItem}
                    buildHref={buildHref}
                    classes={classes}
                    onNavigate={onClose}
                  />
                </div>
                <NavIllustration
                  src={activeItem.illustrationImage}
                  label={activeItem.label}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface MegaMenuContentProps {
  item: NavigationItem
  buildHref: BuildHref
  classes: VariantClasses
  onNavigate: () => void
}

const MegaMenuContent = ({
  item,
  buildHref,
  classes,
  onNavigate,
}: MegaMenuContentProps) => {
  const children = item.children ?? []

  // Two-level: each child is a column with its grandchildren beneath.
  if (isTwoLevel(item)) {
    return (
      <div className="grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-3 lg:grid-cols-4">
        {children.map((child) => (
          <div key={child.category}>
            <Link
              href={buildHref(child.category)}
              onClick={onNavigate}
              className={classes.columnHeader}>
              {child.label}
            </Link>
            {hasChildren(child) && (
              <ul className="mt-2 flex flex-col">
                {child.children?.map((grandchild) => (
                  <li key={grandchild.category}>
                    <Link
                      href={buildHref(grandchild.category)}
                      onClick={onNavigate}
                      className={classes.childLink}>
                      {grandchild.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <ul className="grid grid-cols-2 gap-x-8 gap-y-2">
      {children.map((child) => (
        <li key={child.category}>
          <Link
            href={buildHref(child.category)}
            onClick={onNavigate}
            className={classes.childLink}>
            {child.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

interface NavIllustrationProps {
  src?: string
  label: string
}

const NavIllustration = ({ src, label }: NavIllustrationProps) => (
  <div className="hidden shrink-0 lg:block">
    <div className="rounded-image bg-muted relative aspect-video w-100 overflow-hidden">
      <Image
        src={src}
        alt={label}
        fill
        sizes="400px"
        className="object-cover"
      />
    </div>
  </div>
)

const hasChildren = (item: NavigationItem): boolean =>
  Boolean(item.children?.length)

const isTwoLevel = (item: NavigationItem): boolean =>
  Boolean(item.children?.some(hasChildren))
