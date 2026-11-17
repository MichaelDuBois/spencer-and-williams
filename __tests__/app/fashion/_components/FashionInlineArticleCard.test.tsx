import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FashionInlineArticleCard } from '@/app/fashion/_components/FashionInlineArticleCard'
import type { FashionArticleHitValues } from '@/app/fashion/hitValues.types'

const article: FashionArticleHitValues = {
  objectID: 'fashion-article-winter-coats',
  productUrl: '/fashion/article/fashion-article-winter-coats',
  title: 'The Coat Edit: Five Ways to Wear Winter Outerwear',
  thumbnail: 'https://cdn.example.com/winter-coats.jpg',
  category: 'Styling Guide',
  readingTime: 6,
}

describe('FashionInlineArticleCard', () => {
  it('renders the article metadata and detail-page link', () => {
    render(<FashionInlineArticleCard article={article} />)

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/fashion/article/fashion-article-winter-coats',
    )
    expect(
      screen.getByRole('heading', {
        name: 'The Coat Edit: Five Ways to Wear Winter Outerwear',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Styling Guide')).toBeInTheDocument()
    expect(screen.getByText('6 min read')).toBeInTheDocument()
    expect(screen.getByText('Read the story')).toBeInTheDocument()
  })

  it('links to the url override instead of the detail page when given', () => {
    render(
      <FashionInlineArticleCard
        article={article}
        urlOverride="https://example.com/some-promo"
      />,
    )

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://example.com/some-promo',
    )
  })

  it('renders a defined zero read time as metadata', () => {
    render(
      <FashionInlineArticleCard
        article={{
          ...article,
          readingTime: 0,
        }}
      />,
    )

    expect(screen.getByText('0 min read')).toBeInTheDocument()
  })

  it('prefers the thumbnail image and uses the title as its alt text', () => {
    render(
      <FashionInlineArticleCard
        article={{
          ...article,
          image: 'https://cdn.example.com/banner.jpg',
        }}
      />,
    )

    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://cdn.example.com/winter-coats.jpg',
    )
    expect(screen.getByRole('img')).toHaveAttribute('alt', article.title)
  })

  it('omits the metadata row when category and read time are absent', () => {
    render(
      <FashionInlineArticleCard
        article={{
          objectID: article.objectID,
          productUrl: article.productUrl,
          title: article.title,
        }}
      />,
    )

    expect(screen.queryByText('Styling Guide')).not.toBeInTheDocument()
    expect(screen.queryByText(/min read/)).not.toBeInTheDocument()
  })
})
