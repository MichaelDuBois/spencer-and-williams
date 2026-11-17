'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { MediaEntertainmentProfileButton } from '@/app/media-entertainment/_components/MediaEntertainmentProfileButton'
import { RAIL_GUTTER_CLASS } from '@/app/media-entertainment/_components/MediaEntertainmentRailVariants'
import { MediaEntertainmentSearchInput } from '@/app/media-entertainment/_components/MediaEntertainmentSearchInput'
import { useMediaEntertainmentHeaderScroll } from '@/app/media-entertainment/_hooks/useMediaEntertainmentHeaderScroll'
import {
  isNavItemActive,
  MEDIA_NAV_ITEMS,
} from '@/app/media-entertainment/_utils/mediaEntertainmentNav'
import { mediaEntertainmentConfig as config } from '@/app/media-entertainment/config'
import { Logo } from '@/components/Logo'
import { DemoOptions } from '@/components/options/DemoOptions'
import { enterFadeIn, transitionSlow } from '@/lib/animations'
import { cn } from '@/lib/utils'

const basePath = `/${config.slug}`

const MotionLink = motion.create(Link)

export const MediaEntertainmentHeader = () => {
  const { isOverlay } = useMediaEntertainmentHeaderScroll()
  const pathname = usePathname()

  return (
    <header
      // The assistant panel measures this to dock below the pinned header.
      id="site-header"
      className={cn(
        'fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color] duration-300',
        // z-40 sits under AIAssistantPanel (z-50), DemoBar (z-60) and the
        // DemoOptions popover (z-100, portalled) — do not raise it.
        isOverlay
          ? 'border-transparent bg-transparent'
          : 'bg-background/85 border-border/60 backdrop-blur-md',
      )}>
      <div
        className={cn(
          'flex h-[var(--header-height)] w-full items-center justify-between gap-4',
          RAIL_GUTTER_CLASS,
        )}>
        <div className="flex min-w-0 items-center gap-4 lg:gap-8">
          <motion.div
            {...enterFadeIn(0)}
            transition={transitionSlow}
            className={cn('shrink-0', isOverlay && 'drop-shadow-md')}>
            {/* Below md there's no room for the wordmark next to the search bar, so it collapses to just the favicon. */}
            <Logo
              src={config.assets.favicon}
              href={basePath}
              imageClassName="h-8 w-8 md:hidden"
            />
            <Logo
              src={config.assets.logo}
              href={basePath}
              imageClassName="hidden h-10 md:block md:h-16"
            />
          </motion.div>
          <nav className="hidden min-w-0 items-center gap-2 sm:flex md:gap-4 lg:gap-7">
            {MEDIA_NAV_ITEMS.map((item, index) => {
              const isActive = isNavItemActive(item, pathname)
              const animation = {
                ...enterFadeIn(-8),
                transition: { ...transitionSlow, delay: 0.15 + index * 0.08 },
                className: getNavItemClasses(isActive, isOverlay),
              }

              // No href yet, so it stays a button rather than a dead link.
              return item.href ? (
                <MotionLink
                  key={item.label}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  {...animation}>
                  {item.label}
                </MotionLink>
              ) : (
                <motion.button key={item.label} type="button" {...animation}>
                  {item.label}
                </motion.button>
              )
            })}
          </nav>
        </div>
        {/* Below md this group absorbs the row's leftover width so the search field can shrink into it. */}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 md:flex-none">
          <motion.div
            {...enterFadeIn(0)}
            transition={{ ...transitionSlow, delay: 0.5 }}
            // min-w-0 lets the field shrink below its animated width; md:min-w-max keeps desktop at the full 260px.
            className="min-w-0 md:min-w-max">
            <MediaEntertainmentSearchInput isOverlay={isOverlay} />
          </motion.div>
          <motion.div
            {...enterFadeIn(0)}
            transition={{ ...transitionSlow, delay: 0.6 }}
            // DemoOptions' trigger is text-muted-foreground, which reads as grey
            // mush over bright artwork. Lifted here rather than in the shared
            // component, so the override stays contained to this header.
            className={cn(isOverlay && '[&_button]:text-white/90')}>
            <DemoOptions />
          </motion.div>
          <motion.div
            {...enterFadeIn(0)}
            transition={{ ...transitionSlow, delay: 0.7 }}
            className="ml-1">
            <MediaEntertainmentProfileButton />
          </motion.div>
        </div>
      </div>
    </header>
  )
}

const getNavItemClasses = (isActive: boolean, isOverlay: boolean): string => {
  if (isOverlay) {
    return cn(
      'text-sm whitespace-nowrap drop-shadow-md transition-colors md:text-base lg:text-lg',
      isActive
        ? 'font-semibold text-white'
        : 'font-medium text-white/80 hover:text-white',
    )
  }

  return cn(
    'text-sm whitespace-nowrap transition-colors md:text-base lg:text-lg',
    isActive
      ? 'text-foreground font-semibold'
      : 'text-foreground/80 hover:text-foreground font-medium',
  )
}
