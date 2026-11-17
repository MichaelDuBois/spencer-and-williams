import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { RecipeHitValues } from '@/app/grocery/hitValues.types'
import { GroceryRecipeCard } from '@/features/aiAssistant/components/messages/grocery/GroceryRecipeCard'

import { buildProvidersWrapper } from '../../../../../helpers/test-utils'

import type { ComponentProps } from 'react'

vi.mock('next/link', () => {return {
  default: ({ children, ...props }: ComponentProps<'a'>) => (
    <a {...props}>{children}</a>
  ),
}})

const renderCard = (
  directData?: RecipeHitValues,
  item = { objectID: 'r1', why: '' },
) => render(<GroceryRecipeCard item={item} directData={directData} />, {
    wrapper: buildProvidersWrapper().Wrapper,
  })

describe('GroceryRecipeCard', () => {
  it('renders the recipe name, description and plural steps chip', () => {
    renderCard({
      objectID: 'r1',
      productUrl: '/grocery/recipe/r1',
      name: 'Pumpkin soup',
      description: 'A cozy autumn classic.',
      image: '/soup.jpg',
      steps: [
        { title: 'Chop', ingredient: 'ROMAINE_LETTUCE', quantity: 1, unit: '', explanation: '' },
        { title: 'Simmer', ingredient: 'Yogurt', quantity: 1, unit: '', explanation: '' },
      ],
    })

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/grocery/recipe/r1',
    )
    expect(screen.getByText('Pumpkin soup')).toBeInTheDocument()
    expect(screen.getByText('A cozy autumn classic.')).toBeInTheDocument()
    expect(screen.getByText('2 steps')).toBeInTheDocument()
    expect(screen.getByText('romaine lettuce · yogurt')).toBeInTheDocument()
    expect(screen.getByText('Chop')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('target', '_blank')
  })

  it('uses the singular steps chip for a single-step recipe', () => {
    renderCard({
      objectID: 'r2',
      productUrl: '/grocery/recipe/r2',
      name: 'Caprese salad',
      steps: [
        { title: 'Assemble', ingredient: 'mozzarella', quantity: 1, unit: '', explanation: '' },
      ],
    })

    expect(screen.getByText('1 step')).toBeInTheDocument()
  })

  it('omits the steps chip when the recipe has no steps', () => {
    renderCard({
      objectID: 'r3',
      productUrl: '/grocery/recipe/r3',
      name: 'Leafy greens',
    }, { objectID: 'r3', why: 'Fresh pick' })

    expect(screen.getByText('Leafy greens')).toBeInTheDocument()
    expect(screen.queryByText('Fresh pick')).not.toBeInTheDocument()
    expect(screen.getByText('No image')).toBeInTheDocument()
    expect(screen.queryByText(/step/)).not.toBeInTheDocument()
  })

  it('renders a skeleton without a link when directData is absent', () => {
    renderCard()

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})
