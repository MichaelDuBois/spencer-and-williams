'use client'

import { useAtomValue } from 'jotai'
import { useInstantSearch } from 'react-instantsearch'

import { INLINE_ARTICLE_INDEX_ID } from '@/app/fashion/_components/InlineArticleIndex'
import { getFashionArticleHitValues } from '@/app/fashion/_utils/getFashionArticleHitValues'
import { fashionConfig } from '@/app/fashion/config'
import type { FashionArticleHitValues } from '@/app/fashion/hitValues.types'
import {
  demoOptionsStore,
  inlineArticlesEnabledAtom,
} from '@/stores/demoOptions'

/** Rule context that lets an Algolia Rule set the article's grid position. */
export const FASHION_INLINE_ARTICLE_RULE_CONTEXT = 'fashion_inline_article'

interface InlineArticle {
  /** Whether the articles index should request a hit and render its card. */
  isEnabled: boolean
  /** Whether inline articles are on at all, regardless of the current page. */
  isFeatureEnabled: boolean
  article: FashionArticleHitValues | null
  /** Grid slot for the article, from a Rule's `userData` or the default. */
  position: number
  /** Link target from a Rule's `userData`, replacing the article's own URL. */
  urlOverride?: string
}

interface InjectedArticleConsequence {
  position: number
  url?: string
}

/** A Rule's `userData` as written by the dashboard's Custom Consequence builder. */
interface RuleUserDataEntry {
  consequences?: {
    injectedArticle?: unknown[]
  }
}

const isRuleUserDataEntry = (entry: unknown): entry is RuleUserDataEntry =>
  typeof entry === 'object' && entry !== null

const isInjectedArticleConsequence = (
  value: unknown,
): value is InjectedArticleConsequence =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as { position?: unknown }).position === 'number' &&
  ((value as { url?: unknown }).url === undefined ||
    typeof (value as { url?: unknown }).url === 'string')

const getInjectedArticleConsequence = (
  userData: unknown[] | undefined,
): InjectedArticleConsequence | undefined => {
  for (const entry of userData ?? []) {
    if (!isRuleUserDataEntry(entry)) continue
    const injectedArticle = entry.consequences?.injectedArticle
    if (!Array.isArray(injectedArticle)) continue
    const [first] = injectedArticle
    if (isInjectedArticleConsequence(first)) return first
  }
  return undefined
}

const DEFAULT_ARTICLE_SLOT_INDEX = 6

export const useInlineArticle = (): InlineArticle => {
  const { results, scopedResults } = useInstantSearch()
  const inlineArticlesEnabled = useAtomValue(inlineArticlesEnabledAtom, {
    store: demoOptionsStore,
  })

  const { algolia, features, slug } = fashionConfig
  const template = algolia.indices.articles.template

  // First page only. The article is chosen per query rather than per page, so
  // carrying it onto later pages would repeat the same card as the user pages.
  const page = (results as unknown as { page?: number })?.page ?? 0
  const userData = (results as unknown as { userData?: unknown[] })?.userData

  const injectedArticleConsequence = getInjectedArticleConsequence(userData)
  const position =
    injectedArticleConsequence?.position ?? DEFAULT_ARTICLE_SLOT_INDEX
  const urlOverride =
    injectedArticleConsequence?.url &&
    injectedArticleConsequence.url.trim() !== ''
      ? injectedArticleConsequence.url
      : undefined

  const isFeatureEnabled =
    Boolean(features.showInlineArticles) &&
    Boolean(template) &&
    inlineArticlesEnabled

  const isEnabled = isFeatureEnabled && page === 0

  if (!isEnabled) {
    return {
      isEnabled: false,
      isFeatureEnabled,
      article: null,
      position,
      urlOverride,
    }
  }

  const hit = scopedResults.find(
    (scoped) => scoped.indexId === INLINE_ARTICLE_INDEX_ID,
  )?.results?.hits[0]

  return {
    isEnabled: true,
    isFeatureEnabled,
    article: hit ? getFashionArticleHitValues(hit, template!, slug) : null,
    position,
    urlOverride,
  }
}
