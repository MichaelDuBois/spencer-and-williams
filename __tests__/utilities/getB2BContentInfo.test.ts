import { describe, expect, it } from 'vitest'

import {
  getB2BContentInfo,
  type B2BContentProps,
} from '@/app/b2b-content/_utils/getB2BContentInfo'
import type {
  B2BContentArticleHitValues,
  B2BContentBlogHitValues,
  B2BContentDocumentationHitValues,
  B2BContentResourceHitValues,
} from '@/app/b2b-content/hitValues.types'

const docValues: B2BContentDocumentationHitValues = {
  objectID: 'doc-1',
  productUrl: '/b2b-content/documentation/doc-1',
  title: 'Getting Started',
  description: 'How to get started with the API.',
  docType: 'guide',
  breadcrumb: [],
}

const articleValues: B2BContentArticleHitValues = {
  objectID: 'article-1',
  productUrl: '/b2b-content/articles/article-1',
  title: 'Troubleshooting',
  body: [
    { type: 'heading', text: 'Common Issues' },
    { type: 'text', text: 'Check your API key.' },
    { type: 'text', text: 'Verify your index name.' },
  ],
  breadcrumb: [],
}

const blogValues: B2BContentBlogHitValues = {
  objectID: 'blog-1',
  productUrl: '/b2b-content/blogs/blog-1',
  title: 'What is new in 2026',
  description: '  A look at the latest features.  ',
}

const resourceValues: B2BContentResourceHitValues = {
  objectID: 'resource-1',
  productUrl: '/b2b-content/resources/resource-1',
  title: 'Search Best Practices',
  description: 'Tips for improving search relevance.',
  docType: 'whitepaper',
}

describe('getB2BContentInfo', () => {
  it('detects documentation and maps to the correct index key', () => {
    const result = getB2BContentInfo({ documentation: docValues })

    expect(result.contentType).toBe('documentation')
    expect(result.indexKey).toBe('documentation')
    expect(result.record).toBe(docValues)
  })

  it('extracts description as fallback summary for documentation', () => {
    const result = getB2BContentInfo({ documentation: docValues })

    expect(result.fallbackSummary).toBe('How to get started with the API.')
  })

  it('detects article and maps to the correct index key', () => {
    const result = getB2BContentInfo({
      article: articleValues,
    } as B2BContentProps)

    expect(result.contentType).toBe('article')
    expect(result.indexKey).toBe('articles')
    expect(result.record).toBe(articleValues)
  })

  it('extracts joined text blocks as fallback summary for article', () => {
    const result = getB2BContentInfo({
      article: articleValues,
    } as B2BContentProps)

    expect(result.fallbackSummary).toBe(
      'Check your API key. Verify your index name.',
    )
  })

  it('detects blog and maps to the correct index key', () => {
    const result = getB2BContentInfo({ blog: blogValues } as B2BContentProps)

    expect(result.contentType).toBe('blog')
    expect(result.indexKey).toBe('blogs')
    expect(result.record).toBe(blogValues)
  })

  it('trims whitespace from the fallback summary', () => {
    const result = getB2BContentInfo({ blog: blogValues } as B2BContentProps)

    expect(result.fallbackSummary).toBe('A look at the latest features.')
  })

  it('detects resource and maps to the correct index key', () => {
    const result = getB2BContentInfo({
      resource: resourceValues,
    } as B2BContentProps)

    expect(result.contentType).toBe('resource')
    expect(result.indexKey).toBe('resources')
    expect(result.record).toBe(resourceValues)
  })

  it('extracts description as fallback summary for resource', () => {
    const result = getB2BContentInfo({
      resource: resourceValues,
    } as B2BContentProps)

    expect(result.fallbackSummary).toBe(
      'Tips for improving search relevance.',
    )
  })

  it('returns empty string when fallback value is missing', () => {
    const emptyDoc: B2BContentDocumentationHitValues = {
      objectID: 'doc-empty',
      productUrl: '/b2b-content/documentation/doc-empty',
      title: 'No Description',
      breadcrumb: [],
    }
    const result = getB2BContentInfo({ documentation: emptyDoc })

    expect(result.fallbackSummary).toBe('')
  })

  it('returns empty string when article has no text blocks', () => {
    const emptyArticle: B2BContentArticleHitValues = {
      objectID: 'article-empty',
      productUrl: '/b2b-content/articles/article-empty',
      title: 'Empty Article',
      body: [{ type: 'heading', text: 'Only a heading' }],
      breadcrumb: [],
    }
    const result = getB2BContentInfo({
      article: emptyArticle,
    } as B2BContentProps)

    expect(result.fallbackSummary).toBe('')
  })
})
