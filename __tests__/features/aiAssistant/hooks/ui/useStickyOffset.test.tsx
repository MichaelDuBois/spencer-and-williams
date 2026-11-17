import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useStickyOffset } from '@/features/aiAssistant/hooks/ui/useStickyOffset'

const Harness = ({ isFullscreen = false }: { isFullscreen?: boolean }) => {
  const ref = useStickyOffset(isFullscreen)
  return <div ref={ref} data-testid="panel" />
}

const getPanel = () => screen.getByTestId('panel')

const setScrollY = (value: number) =>
  Object.defineProperty(window, 'scrollY', { value, configurable: true })

const mountElement = (tag: string, id: string, edge: Partial<DOMRect>) => {
  const el = document.createElement(tag)
  el.id = id
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(edge as DOMRect)
  document.body.appendChild(el)
  return el
}

const scroll = (value: number) => {
  setScrollY(value)
  act(() => {
    window.dispatchEvent(new Event('scroll'))
  })
}

describe('useStickyOffset', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    setScrollY(0)
    vi.restoreAllMocks()
  })

  it('docks below a pinned header and stays there while scrolling', () => {
    mountElement('header', 'site-header', { bottom: 88 })
    render(<Harness />)

    expect(getPanel().style.top).toBe('88px')

    scroll(600)

    expect(getPanel().style.top).toBe('88px')
    expect(getPanel().style.height).toBe('calc(100dvh - 88px)')
  })

  it('reclaims the space a header that scrolls away vacates', () => {
    render(<Harness />)

    expect(getPanel().style.top).toBe('73px')

    scroll(20)

    expect(getPanel().style.top).toBe('53px')

    scroll(600)

    expect(getPanel().style.top).toBe('0px')
  })

  it('never lets a pinned header push the offset negative', () => {
    mountElement('header', 'site-header', { bottom: -10 })
    render(<Harness />)

    expect(getPanel().style.top).toBe('0px')
  })

  it('shortens the panel once the footer enters the viewport', () => {
    mountElement('header', 'site-header', { bottom: 88 })
    mountElement('footer', 'site-footer', { top: 500 })
    render(<Harness />)

    expect(getPanel().style.height).toBe('412px')
  })

  it('leaves layout to CSS when fullscreen', () => {
    mountElement('header', 'site-header', { bottom: 88 })
    render(<Harness isFullscreen />)

    expect(getPanel().style.top).toBe('')
    expect(getPanel().style.height).toBe('')
  })
})
