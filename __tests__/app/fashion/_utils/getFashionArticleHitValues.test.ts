import { describe, expect, it } from 'vitest'

import { getFashionArticleHitValues } from '@/app/fashion/_utils/getFashionArticleHitValues'
import { fashionConfig } from '@/app/fashion/config'

const template = fashionConfig.algolia.indices.articles.template!
const slug = 'fashion'

const baseHit = {
  objectID: 'fashion-article-zip-and-puff-city-kit',
  title: 'Zip, Puff, Roll: A City Kit for Blue-on-Grey Weekend Wear',
}

describe('getFashionArticleHitValues', () => {
  it('links through to the article route', () => {
    expect(getFashionArticleHitValues(baseHit, template, slug).productUrl).toBe(
      '/fashion/article/fashion-article-zip-and-puff-city-kit',
    )
  })

  it('maps the snake_case record onto camelCase article values', () => {
    const result = getFashionArticleHitValues(
      {
        ...baseHit,
        subtitle: 'A single outfit that balances casual sportiness',
        category: 'Styling Guide',
        published_at: '2026-01-15T12:00:00.000Z',
        published_at_timestamp: 1768478400,
        reading_time: 5,
        seasonality: ['autumn', 'winter'],
        tags: ['men', 'layering'],
        excerpt: 'Layer a Moncler blue zip hoodie under a puffer.',
        ai_summary: 'A tonal blue-and-grey outfit.',
        key_quotes: ['Two blues on top and a neutral grey base.'],
        related_products: ['M0E20000000DU05', 'M0E20000000EXIQ'],
        promoted: true,
      },
      template,
      slug,
    )

    expect(result).toMatchObject({
      title: 'Zip, Puff, Roll: A City Kit for Blue-on-Grey Weekend Wear',
      subtitle: 'A single outfit that balances casual sportiness',
      category: 'Styling Guide',
      publishedAt: '2026-01-15T12:00:00.000Z',
      publishedAtTimestamp: 1768478400,
      readingTime: 5,
      seasonality: ['autumn', 'winter'],
      tags: ['men', 'layering'],
      excerpt: 'Layer a Moncler blue zip hoodie under a puffer.',
      aiSummary: 'A tonal blue-and-grey outfit.',
      keyQuotes: ['Two blues on top and a neutral grey base.'],
      relatedProducts: ['M0E20000000DU05', 'M0E20000000EXIQ'],
      promoted: true,
    })
  })

  it('keeps the nested author object intact', () => {
    const author = {
      name: 'Spencer & Williams Editorial',
      role: 'Style Editor',
      avatar: null,
    }

    expect(
      getFashionArticleHitValues({ ...baseHit, author }, template, slug).author,
    ).toEqual(author)
  })

  it('preserves body blocks in record order', () => {
    const body = [
      { type: 'heading', text: 'The lineup' },
      { type: 'text', text: 'This outfit is built from five pieces.' },
      { type: 'list', text: 'Blue Moncler zip hoodie' },
    ]

    expect(
      getFashionArticleHitValues({ ...baseHit, body }, template, slug).body,
    ).toEqual(body)
  })

  it('resolves both banner and thumbnail image fields', () => {
    const result = getFashionArticleHitValues(
      {
        ...baseHit,
        banner_image: 'https://cdn.example.com/banner.jpg',
        thumbnail_image: 'https://cdn.example.com/thumb.jpg',
      },
      template,
      slug,
    )

    expect(result.image).toBe('https://cdn.example.com/banner.jpg')
    expect(result.thumbnail).toBe('https://cdn.example.com/thumb.jpg')
  })

  it('leaves absent attributes undefined', () => {
    const result = getFashionArticleHitValues(baseHit, template, slug)

    expect(result.subtitle).toBeUndefined()
    expect(result.author).toBeUndefined()
    expect(result.relatedProducts).toBeUndefined()
    expect(result.body).toBeUndefined()
  })
})
