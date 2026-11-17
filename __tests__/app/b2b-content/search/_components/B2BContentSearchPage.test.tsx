import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { B2BContentSearchPage } from '@/app/b2b-content/search/_components/B2BContentSearchPage'

vi.mock('@/features/chatWidget/components/ChatSearchOverview', () => {return {
  ChatSearchOverview: () => <div>Overview</div>,
}})
vi.mock('@/app/b2b-content/search/_components/AllResultsPage', () => {return {
  AllResultsPage: () => <div>All results</div>,
}})
vi.mock('@/app/b2b-content/search/_components/SingleIndexPage', () => {return {
  SingleIndexPage: ({ indexKey }: { indexKey: string }) => (
    <div>{indexKey} results</div>
  ),
}})

describe('B2B content overview placement', () => {
  it.each(['all'] as const)('shows overview on %s results', (activeTab) => {
    render(<B2BContentSearchPage activeTab={activeTab} />)
    expect(screen.getByText('Overview')).toBeInTheDocument()
  })
  it.each(['documentation', 'articles', 'blogs', 'resources'] as const)(
    'hides primary overview on %s results',
    (activeTab) => {
      render(<B2BContentSearchPage activeTab={activeTab} />)
      expect(screen.queryByText('Overview')).not.toBeInTheDocument()
      expect(screen.getByText(`${activeTab} results`)).toBeInTheDocument()
    },
  )
})
