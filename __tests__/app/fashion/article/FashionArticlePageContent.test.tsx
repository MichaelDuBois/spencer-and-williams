import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { FashionArticlePageContent } from '@/app/fashion/article/[id]/_components/FashionArticlePageContent'
import type { FashionArticleHitValues } from '@/app/fashion/hitValues.types'

import { render } from '@tests/helpers/test-utils'

vi.mock('@/app/fashion/_components/FashionAiSummary', () => {return {
  FashionAiSummary: () => <div>fashion-ai-summary</div>,
}})

vi.mock(
  '@/app/fashion/article/[id]/_components/FashionArticleHeader',
  () => {return { FashionArticleHeader: () => null }},
)

vi.mock(
  '@/app/fashion/article/[id]/_components/FashionArticleBody',
  () => {return { FashionArticleBody: () => null }},
)

vi.mock(
  '@/app/fashion/article/[id]/_components/FashionArticleProducts',
  () => {return { FashionArticleProducts: () => null }},
)

vi.mock('@/components/BackToResults', () => {return {
  BackToResults: () => null,
}})

describe('FashionArticlePageContent', () => {
  it('aligns the AI summary with the article content column', () => {
    render(
      <FashionArticlePageContent
        article={
          {
            objectID: 'fashion-article',
            productUrl: '/fashion/article/fashion-article',
            title: 'A City Guide to Tonal Layers',
          } as FashionArticleHitValues
        }
        products={[]}
        isProductsLoading={false}
      />,
    )

    expect(screen.getByText('fashion-ai-summary').parentElement).toHaveClass(
      'mx-auto',
      'max-w-2xl',
    )
  })
})
