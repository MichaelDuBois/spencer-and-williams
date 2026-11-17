'use client'

import { motion } from 'motion/react'

import { MediaEntertainmentRailScroller } from '@/app/media-entertainment/_components/MediaEntertainmentRailScroller'
import {
  getRailEntranceTransition,
  RAIL_GUTTER_CLASS,
  RAIL_HEADING_CLASS,
} from '@/app/media-entertainment/_components/MediaEntertainmentRailVariants'
import { scrollFadeIn } from '@/lib/animations'
import { cn } from '@/lib/utils'

import type { ReactNode } from 'react'

/** Entrance travel in px — how far a row rises as it fades in. */
const ENTRANCE_OFFSET = 24

interface MediaEntertainmentRailSectionProps {
  /** Heading text, and the accessible name of the scrollport inside it. */
  title: string
  /** Row position on the page, used only for the entrance stagger. */
  index?: number
  /** Extra classes for the scrollport's flex track, e.g. cross-axis alignment. */
  trackClassName?: string
  children: ReactNode
}

export const MediaEntertainmentRailSection = ({
  title,
  index = 0,
  trackClassName,
  children,
}: MediaEntertainmentRailSectionProps) => (
  <motion.section
    {...scrollFadeIn(ENTRANCE_OFFSET)}
    transition={getRailEntranceTransition(index)}>
    <h2 className={cn(RAIL_GUTTER_CLASS, RAIL_HEADING_CLASS)}>{title}</h2>

    <MediaEntertainmentRailScroller label={title} className={trackClassName}>
      {children}
    </MediaEntertainmentRailScroller>
  </motion.section>
)
