import { describe, expect, it } from 'vitest'

import {
  collapseBlocks,
  getB2BContentArticleHitValues,
  getB2BContentBlogHitValues,
  getB2BContentDocumentationHitValues,
} from '@/app/b2b-content/_utils/getB2BContentHitValues'
import { b2bContentConfig } from '@/app/b2b-content/config'
import type { B2BContentDataBlock } from '@/types/recordHit.types'

const slug = 'b2b-content'
const blogTemplate = b2bContentConfig.algolia.indices.blogs.template!
const docTemplate = b2bContentConfig.algolia.primaryIndex.template!
const articleTemplate = b2bContentConfig.algolia.indices.articles.template!

describe('collapseBlocks', () => {
  it('joins the text of text-type blocks with a space', () => {
    const blocks = [
      { type: 'text', text: 'Hello' },
      { type: 'text', text: 'world' },
    ] as B2BContentDataBlock[]
    expect(collapseBlocks(blocks)).toBe('Hello world')
  })

  it('ignores heading and list blocks', () => {
    const blocks: B2BContentDataBlock[] = [
      { type: 'text', text: 'Keep' },
      { type: 'heading', text: 'Drop' },
      { type: 'list', text: 'Drop too' },
      { type: 'list', text: ['Drop these', 'as well'] },
    ]
    expect(collapseBlocks(blocks)).toBe('Keep')
  })

  it('returns undefined when blocks are undefined', () => {
    expect(collapseBlocks(undefined)).toBeUndefined()
  })

  it('returns undefined when no text content remains', () => {
    const blocks: B2BContentDataBlock[] = [{ type: 'heading', text: 'x' }]
    expect(collapseBlocks(blocks)).toBeUndefined()
  })
})

describe('getB2BContentHitValues — product URLs', () => {
  it('builds documentation, article, and blog URLs from the objectID', () => {
    expect(
      getB2BContentDocumentationHitValues({ objectID: 'D1' }, docTemplate, slug)
        .productUrl,
    ).toBe('/b2b-content/documentation/D1')
    expect(
      getB2BContentArticleHitValues({ objectID: 'A1' }, articleTemplate, slug)
        .productUrl,
    ).toBe('/b2b-content/articles/A1')
    expect(
      getB2BContentBlogHitValues({ objectID: 'B1' }, blogTemplate, slug)
        .productUrl,
    ).toBe('/b2b-content/blogs/B1')
  })
})

describe('getB2BContentBlogHitValues — authorDisplay', () => {
  it('joins author names with a comma', () => {
    const hit = {
      objectID: 'B1',
      authors: [{ name: 'Ada' }, { name: 'Linus' }],
    }
    expect(
      getB2BContentBlogHitValues(hit, blogTemplate, slug).authorDisplay,
    ).toBe('Ada, Linus')
  })

  it('is undefined when there are no authors', () => {
    expect(
      getB2BContentBlogHitValues({ objectID: 'B1' }, blogTemplate, slug)
        .authorDisplay,
    ).toBeUndefined()
  })
})
