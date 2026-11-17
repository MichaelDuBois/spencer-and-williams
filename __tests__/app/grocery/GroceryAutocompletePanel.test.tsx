import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { GroceryAutocompletePanel } from '@/app/grocery/_components/GroceryAutocompletePanel'

const elements = {
  suggestions: <div>Suggestions</div>,
  ai: <div>AI Suggestions</div>,
  products: <div>Products</div>,
  recipes: <div>Recipes</div>,
}

describe('GroceryAutocompletePanel', () => {
  it('places discovery sources beside product and recipe results', () => {
    render(
      <GroceryAutocompletePanel
        sections={{
          suggestions: elements.suggestions,
          aiSuggestions: elements.ai,
          products: elements.products,
          recipes: elements.recipes,
        }}
      />,
    )

    const discovery = screen
      .getByText('Suggestions')
      .closest('[data-slot="autocomplete-discovery"]')
    const results = screen
      .getByText('Products')
      .closest('[data-slot="autocomplete-results"]')

    expect(discovery?.parentElement).toHaveClass(
      'lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)]',
    )
    expect(results).toContainElement(screen.getByText('Recipes'))
    expect(discovery).toContainElement(screen.getByText('AI Suggestions'))
  })
})
