'use client'

import { useAutocompleteReset } from '@/components/autocomplete/hooks/useAutocompleteReset'

import type { ReactNode } from 'react'

interface AutocompleteResetBoundaryProps {
  children: ReactNode
}

export const AutocompleteResetBoundary = ({
  children,
}: AutocompleteResetBoundaryProps) => {
  const handleResetCapture = useAutocompleteReset()

  return (
    <div className="contents" onResetCapture={handleResetCapture}>
      {children}
    </div>
  )
}
