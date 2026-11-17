import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { RecipeAutocompleteHit } from '@/components/autocomplete/hits/RecipeAutocompleteHit'

vi.mock('react-instantsearch', () => {
  return {
    Highlight: ({ attribute }: { attribute: string }) => (
      <span data-testid="highlight" data-attribute={attribute} />
    ),
  }
})

const recipeItem = {
  objectID: 'spaghetti_carbonara',
  name: 'Spaghetti Carbonara',
  image: 'https://cdn.example.com/carbonara.png',
  attrs: [
    { key: 'Prep', val: '10m' },
    { key: 'Cook', val: '15m' },
    { key: 'Level', val: 'Intermediate' },
  ],
}

describe('RecipeAutocompleteHit', () => {
  it('highlights the recipe name', () => {
    render(<RecipeAutocompleteHit item={recipeItem} onSelect={() => {}} />)

    expect(screen.getByTestId('highlight')).toHaveAttribute(
      'data-attribute',
      'name',
    )
  })

  it('renders a Prep • Level meta line and omits Cook', () => {
    render(<RecipeAutocompleteHit item={recipeItem} onSelect={() => {}} />)

    expect(screen.getByText('10m • Intermediate')).toBeInTheDocument()
  })

  it('fires onSelect when clicked', () => {
    const onSelect = vi.fn()
    render(<RecipeAutocompleteHit item={recipeItem} onSelect={onSelect} />)

    screen.getByRole('button').click()
    expect(onSelect).toHaveBeenCalledOnce()
  })
})
