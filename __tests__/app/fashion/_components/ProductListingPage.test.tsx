import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ProductListingPage } from '@/app/fashion/_components/ProductListingPage'
import {
  demoOptionsStore,
  inlineArticlesEnabledAtom,
} from '@/stores/demoOptions'

import { createTestStore } from '@tests/helpers/jotai-wrapper'
import { buildProvidersWrapper } from '@tests/helpers/test-utils'

import type { ReactNode } from 'react'

vi.mock('react-instantsearch', () => {
  return {
    useInstantSearch: () => {
      return {
        results: { page: 0 },
        scopedResults: [
          {
            indexId: 'fashion_inline_article',
            results: {
              hits: [
                {
                  objectID: 'fashion-article-coat-edit',
                  title: 'The Coat Edit',
                  category: 'Styling Guide',
                  reading_time: 6,
                  thumbnail_image: 'https://cdn.example.com/coats.jpg',
                },
              ],
            },
          },
        ],
      }
    },
    Index: ({ children }: { children: ReactNode }) => <>{children}</>,
    Configure: ({ hitsPerPage }: { hitsPerPage: number }) => (
      <output
        data-testid="inline-article-configure"
        data-hits-per-page={hitsPerPage}
      />
    ),
  }
})

vi.mock('@/components/filters/FacetFilters', () => {
  return { FacetFilters: () => null }
})
vi.mock('@/components/filters/FilterPanel', () => {
  return {
    FilterPanel: ({ children }: { children: ReactNode }) => <>{children}</>,
  }
})
vi.mock('@/components/hit/Hit', () => {
  return { Hit: () => null }
})
vi.mock('@/components/pagination/Pagination', () => {
  return { Pagination: () => null }
})
vi.mock('@/components/results/FilterSuggestionsWidget', () => {
  return { FilterSuggestionsWidget: () => null }
})
vi.mock('@/components/results/HitsWithInjectedContent', () => {
  return {
    HitsWithInjectedContent: ({
      injection,
    }: {
      injection?: { content: ReactNode }
    }) => <>{injection?.content}</>,
  }
})
vi.mock('@/components/results/QueryCatSuggestion', () => {
  return { QueryCatSuggestion: () => null }
})
vi.mock('@/components/results/QueryRuleBanner', () => {
  return { QueryRuleBanner: () => null }
})
vi.mock('@/components/results/SortByWidget', () => {
  return { SortByWidget: () => null }
})
vi.mock('@/components/results/StoreFilterChip', () => {
  return { StoreFilterChip: () => null }
})

describe('ProductListingPage', () => {
  beforeEach(() => {
    demoOptionsStore.set(inlineArticlesEnabledAtom, true)
  })

  it('keeps the articles index configured while inline articles are disabled', () => {
    demoOptionsStore.set(inlineArticlesEnabledAtom, false)

    const { Wrapper } = buildProvidersWrapper({ store: createTestStore() })

    render(<ProductListingPage header={<h1>Products</h1>} />, {
      wrapper: Wrapper,
    })

    expect(screen.getByTestId('inline-article-configure')).toHaveAttribute(
      'data-hits-per-page',
      '0',
    )
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
