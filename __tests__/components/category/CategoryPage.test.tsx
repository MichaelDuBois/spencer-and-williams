import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CategoryPage } from '@/components/category/CategoryPage'

// --- Mocks ---------------------------------------------------------------

// Slug read from the URL. Overridable per-test.
const mockParams = { slug: 'electronics-camera-photo' }

vi.mock('next/navigation', () => {return {
  useParams: () => mockParams,
  useSearchParams: () => {return { get: () => null }},
}})

const mockConfig = {
  navigation: [
    {
      label: 'Electronics',
      category: 'Electronics',
      children: [
        { label: 'Camera & Photo', category: 'Electronics > Camera & Photo' },
      ],
    },
  ],
  carouselCategories: [],
  merchandising: {
    categoryAttribute: 'categoryPageId',
    nestedSeparator: ' > ',
  },
  algolia: { primaryIndex: { name: 'test_index' } },
}

vi.mock('@/hooks/useActiveConfig', () => {return {
  useActiveConfig: () => mockConfig,
}})

vi.mock('@/hooks/useScrollToTop', () => {return {
  useScrollToTop: () => undefined,
}})

// Mock react-instantsearch: Index just renders children, Configure exposes
// its `filters` prop via a data attribute so the test can assert on it.
vi.mock('react-instantsearch', () => {return {
  Index: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Configure: ({ filters }: { filters: string }) => (
    <div data-testid="configure" data-filters={filters} />
  ),
}})

// --- Tests ---------------------------------------------------------------

describe('CategoryPage', () => {
  beforeEach(() => {
    mockParams.slug = 'electronics-camera-photo'
  })

  it('resolves a nested child slug to the exact category filter and label', () => {
    render(
      <CategoryPage indexId="cat">
        {(label, category) => (
          <>
            <span data-testid="label">{label}</span>
            <span data-testid="category">{category}</span>
          </>
        )}
      </CategoryPage>,
    )

    expect(screen.getByTestId('configure')).toHaveAttribute(
      'data-filters',
      'categoryPageId:"Electronics > Camera & Photo"',
    )
    // Label comes from the nested child's `label`, proving findNavItem
    // recurses into `children`.
    expect(screen.getByTestId('label')).toHaveTextContent('Camera & Photo')
    expect(screen.getByTestId('category')).toHaveTextContent(
      'Electronics > Camera & Photo',
    )
  })

  it('resolves a top-level slug to its category filter and label', () => {
    mockParams.slug = 'electronics'

    render(
      <CategoryPage indexId="cat">
        {(label) => <span data-testid="label">{label}</span>}
      </CategoryPage>,
    )

    expect(screen.getByTestId('configure')).toHaveAttribute(
      'data-filters',
      'categoryPageId:"Electronics"',
    )
    expect(screen.getByTestId('label')).toHaveTextContent('Electronics')
  })
})
