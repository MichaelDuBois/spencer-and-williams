'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { mediaEntertainmentConfig as config } from '@/app/media-entertainment/config'
import { useSearchInput } from '@/hooks/useSearchInput'

const basePath = `/${config.slug}`
const searchPath = `${basePath}/search`

/** Adds media's category-to-global navigation to the shared search input. */
export const useMediaEntertainmentSearchInput = () => {
  const router = useRouter()
  const pathname = usePathname()
  const pendingGlobalQuery = useRef<string | null>(null)
  const base = useSearchInput(basePath, {
    // The navigation URL contains the first keystroke. Prefer the latest draft
    // on arrival, including an empty string if the user cleared the field.
    resolveNavigationQuery: (urlQuery) =>
      pathname === searchPath
        ? (pendingGlobalQuery.current ?? urlQuery)
        : urlQuery,
    // Media has no conversational homepage entry, so AI mode always opens full-width.
    forceExpandedOnAIMode: true,
  })

  useEffect(() => {
    // The shared hook consumes the pending query before this effect resets it.
    pendingGlobalQuery.current = null
  }, [pathname])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (pendingGlobalQuery.current !== null) {
      pendingGlobalQuery.current = value
      base.setInputValue(value)
      return
    }
    if (pathname.startsWith(`${searchPath}/`) && value) {
      pendingGlobalQuery.current = value
      base.setInputValue(value)
      router.replace(`${searchPath}?query=${encodeURIComponent(value)}`)
      return
    }
    base.handleInputChange(e)
  }

  const handleClear = () => {
    if (pendingGlobalQuery.current !== null) {
      pendingGlobalQuery.current = ''
      base.setInputValue('')
      base.inputRef.current?.focus()
      return
    }
    base.handleClear()
  }

  return { ...base, handleInputChange, handleClear }
}
