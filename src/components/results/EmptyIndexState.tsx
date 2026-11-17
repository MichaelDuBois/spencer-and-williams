'use client'

import { useHits, useInstantSearch } from 'react-instantsearch'

import { NoResults } from '@/components/results/NoResults'

interface EmptyIndexStateProps {
  message?: string
}

export const EmptyIndexState = ({ message }: EmptyIndexStateProps) => {
  const { status } = useInstantSearch()
  const { items } = useHits()

  if (status !== 'idle' || items.length > 0) return null

  return <NoResults message={message} />
}
