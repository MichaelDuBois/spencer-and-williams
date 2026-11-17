import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SearchTabs } from '@/app/b2b-content/search/_components/SearchTabs'

vi.mock('@/hooks/useHrefWithQueryString', () => {return {
  useHrefWithQueryString: () => (href: string) => href,
}})

vi.mock('next/link', () => {
  return {
    default: ({
      children,
      href,
      ...props
    }: {
      children: React.ReactNode
      href: string
    }) => (
      <a href={href} {...props}>
        {children}
      </a>
    ),
  }
})

describe('SearchTabs', () => {
  it('renders a tab for "all" plus every content index', () => {
    render(<SearchTabs activeTab="all" />)
    for (const label of [
      'All',
      'Documentation',
      'Articles',
      'Blogs',
      'Resources',
    ]) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    }
  })

  it('links each tab to its search route', () => {
    render(<SearchTabs activeTab="all" />)
    expect(screen.getByRole('link', { name: 'All' })).toHaveAttribute(
      'href',
      '/b2b-content/search',
    )
    expect(screen.getByRole('link', { name: 'Blogs' })).toHaveAttribute(
      'href',
      '/b2b-content/search/blogs',
    )
  })

  it('marks the active tab with aria-current', () => {
    render(<SearchTabs activeTab="articles" />)
    expect(screen.getByRole('link', { name: 'Articles' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'All' })).not.toHaveAttribute(
      'aria-current',
    )
  })
})
