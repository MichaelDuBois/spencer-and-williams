import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { FashionArticleHitValues } from '@/app/fashion/hitValues.types'
import { FashionProductArticles } from '@/app/fashion/product/[id]/_components/FashionProductArticles'
import { relatedArticlesContextState } from '@/features/aiAssistant/stores/aiAssistant'

import { renderWithProviders } from '@tests/helpers/test-utils'


const { mockUseFashionArticles } = vi.hoisted(() => {
  return { mockUseFashionArticles: vi.fn() }
})

vi.mock('@/app/fashion/_hooks/useFashionArticles', () => {
  return { useFashionArticles: mockUseFashionArticles }
})

const buildArticle = (
  objectID: string,
  overrides: Partial<FashionArticleHitValues> = {},
): FashionArticleHitValues => {
  return {
    objectID,
    productUrl: `/fashion/article/${objectID}`,
    title: `Article ${objectID}`,
    category: 'Styling Guide',
    readingTime: 5,
    thumbnail: `https://cdn.example.com/${objectID}.jpg`,
    ...overrides,
  }
}

const renderSection = (
  articles: FashionArticleHitValues[],
  isLoading = false,
) => {
  mockUseFashionArticles.mockReturnValue({ articles, isLoading })
  return renderWithProviders(
    <FashionProductArticles objectID="M0E20000000DU05" />,
  )
}

describe('FashionProductArticles', () => {
  it('queries the articles that mention the product, capped at three', () => {
    renderSection([buildArticle('a')])

    expect(mockUseFashionArticles).toHaveBeenCalledWith({
      key: 'product-articles',
      count: 3,
      filters: 'related_products:"M0E20000000DU05"',
      enabled: true,
    })
  })

  it('renders a card per matching article, linking through to the article', () => {
    renderSection([
      buildArticle('zip-and-puff-city-kit'),
      buildArticle('five-piece-winter-capsule'),
    ])

    expect(
      screen.getByRole('heading', { name: 'Featured In The Journal' }),
    ).toBeInTheDocument()

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute(
      'href',
      '/fashion/article/zip-and-puff-city-kit',
    )
    expect(links[1]).toHaveAttribute(
      'href',
      '/fashion/article/five-piece-winter-capsule',
    )
  })

  it('shows the category and reading time on each card', () => {
    renderSection([buildArticle('a', { category: 'Trend Report' })])

    expect(screen.getByText('Trend Report · 5 min read')).toBeInTheDocument()
  })

  it('drops the reading time when the article has none', () => {
    renderSection([buildArticle('a', { readingTime: undefined })])

    expect(screen.getByText('Styling Guide')).toBeInTheDocument()
    expect(screen.queryByText(/min read/)).not.toBeInTheDocument()
  })

  it('renders nothing when no article mentions the product', () => {
    const { container } = renderSection([])

    expect(container).toBeEmptyDOMElement()
  })

  it('holds the section with a skeleton while articles are loading', () => {
    renderSection([], true)

    expect(
      screen.getByRole('heading', { name: 'Featured In The Journal' }),
    ).toBeInTheDocument()
    expect(screen.queryAllByRole('link')).toHaveLength(0)
  })

  describe('AI assistant context', () => {
    it('publishes the matched articles for the assistant to recommend', () => {
      const { store } = renderSection([
        buildArticle('zip-and-puff', { category: 'Trend Report' }),
      ])

      expect(store.get(relatedArticlesContextState)).toEqual([
        {
          objectID: 'zip-and-puff',
          title: 'Article zip-and-puff',
          url: '/fashion/article/zip-and-puff',
          category: 'Trend Report',
          readingTime: 5,
        },
      ])
    })

    it('leaves the context unset when no article mentions the product', () => {
      const { store } = renderSection([])

      expect(store.get(relatedArticlesContextState)).toBeNull()
    })

    it('clears the context when the PDP unmounts', () => {
      const { store, unmount } = renderSection([buildArticle('a')])

      expect(store.get(relatedArticlesContextState)).toHaveLength(1)

      unmount()

      expect(store.get(relatedArticlesContextState)).toBeNull()
    })
  })
})
