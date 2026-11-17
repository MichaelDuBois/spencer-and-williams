'use client'

import { sendGAEvent } from '@next/third-parties/google'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export const useGaPageview = (): void => {
  const pathname = usePathname()
  const isInitialLoad = useRef(true)

  useEffect(() => {
    // The initial page_view is emitted by <GoogleAnalytics>'s gtag config call,
    // so we only send explicit page_views for client-side navigations.
    if (isInitialLoad.current) {
      isInitialLoad.current = false
      return
    }

    sendGAEvent('event', 'page_view', {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
      content_group: pathname.split('/')[1] || 'home',
    })
  }, [pathname])
}
