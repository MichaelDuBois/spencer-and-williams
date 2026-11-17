import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { FashionArticleAutocompleteHit } from '@/app/fashion/_components/FashionArticleAutocompleteHit'
import { FashionAutocomplete } from '@/app/fashion/_components/FashionAutocomplete'
import { FashionAutocompletePanel } from '@/app/fashion/_components/FashionAutocompletePanel'

import type { ReactElement } from 'react'

interface CapturedArticlesIndex {
  indexName: string
  searchParameters?: { hitsPerPage: number }
  classNames?: { list?: string; item?: string }
  headerComponent: () => ReactElement
  itemComponent: unknown
  getURL: (item: Record<string, unknown>) => string
}

interface CapturedWidgetProps {
  articlesIndex?: CapturedArticlesIndex
}

const { useActiveConfig, widget } = vi.hoisted(() => {return {
  useActiveConfig: vi.fn(),
  widget: vi.fn((_props: unknown) => null),
}})

vi.mock('@/hooks/useActiveConfig', () => {return { useActiveConfig }})
vi.mock('@/components/autocomplete/AutocompleteWidget', () => {return {
  AutocompleteWidget: (props: unknown) => widget(props),
}})

const renderWidgetProps = () => {
  render(<FashionAutocomplete basePath="/fashion" />)
  return widget.mock.lastCall?.[0] as CapturedWidgetProps
}

describe('FashionAutocomplete', () => {
  beforeEach(() => {
    widget.mockClear()
  })

  it('configures suggestions, AI features and the fashion panel', () => {
    useActiveConfig.mockReturnValue({ algolia: { indices: {} } })
    expect(renderWidgetProps()).toMatchObject({
      basePath: '/fashion',
      showSuggestions: true,
      showAISuggestions: true,
      showAIButton: true,
      querySuggestionsHitsPerPage: 5,
      panelComponent: FashionAutocompletePanel,
    })
  })

  it('registers the active article index as a guides carousel', () => {
    useActiveConfig.mockReturnValue({
      algolia: { indices: { articles: { name: 'fashion_articles_test' } } },
    })
    const { articlesIndex } = renderWidgetProps()

    expect(articlesIndex).toMatchObject({
      indexName: 'fashion_articles_test',
      searchParameters: { hitsPerPage: 8 },
      itemComponent: FashionArticleAutocompleteHit,
      classNames: { list: expect.any(String), item: expect.any(String) },
    })
  })

  it('labels the article section as guides', () => {
    useActiveConfig.mockReturnValue({
      algolia: { indices: { articles: { name: 'fashion_articles_test' } } },
    })
    const { articlesIndex } = renderWidgetProps()
    if (!articlesIndex) throw new Error('Expected an articles index')

    render(articlesIndex.headerComponent())
    expect(screen.getByText('Guides')).toBeInTheDocument()
    expect(screen.queryByText('Articles')).not.toBeInTheDocument()
  })

  it('encodes article detail links under the base path', () => {
    useActiveConfig.mockReturnValue({
      algolia: { indices: { articles: { name: 'fashion_articles_test' } } },
    })
    const { articlesIndex } = renderWidgetProps()

    expect(articlesIndex?.getURL({ objectID: 'article / 1' })).toBe(
      '/fashion/article/article%20%2F%201',
    )
  })

  it('keeps autocomplete usable when no article index is configured', () => {
    useActiveConfig.mockReturnValue({ algolia: { indices: {} } })
    expect(renderWidgetProps()).toMatchObject({
      showSuggestions: true,
      articlesIndex: undefined,
    })
  })

  it('keeps autocomplete usable without an active config', () => {
    useActiveConfig.mockReturnValue(null)
    expect(renderWidgetProps().articlesIndex).toBeUndefined()
  })
})
