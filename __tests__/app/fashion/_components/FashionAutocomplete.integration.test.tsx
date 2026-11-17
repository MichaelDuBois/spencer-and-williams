import { fireEvent, render, screen } from '@testing-library/react'
import { Autocomplete, InstantSearch } from 'react-instantsearch'
import { describe, expect, it, vi } from 'vitest'

import { FashionArticleAutocompleteHit } from '@/app/fashion/_components/FashionArticleAutocompleteHit'
import { FashionAutocompletePanel } from '@/app/fashion/_components/FashionAutocompletePanel'

import type { SearchClient } from 'instantsearch.js'

vi.mock('@/components/image/Image', () => {return { Image: () => null }})

describe('fashion article autocomplete', () => {
  it('selects an article with its detail page URL', async () => {
    const search = vi.fn(async (requests: { indexName: string; params?: { query?: string } }[]) => {return {
      results: requests.map(({ indexName, params }) => {return {
        index: indexName,
        hits: indexName === 'fashion_articles' ? [{ objectID: 'article-1', title: 'Summer dresses', category: 'Style' }] : [],
        nbHits: indexName === 'fashion_articles' ? 1 : 0,
        page: 0,
        nbPages: 1,
        hitsPerPage: 3,
        processingTimeMS: 1,
        query: params?.query ?? '',
        params: '',
        exhaustiveNbHits: true,
      }}),
    }})
    const onSelect = vi.fn()
    render(
      <InstantSearch searchClient={{ search } as SearchClient} indexName="products">
        <Autocomplete
          detachedMediaQuery=""
          indices={[{
            indexName: 'fashion_articles',
            itemComponent: FashionArticleAutocompleteHit,
            getURL: (item) => `/fashion/article/${item.objectID}`,
          }]}
          onSelect={onSelect}
          panelComponent={({ elements }) => (
            <FashionAutocompletePanel sections={{ articles: elements.fashion_articles }} />
          )}
        />
      </InstantSearch>,
    )

    fireEvent.focus(screen.getByRole('combobox'))
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'dress' } })
    fireEvent.click(await screen.findByRole('button', { name: /summer dresses/i }))
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/fashion/article/article-1' }),
    )
  })
})
