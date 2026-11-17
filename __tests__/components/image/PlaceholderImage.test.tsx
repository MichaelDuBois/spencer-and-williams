import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PlaceholderImage } from '@/components/image/PlaceholderImage'
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

describe('PlaceholderImage', () => {
  beforeEach(() => {
    useActiveConfigMock.mockReturnValue(config)
  })

  it('renders the favicon as the placeholder', () => {
    const { container } = render(<PlaceholderImage fill />)

    expect(
      container.querySelector(`img[src="${config.assets.favicon}"]`),
    ).toBeInTheDocument()
  })

  it('falls back to the logo when no favicon is configured', () => {
    useActiveConfigMock.mockReturnValue({
      assets: { favicon: '', logo: '/images/ecommerce/logo.svg', banner: '' },
    } as unknown as VerticalConfig)

    const { container } = render(<PlaceholderImage fill />)

    expect(
      container.querySelector('img[src="/images/ecommerce/logo.svg"]'),
    ).toBeInTheDocument()
  })

  it('renders a text placeholder when no config is active', () => {
    useActiveConfigMock.mockReturnValue(null)

    render(<PlaceholderImage fill />)

    expect(screen.getByText('No image')).toBeInTheDocument()
  })
})
