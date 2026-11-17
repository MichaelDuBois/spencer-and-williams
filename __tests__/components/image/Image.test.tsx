import { fireEvent, render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Image } from '@/components/image/Image'
import type { VerticalConfig } from '@/types'

const { useActiveConfigMock } = vi.hoisted(() => {
  return { useActiveConfigMock: vi.fn() }
})

vi.mock('@/hooks/useActiveConfig', () => {
  return { useActiveConfig: useActiveConfigMock }
})

const config = {
  assets: {
    favicon: '/images/ecommerce/favicon.svg',
    logo: '/images/ecommerce/logo.svg',
    banner: '',
  },
} as unknown as VerticalConfig

describe('Image', () => {
  beforeEach(() => {
    useActiveConfigMock.mockReturnValue(config)
  })

  it('renders the source image when src is provided', () => {
    const { container } = render(
      <Image src="https://cdn/photo.jpg" alt="Photo" fill />,
    )

    expect(
      container.querySelector('img[src="https://cdn/photo.jpg"]'),
    ).toBeInTheDocument()
    expect(
      container.querySelector(`img[src="${config.assets.favicon}"]`),
    ).not.toBeInTheDocument()
  })

  it('renders the placeholder when src is missing', () => {
    const { container } = render(<Image src={null} alt="Photo" fill />)

    expect(
      container.querySelector(`img[src="${config.assets.favicon}"]`),
    ).toBeInTheDocument()
  })

  it('swaps to the placeholder when the image fails to load', () => {
    const { container } = render(
      <Image src="https://cdn/broken.jpg" alt="Photo" fill />,
    )

    const img = container.querySelector('img[src="https://cdn/broken.jpg"]')!
    fireEvent.error(img)

    expect(
      container.querySelector('img[src="https://cdn/broken.jpg"]'),
    ).not.toBeInTheDocument()
    expect(
      container.querySelector(`img[src="${config.assets.favicon}"]`),
    ).toBeInTheDocument()
  })

  it('renders the custom fallback instead of the placeholder when src is missing', () => {
    const { container, getByText } = render(
      <Image
        src={null}
        alt="Photo"
        fill
        fallback={<div>No cover art</div>}
      />,
    )

    expect(getByText('No cover art')).toBeInTheDocument()
    expect(
      container.querySelector(`img[src="${config.assets.favicon}"]`),
    ).not.toBeInTheDocument()
  })

  it('renders the custom fallback when the image fails to load', () => {
    const { container, getByText } = render(
      <Image
        src="https://cdn/broken.jpg"
        alt="Photo"
        fill
        fallback={<div>No cover art</div>}
      />,
    )

    fireEvent.error(container.querySelector('img[src="https://cdn/broken.jpg"]')!)

    expect(getByText('No cover art')).toBeInTheDocument()
    expect(
      container.querySelector('img[src="https://cdn/broken.jpg"]'),
    ).not.toBeInTheDocument()
    expect(
      container.querySelector(`img[src="${config.assets.favicon}"]`),
    ).not.toBeInTheDocument()
  })

  it('prefers the source image over the custom fallback when src loads', () => {
    const { container, queryByText } = render(
      <Image
        src="https://cdn/photo.jpg"
        alt="Photo"
        fill
        fallback={<div>No cover art</div>}
      />,
    )

    expect(
      container.querySelector('img[src="https://cdn/photo.jpg"]'),
    ).toBeInTheDocument()
    expect(queryByText('No cover art')).not.toBeInTheDocument()
  })
})
