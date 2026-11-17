import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { FashionArticleAutocompleteHit } from '@/app/fashion/_components/FashionArticleAutocompleteHit'

vi.mock('@/components/image/Image', () => {return {
  Image: ({ src }: { src?: string }) => (
    <span data-testid="image">{src ?? 'placeholder'}</span>
  ),
}})

const renderHit = (item: Record<string, unknown>, onSelect = vi.fn()) => {
  render(<FashionArticleAutocompleteHit item={item} onSelect={onSelect} />)
  return onSelect
}

describe('FashionArticleAutocompleteHit', () => {
  it('renders the title and category and selects on click', () => {
    const onSelect = renderHit({
      objectID: 'article-1',
      title: 'Summer style',
      category: 'Style',
    })

    fireEvent.click(screen.getByRole('button', { name: /summer style/i }))
    expect(onSelect).toHaveBeenCalledOnce()
    expect(screen.getByText('Style')).toBeInTheDocument()
  })

  it('prefers the thumbnail over the banner image', () => {
    renderHit({
      objectID: 'article-1',
      title: 'Summer style',
      thumbnail_image: 'https://cdn.test/thumb.jpg',
      banner_image: 'https://cdn.test/banner.jpg',
    })
    expect(screen.getByTestId('image')).toHaveTextContent(
      'https://cdn.test/thumb.jpg',
    )
  })

  it('falls back to the banner image when there is no thumbnail', () => {
    renderHit({
      objectID: 'article-1',
      title: 'Summer style',
      banner_image: 'https://cdn.test/banner.jpg',
    })
    expect(screen.getByTestId('image')).toHaveTextContent(
      'https://cdn.test/banner.jpg',
    )
  })

  it('renders a placeholder and no category when both are missing', () => {
    renderHit({ objectID: 'article-1', title: 'Summer style' })

    expect(screen.getByTestId('image')).toHaveTextContent('placeholder')
    expect(screen.getByText('Summer style').nextElementSibling).toBeNull()
  })
})
