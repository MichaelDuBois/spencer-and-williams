import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FashionAutocompletePanel } from '@/app/fashion/_components/FashionAutocompletePanel'

const getColumn = (text: string, slot: string) =>
  screen.getByText(text).closest(`[data-slot="${slot}"]`)

describe('FashionAutocompletePanel', () => {
  it('groups discovery sections apart from result sections', () => {
    render(
      <FashionAutocompletePanel
        sections={{
          recent: <div>Recent</div>,
          suggestions: <div>Suggestions</div>,
          aiSuggestions: <div>AI suggestions</div>,
          products: <div>Products</div>,
          articles: <div>Guides</div>,
        }}
      />,
    )
    const discovery = getColumn('Suggestions', 'autocomplete-discovery')
    const results = getColumn('Products', 'autocomplete-results')

    expect(discovery).toContainElement(screen.getByText('Recent'))
    expect(discovery).toContainElement(screen.getByText('AI suggestions'))
    expect(discovery).not.toContainElement(screen.getByText('Products'))
    expect(results).toContainElement(screen.getByText('Guides'))
    expect(results).not.toContainElement(screen.getByText('Suggestions'))
  })

  it('places discovery before results as sibling columns', () => {
    render(
      <FashionAutocompletePanel
        sections={{
          suggestions: <div>Suggestions</div>,
          products: <div>Products</div>,
        }}
      />,
    )
    const discovery = getColumn('Suggestions', 'autocomplete-discovery')
    const results = getColumn('Products', 'autocomplete-results')

    expect(discovery?.parentElement).toBe(results?.parentElement)
    expect(discovery?.nextElementSibling).toBe(results)
  })

  it('orders products before guides in the results column', () => {
    render(
      <FashionAutocompletePanel
        sections={{
          articles: <div>Guides</div>,
          products: <div>Products</div>,
        }}
      />,
    )
    const products = screen.getByText('Products')

    expect(products.nextElementSibling).toBe(screen.getByText('Guides'))
  })
})
