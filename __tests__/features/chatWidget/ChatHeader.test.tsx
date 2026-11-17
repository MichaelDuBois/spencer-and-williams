import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ChatHeader } from '@/features/chatWidget/components/ChatHeader'

const { pathnameMock, useActiveConfigMock } = vi.hoisted(() => {return {
  pathnameMock: vi.fn(),
  useActiveConfigMock: vi.fn(),
}})

vi.mock('next/navigation', () => {return { usePathname: pathnameMock }})

vi.mock('@/hooks/useActiveConfig', () => {return {
  useActiveConfig: useActiveConfigMock,
}})

describe('ChatHeader', () => {
  const onHomepage = () => {
    pathnameMock.mockReturnValue('/ecommerce')
    useActiveConfigMock.mockReturnValue({ slug: 'ecommerce' })
  }

  it('always renders a close action', () => {
    onHomepage()
    const onClose = vi.fn()
    const { getByRole, queryByRole } = render(
      <ChatHeader onClose={onClose} />,
    )

    expect(queryByRole('button', { name: 'Expand panel' })).not.toBeInTheDocument()
    expect(queryByRole('button', { name: 'Clear conversation' })).not.toBeInTheDocument()

    fireEvent.click(getByRole('button', { name: 'Close panel' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('renders and wires its optional actions', () => {
    pathnameMock.mockReturnValue('/ecommerce/search')
    useActiveConfigMock.mockReturnValue({ slug: 'ecommerce' })
    const onToggleMaximize = vi.fn()
    const onClear = vi.fn()
    const { getByRole } = render(
      <ChatHeader
        maximized
        canClear
        onClear={onClear}
        onClose={vi.fn()}
        onToggleMaximize={onToggleMaximize}
      />,
    )

    fireEvent.click(getByRole('button', { name: 'Minimize panel' }))
    fireEvent.click(getByRole('button', { name: 'Clear conversation' }))

    expect(onToggleMaximize).toHaveBeenCalledOnce()
    expect(onClear).toHaveBeenCalledOnce()
  })

  it('hides the panel sizing action on the homepage', () => {
    onHomepage()

    const { queryByRole } = render(
      <ChatHeader onClose={vi.fn()} onToggleMaximize={vi.fn()} />,
    )

    expect(queryByRole('button', { name: 'Expand panel' })).not.toBeInTheDocument()
  })

  it('hides the panel sizing action on map routes', () => {
    pathnameMock.mockReturnValue('/ecommerce/stores')
    useActiveConfigMock.mockReturnValue({ slug: 'ecommerce' })

    const { container, queryByRole } = render(
      <ChatHeader onClose={vi.fn()} onToggleMaximize={vi.fn()} />,
    )

    expect(queryByRole('button', { name: 'Expand panel' })).not.toBeInTheDocument()
    expect(container.querySelector('.ais-ChatHeader-title svg')).toBeInTheDocument()
  })

  it('shows the full-mode title icon on the homepage', () => {
    onHomepage()

    const { container } = render(<ChatHeader onClose={vi.fn()} />)

    expect(container.querySelector('.ais-ChatHeader-title svg')).toBeInTheDocument()
  })

  it('uses library title translations and class names', () => {
    onHomepage()

    const { container, getByText, getByRole } = render(
      <ChatHeader
        onClose={vi.fn()}
        classNames={{
          root: 'custom-root',
          title: 'custom-title',
          titleIcon: 'custom-title-icon',
          close: 'custom-close',
        }}
        translations={{
          title: 'Shopping assistant',
          closeLabel: 'Dismiss assistant',
        }}
      />,
    )

    expect(getByText('Shopping assistant')).toHaveClass('custom-title')
    expect(getByText('Shopping assistant').parentElement).toHaveClass(
      'custom-root',
    )
    expect(container.querySelector('.ais-ChatHeader-titleIcon')).toHaveClass(
      'custom-title-icon',
    )
    expect(getByRole('button', { name: 'Dismiss assistant' })).toHaveClass(
      'custom-close',
    )
  })
})
