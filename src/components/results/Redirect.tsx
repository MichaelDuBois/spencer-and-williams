'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { useInstantSearch, useQueryRules } from 'react-instantsearch'

interface RedirectData {
  redirect?: { url?: string }
}

export const Redirect = () => {
  const router = useRouter()
  const { results } = useInstantSearch()
  const { items } = useQueryRules()
  const hasRedirected = useRef(false)

  const renderingContent = results?.renderingContent as
    | { redirect?: { url?: string } }
    | undefined

  const url =
    renderingContent?.redirect?.url ??
    (items as RedirectData[]).find((item) => item.redirect?.url)?.redirect?.url

  useEffect(() => {
    if (!url || hasRedirected.current) return
    hasRedirected.current = true

    if (url.startsWith('http')) {
      window.location.replace(url)
    } else {
      router.replace(url)
    }
  }, [url, router])

  return null
}
