import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { ArticleHitValues } from '@/app/travel/hitValues.types'
import { useTravelMapSelection } from '@/app/travel/map/_hooks/useTravelMapSelection'

import type { ReactNode } from 'react'

vi.mock('@/app/travel/_hooks/useRelatedActivities', () => {return {
  useRelatedActivities: (ids: string[]) => {return {
    data: ids.map((id) => {return {
      objectID: `activity-${id}`,
      productUrl: '',
      title: `Activity ${id}`,
    }}),
    isLoading: false,
    error: null,
  }},
}})

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
)

const makeArticle = (
  objectID: string,
  relatedActivities: string[] = [],
): ArticleHitValues => {return {
  objectID,
  productUrl: `/travel/article/${objectID}`,
  title: `Article ${objectID}`,
  relatedActivities,
}}

describe('useTravelMapSelection', () => {
  it('starts with no selection', () => {
    const { result } = renderHook(
      ({ articles }: { articles: ArticleHitValues[] }) =>
        useTravelMapSelection(articles),
      { wrapper, initialProps: { articles: [makeArticle('a1')] } },
    )
    expect(result.current.selectedArticleId).toBeNull()
    expect(result.current.activities).toEqual([])
  })

  it('selectArticle wires related activities through the hook', () => {
    const articles = [makeArticle('a1', ['x', 'y'])]
    const { result } = renderHook(() => useTravelMapSelection(articles), {
      wrapper,
    })
    act(() => result.current.selectArticle('a1'))
    expect(result.current.selectedArticleId).toBe('a1')
    expect(result.current.activities.map((a) => a.objectID)).toEqual([
      'activity-x',
      'activity-y',
    ])
  })

  it('clears selection when hits no longer contain the selected article', () => {
    const { result, rerender } = renderHook(
      ({ articles }: { articles: ArticleHitValues[] }) =>
        useTravelMapSelection(articles),
      { wrapper, initialProps: { articles: [makeArticle('a1')] } },
    )
    act(() => result.current.selectArticle('a1'))
    expect(result.current.selectedArticleId).toBe('a1')

    rerender({ articles: [makeArticle('a2')] })
    expect(result.current.selectedArticleId).toBeNull()
  })
})
