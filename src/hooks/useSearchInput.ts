'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useSearchBox } from 'react-instantsearch'

import { useOpenAssistantPanel } from '@/features/aiAssistant'
import { useIntentRouting } from '@/hooks/useIntentRouting'

interface SearchInputOptions {
  /** Override the URL query when synchronizing after a pathname change. */
  resolveNavigationQuery?: (urlQuery: string) => string
  /** Force AI mode to always open the panel full-width, regardless of route. */
  forceExpandedOnAIMode?: boolean
}

export const useSearchInput = (
  basePath: string,
  { resolveNavigationQuery, forceExpandedOnAIMode }: SearchInputOptions = {},
) => {
  const { query, refine } = useSearchBox()
  const [inputValue, setInputValue] = useState(query)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isSearchPage = pathname.includes('/search') || pathname.includes('/map')
  const isHomepage = pathname === basePath || pathname === `${basePath}/`
  const inputRef = useRef<HTMLInputElement>(null)
  const { openWithMessage } = useOpenAssistantPanel({ basePath })
  const { routeIfConversational } = useIntentRouting(basePath)

  useEffect(() => {
    setInputValue(query)
  }, [query])

  // Sync URL query to InstantSearch on tab/page navigation (pathname change only)
  useEffect(() => {
    const urlQuery = searchParams.get('query') ?? ''
    if (isSearchPage) {
      const nextQuery = resolveNavigationQuery?.(urlQuery) ?? urlQuery
      // The resolved query can differ from the URL when a wrapper restored a
      // draft typed while this navigation was in flight. InstantSearch's own
      // routing re-reads live `window.location` from an effect on the provider
      // above us, which React runs after this one, so it would refine straight
      // back to the stale URL query. Correcting the URL first makes that read
      // agree with the draft instead of overwriting it.
      if (nextQuery !== urlQuery) {
        replaceQueryParam(nextQuery)
      }
      setInputValue(nextQuery)
      refine(nextQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    if (isSearchPage) {
      refine(value)
    }
  }

  const handleClear = () => {
    setInputValue('')
    refine('')
    inputRef.current?.focus()
  }

  const handleFocus = () => {
    if (!isSearchPage) {
      router.push(`${basePath}/search`)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (routeIfConversational(inputValue)) return
    if (!isSearchPage) {
      router.push(
        `${basePath}/search${inputValue ? `?query=${encodeURIComponent(inputValue)}` : ''}`,
      )
    }
  }

  const handleAIModeClick = () => {
    openWithMessage(inputValue, {
      expanded: forceExpandedOnAIMode ?? isHomepage,
      navigate: false,
      clearHistory: false,
      keepQuery: true,
    })
  }

  return {
    inputValue,
    // Allows wrappers to edit the draft without issuing a search yet.
    setInputValue,
    inputRef,
    handleInputChange,
    handleClear,
    handleFocus,
    handleSubmit,
    handleAIModeClick,
  }
}

/**
 * Rewrites `?query` in place, without a navigation, so InstantSearch's routing
 * reads the given query. Other params are preserved.
 */
const replaceQueryParam = (query: string): void => {
  const params = new URLSearchParams(window.location.search)
  if (query) {
    params.set('query', query)
  } else {
    params.delete('query')
  }
  const search = params.toString()
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${search ? `?${search}` : ''}`,
  )
}
