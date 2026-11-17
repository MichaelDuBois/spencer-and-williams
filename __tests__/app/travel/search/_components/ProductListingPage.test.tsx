import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ProductListingPage } from '@/app/travel/search/_components/ProductListingPage'

import type { ReactNode } from 'react'

vi.mock('next/link', () => {
  return {
    default: ({ children }: { children: ReactNode }) => <a>{children}</a>,
  }
})
vi.mock('react-instantsearch', () => {
  return {
    Configure: () => null,
    Hits: () => null,
    Index: ({ children }: { children: ReactNode }) => <>{children}</>,
  }
})
vi.mock('@/hooks/useHrefWithQueryString', () => {
  return { useHrefWithQueryString: () => (path: string) => path }
})
vi.mock('@/features/chatWidget/components/ChatSearchOverview', () => {
  return { ChatSearchOverview: () => <div>Overview</div> }
})
vi.mock('@/components/composition/MultifeedCarousels', () => {
  return { MultifeedCarousels: () => null }
})
vi.mock('@/components/results/AISuggestionsSection', () => {
  return { AISuggestionsSection: () => null }
})
vi.mock('@/components/results/EmptyIndexState', () => {
  return { EmptyIndexState: () => null }
})
vi.mock('@/components/results/SearchResultsHeader', () => {
  return { SearchResultsHeader: () => null }
})

describe('federated travel results', () => {
  it('does not mount an AI Overview', () => {
    render(<ProductListingPage />)
    expect(screen.queryByText('Overview')).not.toBeInTheDocument()
  })
})
