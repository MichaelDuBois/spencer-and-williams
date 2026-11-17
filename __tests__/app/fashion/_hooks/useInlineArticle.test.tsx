import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { INLINE_ARTICLE_INDEX_ID } from '@/app/fashion/_components/InlineArticleIndex'
import { useInlineArticle } from '@/app/fashion/_hooks/useInlineArticle'
import {
  demoOptionsStore,
  inlineArticlesEnabledAtom,
} from '@/stores/demoOptions'

import { createTestStore } from '@tests/helpers/jotai-wrapper'
import { buildProvidersWrapper } from '@tests/helpers/test-utils'

const useInstantSearch = vi.hoisted(() => vi.fn())

vi.mock('react-instantsearch', () => {return { useInstantSearch }})

const articleHit = {
  objectID: 'fashion-article-coat-edit',
  title: 'The Coat Edit: Five Ways to Wear Winter Outerwear',
  category: 'Styling Guide',
  thumbnail_image: 'https://cdn.example.com/coats.jpg',
  reading_time: 6,
}

const renderInlineArticle = ({
  page = 0,
  hits = [articleHit],
  indexId = INLINE_ARTICLE_INDEX_ID,
  inlineArticlesEnabled = true,
  userData,
}: {
  page?: number
  userData?: unknown[]
  hits?: Record<string, unknown>[]
  indexId?: string
  inlineArticlesEnabled?: boolean
} = {}) => {
  useInstantSearch.mockReturnValue({
    results: { page, userData },
    scopedResults: [
      { indexId: 'fashion_ns', results: { hits: [{ objectID: 'p1' }] } },
      { indexId, results: { hits } },
    ],
  })

  demoOptionsStore.set(inlineArticlesEnabledAtom, inlineArticlesEnabled)

  return renderHook(() => useInlineArticle(), {
    wrapper: buildProvidersWrapper({ store: createTestStore() }).Wrapper,
  })
}

describe('useInlineArticle', () => {
  beforeEach(() => {
    demoOptionsStore.set(inlineArticlesEnabledAtom, true)
  })

  it('maps the articles feed hit to article values', () => {
    const { result } = renderInlineArticle()

    expect(result.current.isEnabled).toBe(true)
    expect(result.current.article).toMatchObject({
      objectID: 'fashion-article-coat-edit',
      title: 'The Coat Edit: Five Ways to Wear Winter Outerwear',
      category: 'Styling Guide',
      readingTime: 6,
      productUrl: '/fashion/article/fashion-article-coat-edit',
    })
  })

  it('reports no article when the articles feed is empty', () => {
    const { result } = renderInlineArticle({ hits: [] })

    expect(result.current.isEnabled).toBe(true)
    expect(result.current.article).toBeNull()
  })

  // Guards against reading whichever feed happens to be first.
  it('ignores feeds belonging to other indices', () => {
    const { result } = renderInlineArticle({ indexId: 'some_other_index' })

    expect(result.current.article).toBeNull()
  })

  // The article is picked per query rather than per page, so carrying it onto
  // later pages would repeat the same card as the user pages through.
  it.each([1, 2, 5])('is disabled on page index %i', (page) => {
    const { result } = renderInlineArticle({ page })

    expect(result.current.isEnabled).toBe(false)
    expect(result.current.article).toBeNull()
  })

  it('is enabled again back on the first page', () => {
    expect(renderInlineArticle({ page: 0 }).result.current.isEnabled).toBe(true)
  })

  // isEnabled drives the articles index's hit count, so switching the toggle
  // off has to stop retrieving hits, not just hide the card.
  it('is disabled while the inline articles toggle is off', () => {
    const { result } = renderInlineArticle({ inlineArticlesEnabled: false })

    expect(result.current.isEnabled).toBe(false)
    expect(result.current.article).toBeNull()
  })

  describe('position', () => {
    it('falls back to the default slot when no rule sets userData', () => {
      expect(renderInlineArticle().result.current.position).toBe(6)
    })

    it('reads the slot from an injectedArticle custom consequence', () => {
      const { result } = renderInlineArticle({
        userData: [
          { consequences: { banner: [{ position: 1 }] } },
          { consequences: { injectedArticle: [{ position: 3 }] } },
        ],
      })

      expect(result.current.position).toBe(3)
    })

    it('takes the first injectedArticle instance', () => {
      const { result } = renderInlineArticle({
        userData: [
          {
            consequences: { injectedArticle: [{ position: 2 }, { position: 9 }] },
          },
        ],
      })

      expect(result.current.position).toBe(2)
    })

    it('falls back to the default slot when no entry matches', () => {
      const { result } = renderInlineArticle({
        userData: [{ consequences: { banner: [{ position: 1 }] } }, {}],
      })

      expect(result.current.position).toBe(6)
    })

    it('falls back to the default slot when injectedArticle is empty', () => {
      const { result } = renderInlineArticle({
        userData: [{ consequences: { injectedArticle: [] } }],
      })

      expect(result.current.position).toBe(6)
    })

    it('ignores an injectedArticle entry without a numeric position', () => {
      const { result } = renderInlineArticle({
        userData: [
          { consequences: { injectedArticle: [{ position: '3' }] } },
          null,
        ],
      })

      expect(result.current.position).toBe(6)
    })

    it('is still available off the first page', () => {
      const { result } = renderInlineArticle({
        page: 2,
        userData: [{ consequences: { injectedArticle: [{ position: 3 }] } }],
      })

      expect(result.current.position).toBe(3)
    })
  })

  describe('urlOverride', () => {
    it('reads the url from an injectedArticle custom consequence', () => {
      const { result } = renderInlineArticle({
        userData: [
          {
            consequences: {
              injectedArticle: [
                { position: 3, url: 'https://example.com/some-promo' },
              ],
            },
          },
        ],
      })

      expect(result.current.position).toBe(3)
      expect(result.current.urlOverride).toBe('https://example.com/some-promo')
    })

    it('is undefined when the consequence has no url', () => {
      const { result } = renderInlineArticle({
        userData: [{ consequences: { injectedArticle: [{ position: 3 }] } }],
      })

      expect(result.current.urlOverride).toBeUndefined()
    })

    it('is undefined when the url is an empty string', () => {
      const { result } = renderInlineArticle({
        userData: [
          { consequences: { injectedArticle: [{ position: 3, url: '' }] } },
        ],
      })

      expect(result.current.position).toBe(3)
      expect(result.current.urlOverride).toBeUndefined()
    })

    it('is undefined when no rule sets userData', () => {
      expect(renderInlineArticle().result.current.urlOverride).toBeUndefined()
    })
  })

  describe('isFeatureEnabled', () => {
    // The rule context is sent on every page, so this ignores pagination.
    it('stays enabled off the first page', () => {
      expect(
        renderInlineArticle({ page: 2 }).result.current.isFeatureEnabled,
      ).toBe(true)
    })

    it('is disabled while the inline articles toggle is off', () => {
      expect(
        renderInlineArticle({ inlineArticlesEnabled: false }).result.current
          .isFeatureEnabled,
      ).toBe(false)
    })
  })
})
