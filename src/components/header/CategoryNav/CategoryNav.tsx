'use client'

import { LayoutGrid } from 'lucide-react'
import Link from 'next/link'
import { type ReactNode, useState } from 'react'

import { VARIANT_CLASSES } from '@/components/header/CategoryNav/categoryNavVariants'
import { MegaMenu } from '@/components/header/CategoryNav/MegaMenu'
import { MobileDrawer } from '@/components/header/CategoryNav/MobileDrawer'
import { useIsAssistantSidePanelOpen } from '@/features/aiAssistant/hooks/ui/useIsAssistantSidePanelOpen'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { useEscapeKey } from '@/hooks/useEscapeKey'
import { cn } from '@/lib/utils'
import type { Variant } from '@/types'
import type { NavigationItem } from '@/types/verticalConfig.types'
import { getSlug } from '@/utilities/getSlug'

interface CategoryNavProps {
  navigation?: NavigationItem[]
  basePath: string
  variant?: Variant
  endSlot?: ReactNode
}

export const CategoryNav = ({
  navigation,
  basePath,
  variant = 'standard',
  endSlot,
}: CategoryNavProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const isSidePanelOpen = useIsAssistantSidePanelOpen(basePath)
  const classes = VARIANT_CLASSES[variant]

  useEscapeKey(() => setOpenCategory(null), openCategory !== null)
  useBodyScrollLock(isDrawerOpen)

  if (!navigation?.length) return null

  const buildHref = (category: string) =>
    `${basePath}/category/${getSlug(category)}`

  return (
    <>
      {/* Mobile: trigger + slide-in drawer */}
      <div className={classes.mobileWrapper}>
        <div className="container mx-auto flex items-center justify-between px-6 py-2">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="text-muted-foreground hover:text-foreground inline-flex h-8 w-8 cursor-pointer items-center justify-center transition-colors"
            aria-label="Browse categories">
            <LayoutGrid className="h-5 w-5" />
          </button>
          {endSlot}
        </div>
      </div>

      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        navigation={navigation}
        buildHref={buildHref}
        classes={classes}
      />

      {/* Desktop: horizontal nav with hover mega-menu */}
      <nav
        aria-label="Categories"
        onMouseLeave={() => setOpenCategory(null)}
        className={cn(
          classes.desktopWrapper,
          'relative transition-[padding] duration-300 ease-out',
          isSidePanelOpen && 'lg:pr-(--assistant-panel-width,400px)',
        )}>
        <div className="container mx-auto px-6">
          <ul className={classes.desktopList}>
            {navigation.map((item) => {
              const itemHasChildren = Boolean(item.children?.length)
              const isActive = openCategory === item.category

              return (
                <li
                  key={item.category}
                  className="shrink-0"
                  onMouseEnter={() =>
                    setOpenCategory(itemHasChildren ? item.category : null)
                  }
                  onFocus={() =>
                    setOpenCategory(itemHasChildren ? item.category : null)
                  }>
                  <Link
                    href={buildHref(item.category)}
                    onClick={() => setOpenCategory(null)}
                    aria-expanded={itemHasChildren ? isActive : undefined}
                    className={classes.desktopLink}>
                    {variant === 'standard' ? (
                      <span className="border-b-2 border-transparent transition-colors group-hover:border-current">
                        {item.label}
                      </span>
                    ) : (
                      item.label
                    )}
                  </Link>
                </li>
              )
            })}
            {endSlot && <li className="ml-auto shrink-0">{endSlot}</li>}
          </ul>
        </div>

        <MegaMenu
          navigation={navigation}
          openCategory={openCategory}
          variant={variant}
          showPanelPadding={isSidePanelOpen}
          buildHref={buildHref}
          classes={classes}
          onClose={() => setOpenCategory(null)}
        />
      </nav>
    </>
  )
}
