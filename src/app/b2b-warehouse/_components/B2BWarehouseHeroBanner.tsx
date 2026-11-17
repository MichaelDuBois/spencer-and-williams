'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'

import { b2bWarehouseConfig } from '@/app/b2b-warehouse/config'
import { enterFadeIn, scrollFadeIn, transitionSlow } from '@/lib/animations'

const STATS = [
  { value: 'Bulk pricing', label: 'on every SKU' },
  { value: '149k+', label: 'products in stock' },
  { value: 'Next-day', label: 'warehouse fulfillment' },
]

export const B2BWarehouseHeroBanner = () => {
  const bannerImage = b2bWarehouseConfig.assets?.banner

  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden">
      {bannerImage ? (
        <Image
          src={bannerImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div className="from-primary via-primary to-accent/30 absolute inset-0 bg-linear-to-br" />
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-black/20"
      />
      <div className="relative container mx-auto px-6">
        <div className="max-w-2xl">
          <motion.p
            {...enterFadeIn()}
            transition={{ ...transitionSlow, delay: 0.2 }}
            className="text-accent mb-4 text-sm font-semibold tracking-widest uppercase">
            Industrial Supply, Delivered
          </motion.p>
          <motion.h1
            {...enterFadeIn(24)}
            transition={{ ...transitionSlow, delay: 0.4 }}
            className="text-4xl leading-tight font-bold text-white md:text-5xl lg:text-6xl">
            Stock up.
            <br />
            Save more.
          </motion.h1>
          <motion.p
            {...enterFadeIn()}
            transition={{ ...transitionSlow, delay: 0.6 }}
            className="mt-6 max-w-lg text-lg leading-relaxed text-white/85">
            Tools, safety gear, fasteners, and MRO essentials at bulk prices —
            built to keep your warehouse and jobsite running.
          </motion.p>
          <motion.div
            {...enterFadeIn(0)}
            transition={{ ...transitionSlow, delay: 0.8 }}>
            <Link
              href="/b2b-warehouse/search"
              className="bg-accent text-accent-foreground rounded-button group relative mt-8 inline-block overflow-hidden px-8 py-3 text-sm font-semibold transition-opacity hover:opacity-90">
              <span
                aria-hidden
                className="absolute top-0 -left-full h-full w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-white/30 to-transparent transition-all duration-700 ease-out group-hover:left-[150%]"
              />
              <span className="relative z-10">Shop the Warehouse</span>
            </Link>
          </motion.div>
          <motion.dl
            {...scrollFadeIn()}
            className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/20 pt-6">
            {STATS.map((stat) => (
              <div key={stat.value}>
                <dt className="text-lg font-bold text-white">{stat.value}</dt>
                <dd className="text-xs text-white/70">{stat.label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </div>
    </section>
  )
}
