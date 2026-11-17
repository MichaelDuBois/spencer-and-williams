'use client'

import clsx from 'clsx'
import { motion } from 'motion/react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { useTravelSearchBox } from '@/app/travel/_hooks/useTravelSearchBox'
import { SearchInputFields } from '@/components/search/SearchInputFields'
import { DURATION_LAYOUT, EASE_LAYOUT } from '@/lib/animations'
import { isMapRoute } from '@/lib/routes'

const HERO_STYLES = {
  paddingLeft: 16,
  paddingRight: 16,
  boxShadow:
    '0 25px 50px -12px rgb(0 0 0 / 0.25), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const

const SEARCH_STYLES = {
  paddingLeft: 16,
  paddingRight: 8,
  boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
} as const

const TRANSITION = { duration: DURATION_LAYOUT, ease: EASE_LAYOUT }

interface TravelSearchInputProps {
  basePath: string
  isHero?: boolean
  onFocusOverride?: () => void
  onAIModeClickOverride?: () => void
}

export const TravelSearchInput = ({
  basePath,
  isHero = false,
  onFocusOverride,
  onAIModeClickOverride,
}: TravelSearchInputProps) => {
  const {
    inputValue,
    inputRef,
    handleInputChange,
    handleClear,
    handleFocus,
    handleSubmit,
    handleAIModeClick,
    isFromHero,
  } = useTravelSearchBox(basePath)

  const pathname = usePathname()
  const showAIButton = !isMapRoute(pathname)

  const [isFocused, setIsFocused] = useState(false)

  const initialStyles = !isHero && isFromHero ? HERO_STYLES : false

  return (
    <form
      onSubmit={isHero ? (e) => e.preventDefault() : handleSubmit}
      className={clsx('relative w-full rounded-full transition-shadow', {
        'ring-accent/20 ring-2': isFocused && !isHero,
      })}>
      <motion.div
        className={clsx(
          'flex w-full items-center gap-3 rounded-full border bg-white',
          {
            'h-14 border-white/20': isHero,
            'border-accent/30 h-11': !isHero && isFocused,
            'border-border h-11': !isHero && !isFocused,
          },
        )}
        initial={initialStyles}
        animate={isHero ? HERO_STYLES : SEARCH_STYLES}
        transition={TRANSITION}>
        <SearchInputFields
          inputRef={isHero ? undefined : inputRef}
          inputValue={inputValue}
          placeholder="Search articles, podcasts..."
          readOnly={isHero}
          onChange={isHero ? undefined : handleInputChange}
          onFocus={() => {
            setIsFocused(true)
            if (isHero) onFocusOverride?.()
            else handleFocus()
          }}
          onBlur={() => setIsFocused(false)}
          onClear={handleClear}
          onAIModeClick={onAIModeClickOverride ?? handleAIModeClick}
          aiModeButtonSize={isHero ? 'lg' : 'sm'}
          showAIButton={showAIButton}
        />
      </motion.div>
    </form>
  )
}
