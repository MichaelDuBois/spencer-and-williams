import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { ArticleHitValues } from '@/app/travel/hitValues.types'
import { TravelMapArticleCard } from '@/app/travel/map/_components/TravelMapArticleCard'


const baseArticle: ArticleHitValues = {
  objectID: 'a1',
  productUrl: '/travel/article/a1',
  title: 'Hiking Patagonia',
  location: 'Argentina, Patagonia',
  recommendedDurationDays: 7,
  image: 'https://example.com/image.webp',
}

describe('TravelMapArticleCard', () => {
  it('renders title and location', () => {
    render(
      <TravelMapArticleCard
        article={baseArticle}
        isHovered={false}
        isSelected={false}
        onHover={vi.fn()}
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByText('Hiking Patagonia')).toBeInTheDocument()
    expect(screen.getByText('Argentina, Patagonia')).toBeInTheDocument()
  })

  it('renders without an image when image is missing (placeholder shown)', () => {
    const { container } = render(
      <TravelMapArticleCard
        article={{ ...baseArticle, image: undefined }}
        isHovered={false}
        isSelected={false}
        onHover={vi.fn()}
        onSelect={vi.fn()}
      />,
    )
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText('Hiking Patagonia')).toBeInTheDocument()
  })
})
