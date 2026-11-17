'use client'

import { MoreHorizontal, X, Home, Moon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { AccentIconTile } from '@/components/AccentIconTile'
import { DemoBarAemDemos } from '@/components/DemoBarAemDemos'
import { AlgoliaEnvironmentToggle } from '@/components/options/AlgoliaEnvironmentToggle'
import { useAlgoliaEnvironment } from '@/hooks/useAlgoliaEnvironment'
import { useEscapeKey } from '@/hooks/useEscapeKey'
import { FALLBACK_VERTICAL_ICON, VERTICAL_ICONS } from '@/lib/vertical-icons'
import type { VerticalConfig } from '@/types'

export interface DemoBarVertical {
  config: Pick<VerticalConfig, 'slug' | 'name' | 'theme' | 'darkMode'>
  hasStaging: boolean
}

interface DemoBarProps {
  verticals: DemoBarVertical[]
}

const isVerticalPath = (pathname: string, slug: string): boolean => {
  const base = `/${slug}`
  return pathname === base || pathname.startsWith(`${base}/`)
}

export const DemoBar = ({ verticals }: DemoBarProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isNoticeOpen, setIsNoticeOpen] = useState(false)
  const pathname = usePathname()
  const { isStaging } = useAlgoliaEnvironment()

  const isLandingPage = pathname === '/'
  const showEnvironmentToggle = verticals.some(
    (vertical) => vertical.hasStaging,
  )
  const currentVertical = verticals.find((vertical) =>
    isVerticalPath(pathname, vertical.config.slug),
  )
  const hasStaging = currentVertical?.hasStaging ?? false

  // Gated so Escape dismisses the staging notice before the whole menu.
  useEscapeKey(() => setIsOpen(false), isOpen && !isNoticeOpen)

  if (isLandingPage) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group fixed top-3 right-3 z-60 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/70 text-slate-600 shadow-sm ring-1 ring-slate-900/5 backdrop-blur-sm transition-all hover:bg-white hover:text-slate-900"
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close demo menu' : 'Open demo menu'}>
        {isOpen ? <X size={16} /> : <MoreHorizontal size={16} />}
        {isStaging && hasStaging && (
          <span
            className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white"
            aria-hidden
          />
        )}
      </button>

      <button
        type="button"
        onClick={() => setIsOpen(false)}
        aria-label="Close demo menu"
        tabIndex={-1}
        className={`fixed inset-0 z-60 cursor-pointer bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <div
        className={`fixed top-0 right-0 left-0 z-60 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : '-translate-y-full'
        }`}>
        <div className="max-h-dvh overflow-y-auto bg-linear-to-br from-slate-50 to-slate-100 px-4 pt-4 pb-6">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Spencer & Williams
              </h2>
              <div className="flex items-center gap-2">
                {showEnvironmentToggle && (
                  <AlgoliaEnvironmentToggle
                    className="mr-2"
                    disabled={!hasStaging && !isStaging}
                    disabledTooltip="No staging app for this vertical"
                    onNoticeOpenChange={setIsNoticeOpen}
                  />
                )}
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:text-slate-900 hover:shadow">
                  <Home size={14} />
                  Home
                </Link>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:text-slate-900 hover:shadow">
                  <X size={14} />
                  Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {verticals.map((vertical) => {
                const accentColor = `var(--theme-accent-${vertical.config.theme})`
                const icon =
                  VERTICAL_ICONS[vertical.config.slug] ?? FALLBACK_VERTICAL_ICON
                const isDark = vertical.config.darkMode ?? false

                const cardContent = (
                  <div className="flex items-center gap-3">
                    <AccentIconTile icon={icon} accentColor={accentColor} />
                    <div className="min-w-0 space-y-1">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {vertical.config.name}
                      </h3>
                    </div>
                    {isDark && (
                      <Moon
                        role="img"
                        className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-400"
                        aria-label="Dark theme"
                      />
                    )}
                  </div>
                )

                return (
                  <Link
                    key={vertical.config.slug}
                    href={`/${vertical.config.slug}`}
                    onClick={() => setIsOpen(false)}
                    style={{ borderColor: accentColor }}
                    className="group rounded-xl border bg-white p-4 transition-all hover:-translate-y-1 hover:shadow-lg">
                    {cardContent}
                  </Link>
                )
              })}
            </div>
            <DemoBarAemDemos onNavigate={() => setIsOpen(false)} />
          </div>
        </div>
      </div>
    </>
  )
}
