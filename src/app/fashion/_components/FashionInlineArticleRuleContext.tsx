'use client'

import { Configure } from 'react-instantsearch'

import {
  FASHION_INLINE_ARTICLE_RULE_CONTEXT,
  useInlineArticle,
} from '@/app/fashion/_hooks/useInlineArticle'

/**
 * Sends the inline-article rule context so a matching Rule can return the
 * article's grid position in `userData`. Mounted on the search page only, so
 * it never competes with category/collection pages' own `ruleContexts`.
 */
export const FashionInlineArticleRuleContext = () => {
  const { isFeatureEnabled } = useInlineArticle()

  if (!isFeatureEnabled) return null

  return <Configure ruleContexts={[FASHION_INLINE_ARTICLE_RULE_CONTEXT]} />
}
