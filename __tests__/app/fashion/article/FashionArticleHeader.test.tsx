import { describe, expect, it, vi } from 'vitest'

import { FashionArticleHeader } from '@/app/fashion/article/[id]/_components/FashionArticleHeader'
import type { FashionArticleHitValues } from '@/app/fashion/hitValues.types'

import { render, screen } from '@tests/helpers/test-utils'

vi.mock('next/image', () => {
  return {
    default: ({
      fill: _fill,
      preload: _preload,
      priority: _priority,
      alt,
      ...imageProps
    }: Record<string, unknown>) => (
      // The real component remains `next/image`; this DOM stand-in exposes its
      // rendered attributes without asking jsdom to run Next's image runtime.
      // eslint-disable-next-line @next/next/no-img-element
      <img alt={alt as string} {...imageProps} />
    ),
  }
})

const ARTICLE: FashionArticleHitValues = {
  objectID: 'fashion-article-zip-and-puff-city-kit',
  productUrl: '/fashion/article/fashion-article-zip-and-puff-city-kit',
  title: 'The Zip & Puff City Kit',
  image: 'https://cdn.example.com/zip-and-puff-banner.jpg',
}

describe('FashionArticleHeader', () => {
  it('renders the landscape image as a full-width article banner', () => {
    render(<FashionArticleHeader article={ARTICLE} />)

    const header = screen.getByRole('banner')
    const image = screen.getByRole('img', { name: ARTICLE.title })
    const banner = image.parentElement

    expect(banner).toHaveClass('aspect-[16/10]', 'w-full')
    expect(banner).not.toHaveClass('max-w-xs')
    expect(banner?.parentElement).toBe(header)
  })

  it('requests an image sized for the full-width article banner', () => {
    render(<FashionArticleHeader article={ARTICLE} />)

    expect(screen.getByRole('img', { name: ARTICLE.title })).toHaveAttribute(
      'sizes',
      '(min-width: 1024px) 992px, calc(100vw - 2rem)',
    )
  })

  it('capitalizes the lead subtitle', () => {
    render(
      <FashionArticleHeader
        article={{
          ...ARTICLE,
          subtitle: 'layered blue tones for easy weekend style',
        }}
      />,
    )

    expect(
      screen.getByText('layered blue tones for easy weekend style'),
    ).toHaveClass('capitalize')
  })
})
