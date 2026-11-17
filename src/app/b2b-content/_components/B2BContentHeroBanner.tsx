'use client'

import {
  ChevronDown,
  FileText,
  Newspaper,
  LifeBuoy,
  Search,
  BookMarked,
} from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { b2bContentConfig as config } from '@/app/b2b-content/config'
import { DURATION_SLOW, EASE_SMOOTH } from '@/lib/animations'
import { scrollToElement } from '@/utilities/scroll'

const basePath = `/${config.slug}`

const CONTENT_TYPES = [
  {
    icon: FileText,
    label: 'Documentation',
    count: '30k+ articles',
    href: `${basePath}/search/documentation`,
  },
  {
    icon: LifeBuoy,
    label: 'Support',
    count: '2k+ guides',
    href: `${basePath}/search/articles`,
  },
  {
    icon: Newspaper,
    label: 'Blogs',
    count: '3k+ blogs',
    href: `${basePath}/search/blogs`,
  },
  {
    icon: BookMarked,
    label: 'Resources',
    count: '7k+ resources',
    href: `${basePath}/search/resources`,
  },
]

export const B2BContentHeroBanner = () => {
  const router = useRouter()

  return (
    <section
      className="relative min-h-[88vh] w-full overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, var(--color-b2b-content-hero-bg-from) 0%, var(--color-b2b-content-hero-bg-mid) 50%, var(--color-b2b-content-hero-bg-to) 100%)',
      }}>
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(var(--color-b2b-content-hero-grid-line) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-b2b-content-hero-grid-line) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Radial glow */}
      <div
        className="pointer-events-none absolute top-[45%] left-1/2 h-150 w-225 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-15 blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse, var(--color-b2b-content-hero-glow) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative flex min-h-[88vh] flex-col items-center justify-center px-6 py-20 text-center">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: DURATION_SLOW,
            ease: EASE_SMOOTH,
            delay: 0.2,
          }}
          className="mb-5 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Find answers across{' '}
          <span
            style={{
              background:
                'linear-gradient(90deg, var(--color-b2b-content-hero-gradient-from), var(--color-b2b-content-hero-gradient-to))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
            all your content,
          </span>{' '}
          instantly
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: DURATION_SLOW,
            ease: EASE_SMOOTH,
            delay: 0.3,
          }}
          className="mb-10 max-w-xl text-lg leading-relaxed text-white/50">
          Search documentation, blogs, and support articles in one unified
          experience
        </motion.p>

        {/* Search CTA button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.5,
            ease: 'easeOut',
            delay: 0.4,
          }}
          onClick={() => router.push(`${basePath}/search`)}
          className="mb-10 flex cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/15">
          <Search className="h-4 w-4 text-white/70" />
          <span>Start searching</span>
        </motion.button>

        {/* Content type pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: DURATION_SLOW,
            ease: EASE_SMOOTH,
            delay: 0.5,
          }}
          className="flex flex-wrap items-center justify-center gap-3">
          <span className="text-sm text-white/30">Search across:</span>
          {CONTENT_TYPES.map(({ icon: Icon, label, count, href }) => (
            <Link
              href={href}
              key={label}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm hover:border-white/30 hover:bg-white/15">
              <Icon className="h-3.5 w-3.5 text-white/40" />
              <span className="text-sm font-medium text-white/65">{label}</span>
              <span className="text-xs text-white/25">{count}</span>
            </Link>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={() => scrollToElement('b2b-content-body')}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/30 transition-colors hover:text-white/60"
        aria-label="Scroll to content"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION_SLOW, ease: EASE_SMOOTH, delay: 0.7 }}>
        <span className="text-xs font-medium tracking-widest uppercase">
          Explore
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: EASE_SMOOTH }}>
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.button>
    </section>
  )
}
