'use client'

import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import type { PrimitiveAtom } from 'jotai'

/**
 * Generic hook to set a context atom for the AI assistant.
 * Pass the target atom (e.g. productContextState, travelContentContextState)
 * and the data. The context is automatically cleared when the component unmounts.
 */
export const useSetProductContext = <T>(
  contextAtom: PrimitiveAtom<T | null>,
  data: T | null,
) => {
  const setContext = useSetAtom(contextAtom)

  useEffect(() => {
    if (data) {
      setContext(data)
    }

    return () => {
      setContext(null)
    }
  }, [data, setContext])
}
