import { screen } from '@testing-library/react'
import { createStore } from 'jotai'
import { describe, expect, it } from 'vitest'

import type { FashionArticleHitValues } from '@/app/fashion/hitValues.types'
import { FashionContentContextCard } from '@/features/aiAssistant/components/messages/fashion/FashionContentContextCard'
import { fashionContentContextState } from '@/features/aiAssistant/stores/aiAssistant'

import { render } from '@tests/helpers/test-utils'

const article = {
  objectID: 'fashion-article-zip-and-puff-city-kit',
  productUrl: '/fashion/article/fashion-article-zip-and-puff-city-kit',
  title: 'Zip, Puff, Roll: A City Kit for Blue-on-Grey Weekend Wear',
  category: 'Styling Guide',
  thumbnail: 'https://cdn.example.com/thumb.jpg',
  image: 'https://cdn.example.com/banner.jpg',
  author: { name: 'Spencer & Williams Editorial', role: 'Style Editor' },
} as FashionArticleHitValues

const renderCard = (record?: FashionArticleHitValues) => {
  const store = createStore()
  if (record) {
    store.set(fashionContentContextState, record)
  }
  return render(<FashionContentContextCard />, { store })
}

describe('FashionContentContextCard', () => {
  it('renders nothing when no article is in context', () => {
    const { container } = renderCard()

    expect(container).toBeEmptyDOMElement()
  })

  it('renders the label, category, title and author name', () => {
    renderCard(article)

    expect(screen.getByText('Viewing this article:')).toBeInTheDocument()
    expect(screen.getByText('Styling Guide')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Zip, Puff, Roll: A City Kit for Blue-on-Grey Weekend Wear',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Spencer & Williams Editorial')).toBeInTheDocument()
  })

  it('prefers the thumbnail over the banner image', () => {
    renderCard(article)

    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://cdn.example.com/thumb.jpg',
    )
  })

  it('falls back to the banner image when there is no thumbnail', () => {
    renderCard({ ...article, thumbnail: undefined })

    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://cdn.example.com/banner.jpg',
    )
  })

  it('omits the category and author lines when those fields are absent', () => {
    renderCard({ ...article, category: undefined, author: undefined })

    expect(screen.queryByText('Styling Guide')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Spencer & Williams Editorial'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByText(
        'Zip, Puff, Roll: A City Kit for Blue-on-Grey Weekend Wear',
      ),
    ).toBeInTheDocument()
  })
})
