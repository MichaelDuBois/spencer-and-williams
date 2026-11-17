'use client'

import { useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export const useHrefWithQueryString = () => {
  const queryString = useSearchParams().toString()
  return useCallback(
    (path: string) => (queryString ? `${path}?${queryString}` : path),
    [queryString],
  )
}
