'use client'

import { Search } from 'lucide-react'
import { motion } from 'motion/react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { useMediaEntertainmentSearchInput } from '@/app/media-entertainment/_hooks/useMediaEntertainmentSearchInput'
import { mediaEntertainmentConfig as config } from '@/app/media-entertainment/config'
import { AIModeButton } from '@/components/search/AIModeButton'
import { SearchInputFields } from '@/components/search/SearchInputFields'
import { transitionFast, transitionSmooth } from '@/lib/animations'
import { cn } from '@/lib/utils'

const basePath = `/${config.slug}`
const searchPath = `${basePath}/search`

// Only for the open pill — collapsed uses showLabel={false}'s 36px circle.
const AI_MODE_BUTTON_SIZE = 'xs'

// Fits the placeholder and the `xs` pill side by side.
const EXPANDED_WIDTH_PX = 360

// Both collapsed icons look identical at rest; only their hover target differs.
const getIconRestClasses = (isOverlay: boolean): string =>
  isOverlay ? 'text-white/90 drop-shadow-md' : 'text-foreground/80'

const noop = () => {}

interface MediaEntertainmentSearchInputProps {
  isOverlay: boolean
}

export const MediaEntertainmentSearchInput = ({
  isOverlay,
}: MediaEntertainmentSearchInputProps) => {
  const {
    inputValue,
    inputRef,
    handleInputChange,
    handleClear,
    handleFocus,
    handleSubmit,
    handleAIModeClick,
  } = useMediaEntertainmentSearchInput()

  const router = useRouter()
  const pathname = usePathname()

  // Search is the whole page on the search route, so the field is open there and
  // only there — anywhere else it collapses to a pair of icon buttons.
  const isOpen = pathname.startsWith(searchPath)

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen, inputRef])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') inputRef.current?.blur()
  }

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      <motion.div
        // Animates real width, not a layout projection, so the placeholder and pill aren't scale-distorted.
        animate={{ width: isOpen ? EXPANDED_WIDTH_PX : 'auto' }}
        transition={transitionSmooth}
        className={cn(
          // max-w-full clamps Motion's inline width to the space the header row has left.
          // justify-end pins the content to the edge the header row pins too, so
          // shrinking the width doesn't drag the icons across it.
          'flex h-9 max-w-full items-center justify-end gap-1.5 rounded-full border',
          // The shell's chrome is a class swap, so it fades out alongside the
          // width instead of popping the moment the route changes.
          'transition-[background-color,border-color,box-shadow] duration-200',
          // Scoped to open only — collapsed would clip the AI button's shadow.
          isOpen && 'overflow-hidden',
          getShellClasses(isOpen, isOverlay),
        )}>
        {isOpen ? (
          <motion.label
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={transitionFast}
            className="flex w-full min-w-0 cursor-text items-center gap-2 pr-1.5 pl-3">
            <span className="sr-only">Search titles</span>
            <SearchInputFields
              inputRef={inputRef}
              inputValue={inputValue}
              placeholder="Search movies and shows..."
              onChange={handleInputChange}
              onFocus={handleFocus}
              // Nothing to do on blur — the field's open state follows the route.
              onBlur={noop}
              onClear={handleClear}
              onAIModeClick={handleAIModeClick}
              aiModeButtonSize={AI_MODE_BUTTON_SIZE}
            />
          </motion.label>
        ) : (
          <>
            <button
              type="button"
              aria-label="Search titles"
              onClick={() => router.push(searchPath)}
              className={cn(
                'flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors',
                getIconRestClasses(isOverlay),
                isOverlay ? 'hover:text-white' : 'hover:text-foreground',
              )}>
              <Search className="h-5 w-5" />
            </button>
            <AIModeButton
              onClick={handleAIModeClick}
              showLabel={false}
              // Identical to the search icon, except hover tints the glyph accent.
              className={cn(getIconRestClasses(isOverlay), 'hover:text-accent')}
            />
          </>
        )}
      </motion.div>
    </form>
  )
}

// Collapsed row stays borderless; only the open field gets a shell.
const getShellClasses = (isOpen: boolean, isOverlay: boolean): string => {
  if (!isOpen) return 'border-transparent'

  return isOverlay
    ? 'bg-background/70 border-border/60 shadow-lg backdrop-blur-md'
    : 'bg-background border-border'
}
