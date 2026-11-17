import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { InlineArticleIndex } from '@/app/fashion/_components/InlineArticleIndex'

import type { ReactNode } from 'react'

vi.mock('@/app/fashion/config', async (importOriginal) => {
  const { fashionConfig } = await importOriginal<
    typeof import('@/app/fashion/config')
  >()
  const template = fashionConfig.algolia.indices.articles.template

  if (!template) throw new Error('Expected the fashion articles template')

  return {
    fashionConfig: {
      ...fashionConfig,
      algolia: {
        ...fashionConfig.algolia,
        indices: {
          ...fashionConfig.algolia.indices,
          articles: {
            ...fashionConfig.algolia.indices.articles,
            template: {
              ...template,
              attributes: {
                ...template.attributes,
                title: 'article_title',
                category: 'article_category',
                relatedCategories: 'article_related_categories',
                readingTime: 'article_reading_time',
                thumbnail: 'article_thumbnail',
                image: 'article_image',
              },
            },
          },
        },
      },
    },
  }
})

vi.mock('react-instantsearch', () => {
  return {
    useInstantSearch: () => {
      return {
        results: {
          _state: { filters: 'categoryPageId:"Wrong category"' },
        },
      }
    },
    Index: ({ children }: { children: ReactNode }) => <>{children}</>,
    Configure: ({
      attributesToRetrieve,
      filters,
      hitsPerPage,
    }: {
      attributesToRetrieve: string[]
      filters: string
      hitsPerPage: number
    }) => (
      <output
        data-testid="configure"
        data-filters={filters}
        data-hits-per-page={hitsPerPage}>
        {JSON.stringify(attributesToRetrieve)}
      </output>
    ),
  }
})

describe('InlineArticleIndex', () => {
  it('retrieves article card attributes from the configured template', () => {
    render(<InlineArticleIndex isEnabled />)

    expect(screen.getByTestId('configure')).toHaveAttribute(
      'data-hits-per-page',
      '1',
    )
    expect(screen.getByTestId('configure')).toHaveTextContent(
      JSON.stringify([
        'objectID',
        'article_title',
        'article_category',
        'article_reading_time',
        'article_thumbnail',
        'article_image',
      ]),
    )
  })

  it('emits the configured article filter for a resolved category', () => {
    render(<InlineArticleIndex category="Women > Bags" isEnabled />)

    expect(screen.getByTestId('configure')).toHaveAttribute(
      'data-filters',
      'article_related_categories:"Women > Bags"',
    )
  })

  it('clears inherited filters when no category is provided', () => {
    render(<InlineArticleIndex isEnabled />)

    expect(screen.getByTestId('configure')).toHaveAttribute('data-filters', '')
  })

  it('requests no article hits while inline articles are disabled', () => {
    render(<InlineArticleIndex isEnabled={false} />)

    expect(screen.getByTestId('configure')).toHaveAttribute(
      'data-hits-per-page',
      '0',
    )
  })
})
