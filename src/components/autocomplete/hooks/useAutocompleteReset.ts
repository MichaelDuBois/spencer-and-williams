'use client'

import { useCallback } from 'react'
import { useSearchBox } from 'react-instantsearch'

import type { FormEvent } from 'react'

export const useAutocompleteReset = () => {
  const { refine } = useSearchBox()

  return useCallback(
    (event: FormEvent<HTMLDivElement>) => {
      if (!(event.target instanceof HTMLFormElement)) return
      const input = event.target.querySelector<HTMLInputElement>(
        '.ais-AutocompleteInput',
      )
      if (!input || input.hasAttribute('aria-expanded')) return

      // InstantSearch's inactive shell has no input ref or working clear handler.
      event.preventDefault()
      event.stopPropagation()
      refine('')
    },
    [refine],
  )
}
