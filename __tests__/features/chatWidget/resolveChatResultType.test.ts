import { describe, expect, it } from 'vitest'

import { b2bContentConfig } from '@/app/b2b-content/config'
import { fashionConfig } from '@/app/fashion/config'
import { groceryConfig } from '@/app/grocery/config'
import { travelConfig } from '@/app/travel/config'
import {
  getB2BContentResultType,
  getFashionResultType,
  getGroceryResultType,
  getTravelResultType,
} from '@/features/chatWidget/utils/resolveChatResultType'

describe('widget result types', () => {
  it('distinguishes travel podcasts and activities from articles', () => {
    expect(getTravelResultType({ cover_image: '/cover.jpg' })).toBe('podcasts')
    expect(getTravelResultType({ parentID: 'article-1' })).toBe('activities')
    expect(getTravelResultType({ title: 'Lisbon guide' })).toBe('articles')
  })

  it('distinguishes all B2B content indices', () => {
    expect(getB2BContentResultType({ blogimage: 'blog.jpg' })).toBe('blogs')
    expect(getB2BContentResultType({ resourceType: 'Guide' })).toBe('resources')
    expect(getB2BContentResultType({ section: { name: 'Help' } })).toBe('articles')
    expect(getB2BContentResultType({ page_title: 'API reference' })).toBe(
      'documentation',
    )
  })

  it('uses index metadata when a sparse hit carries it', () => {
    expect(
      getTravelResultType({
        __indexName: travelConfig.algolia.indices.podcasts.name,
      }),
    ).toBe('podcasts')
    expect(
      getB2BContentResultType({
        __indexName: b2bContentConfig.algolia.indices.resources.name,
      }),
    ).toBe('resources')
  })

  it('uses the primary type for sparse hits and prioritizes specific matches', () => {
    expect(getTravelResultType({ title: 'Lisbon guide' })).toBe('articles')
    expect(
      getTravelResultType({ cover_image: '/cover.jpg', country: 'Portugal' }),
    ).toBe('podcasts')
    expect(getB2BContentResultType({ title: 'API reference' })).toBe(
      'documentation',
    )
    expect(
      getB2BContentResultType({ blogimage: 'blog.jpg', resourceType: 'Guide' }),
    ).toBe('blogs')
  })

  it('distinguishes fashion articles from products by index', () => {
    expect(
      getFashionResultType({
        __indexName: fashionConfig.algolia.indices.articles.name,
      }),
    ).toBe('articles')
    expect(
      getFashionResultType({
        __indexName: fashionConfig.algolia.primaryIndex.name,
        name: 'Wool coat',
        title: 'Product title',
      }),
    ).toBe('products')
  })

  it('falls back to article field shapes for fashion hits without index metadata', () => {
    expect(getFashionResultType({ title: 'Autumn layering' })).toBe('articles')
    expect(getFashionResultType({ banner_image: '/banner.jpg' })).toBe(
      'articles',
    )
    expect(getFashionResultType({ reading_time: 6 })).toBe('articles')
    expect(
      getFashionResultType({ name: 'Wool coat', price: { value: 120 } }),
    ).toBe('products')
  })

  it('distinguishes grocery recipes from products by index', () => {
    expect(
      getGroceryResultType({
        __indexName: groceryConfig.algolia.indices.recipes.name,
      }),
    ).toBe('recipes')
    expect(
      getGroceryResultType({
        __indexName: groceryConfig.algolia.primaryIndex.name,
        name: 'Tomato soup',
        steps: [],
      }),
    ).toBe('products')
  })

  it('falls back to recipe field shapes for grocery hits without index metadata', () => {
    expect(getGroceryResultType({ steps: [{ title: 'Chop' }] })).toBe('recipes')
    expect(getGroceryResultType({ attrs: [{ key: 'cuisine', val: 'Italian' }] })).toBe(
      'recipes',
    )
    expect(getGroceryResultType({ name: 'Tomato soup', price: 4.99 })).toBe(
      'products',
    )
  })
})
