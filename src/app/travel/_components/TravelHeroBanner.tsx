'use client'

import { ChevronDown } from 'lucide-react'
import { motion } from 'motion/react'
import Image from 'next/image'

import { TravelSearchInput } from '@/app/travel/_components/TravelSearchInput'
import { useTravelHeroBanner } from '@/app/travel/_hooks/useTravelHeroBanner'
import { travelConfig } from '@/app/travel/config'
import {
  DURATION_SLOW,
  EASE_SMOOTH,
  EASE_LAYOUT,
  DURATION_NORMAL,
  DURATION_LAYOUT,
} from '@/lib/animations'
import { scrollToElement } from '@/utilities/scroll'

const basePath = `/${travelConfig.slug}`

export const TravelHeroBanner = () => {
  const bannerImage = travelConfig.assets.banner
  const { isTransitioning, handleSearchClick, handleAIModeClick } =
    useTravelHeroBanner()

  return (
    <section className="relative h-[88vh] min-h-[600px] w-full">
      {/* Background Image — fades out ~120 ms after search bar starts moving */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: isTransitioning ? 0 : 1 }}
        transition={{
          duration: DURATION_SLOW,
          ease: EASE_SMOOTH,
          delay: isTransitioning ? 0.12 : 0,
        }}>
        {bannerImage ? (
          <Image
            src={bannerImage}
            alt="Travel Hero"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="from-accent/20 to-accent/5 h-full w-full bg-gradient-to-br" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30" />
      </motion.div>

      <div className="relative flex h-full flex-col items-center justify-center px-6">
        {/* Search Box with shared layoutId */}
        <motion.div
          layoutId="travel-searchbox"
          className="w-full max-w-2xl"
          transition={{
            layout: {
              duration: DURATION_LAYOUT,
              ease: EASE_LAYOUT,
            },
          }}>
          <TravelSearchInput
            basePath={basePath}
            isHero
            onFocusOverride={handleSearchClick}
            onAIModeClickOverride={handleAIModeClick}
          />
        </motion.div>

        {/* Tagline — fades out ~80 ms after search bar starts moving */}
        <motion.p
          className="mt-6 text-center text-lg text-white/70"
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: isTransitioning ? 0 : 1,
            y: isTransitioning ? -10 : 0,
          }}
          transition={{
            duration: DURATION_SLOW,
            ease: EASE_SMOOTH,
            delay: isTransitioning ? 0.08 : DURATION_NORMAL,
          }}>
          Explore travel articles, guides, and podcasts from around the world
        </motion.p>
      </div>

      {/* Scroll indicator — fades out ~60 ms after search bar starts moving */}
      <motion.button
        onClick={() => scrollToElement('travel-content')}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/70 transition-colors hover:text-white"
        aria-label="Scroll to content"
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: isTransitioning ? 0 : 1,
          y: isTransitioning ? -10 : 0,
        }}
        transition={{
          duration: DURATION_SLOW,
          ease: EASE_SMOOTH,
          delay: isTransitioning ? 0.06 : DURATION_SLOW,
        }}>
        <span className="text-sm font-medium tracking-wide">Explore More</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: EASE_SMOOTH }}>
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </motion.button>
    </section>
  )
}
