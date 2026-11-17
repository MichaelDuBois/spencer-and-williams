'use client'

import { useAtom } from 'jotai'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { useSearchInput } from '@/hooks/useSearchInput'
import { DURATION_LAYOUT } from '@/lib/animations'
import { isFromHeroAtom, shouldFocusSearchAtom } from '@/stores/travel'

export const useTravelSearchBox = (basePath: string) => {
  const base = useSearchInput(basePath)
  const pathname = usePathname()
  const isSearchPage = pathname.includes('/search')
  const [shouldFocusSearch, setFocusSearch] = useAtom(shouldFocusSearchAtom)
  const [isFromHero, setIsFromHero] = useAtom(isFromHeroAtom)

  useEffect(() => {
    if (isSearchPage && shouldFocusSearch) {
      const timer = setTimeout(() => {
        base.inputRef.current?.focus()
        setFocusSearch(false)
        setIsFromHero(false)
      }, DURATION_LAYOUT * 1000)
      return () => clearTimeout(timer)
    }
  }, [
    isSearchPage,
    shouldFocusSearch,
    setFocusSearch,
    setIsFromHero,
    base.inputRef,
  ])

  return { ...base, isFromHero }
}
