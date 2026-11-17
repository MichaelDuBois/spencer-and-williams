import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { FashionArticleHitValues } from '@/app/fashion/hitValues.types'
import { FashionArticleCard } from '@/features/aiAssistant/components/messages/fashion/FashionArticleCard'

import { buildProvidersWrapper } from '../../../../../helpers/test-utils'

import type { ComponentProps } from 'react'

vi.mock('next/link', () => {return {
  default: ({ children, ...props }: ComponentProps<'a'>) => (
    <a {...props}>{children}</a>
  ),
}})

const renderCard = (
  directData?: FashionArticleHitValues,
  item = { objectID: 'a1', why: '' },
) => render(<FashionArticleCard item={item} directData={directData} />, {
    wrapper: buildProvidersWrapper().Wrapper,
  })

describe('FashionArticleCard', () => {
  it('renders the article title, category and reading time from directData', () => {
    renderCard({
      objectID: 'a1',
      productUrl: '/fashion/article/a1',
      title: 'Autumn layering guide',
      category: 'Style',
      image: '/banner.jpg',
      author: { name: 'Ana Ruiz' },
      readingTime: 6,
    })

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/fashion/article/a1',
    )
    expect(screen.getByText('Autumn layering guide')).toBeInTheDocument()
    expect(screen.getByText('Style')).toBeInTheDocument()
    expect(screen.getByText('6 min read')).toBeInTheDocument()
    expect(screen.getByText('Ana Ruiz')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('target', '_blank')
  })

  it('renders the title and link when the image is missing', () => {
    renderCard(
      {
        objectID: 'a2',
        productUrl: '/fashion/article/a2',
        title: 'Denim care 101',
      },
      { objectID: 'a2', why: 'Recommended' },
    )

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/fashion/article/a2',
    )
    expect(screen.getByText('Denim care 101')).toBeInTheDocument()
    expect(screen.queryByText('Recommended')).not.toBeInTheDocument()
    expect(screen.getByText('No image')).toBeInTheDocument()
  })

  it('renders a skeleton without a link when directData is absent', () => {
    renderCard()

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})
