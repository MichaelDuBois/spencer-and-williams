import { act, render, screen } from '@testing-library/react'
import { useEffect, type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AIAssistantLayout } from '@/features/aiAssistant/components/AIAssistantLayout'
import { activeConfigAtom } from '@/stores/activeConfig'
import {
  chatWidgetEnabledAtom,
  chatWidgetOpenAtom,
  demoOptionsStore,
  resetDemoOptionsAtom,
} from '@/stores/demoOptions'

import { createTestStore } from '@tests/helpers/jotai-wrapper'
import { buildProvidersWrapper, createMockConfig } from '@tests/helpers/test-utils'

const pathnameMock = vi.hoisted(() => vi.fn(() => '/ecommerce/search'))

vi.mock('next/navigation', () => {return { usePathname: pathnameMock }})

vi.mock('@/features/aiAssistant/AssistantCatalogContext', () => {return {
  useAssistantCatalog: () => {return { isReady: true }},
}})

vi.mock('@/features/aiAssistant/hooks/ui/useIsAIAssistantRoute', () => {return {
  useIsAIAssistantRoute: () => {return { isHomepage: false, isValidRoute: true }},
}})

vi.mock('@/features/aiAssistant/components/AIAssistantPanel', () => {return {
  AIAssistantPanel: () => <div data-testid="assistant-panel" />,
}})

interface RenderLayoutOptions {
  chatWidgetAgentID?: string
  chatWidgetOpen?: boolean
  content?: ReactNode
}

const renderLayout = ({
  chatWidgetAgentID = 'chat-agent-1',
  chatWidgetOpen = false,
  content = <main data-testid="page-content" />,
}: RenderLayoutOptions = {}) => {
  demoOptionsStore.set(chatWidgetEnabledAtom, true)
  const store = createTestStore((s) => {
    s.set(
      activeConfigAtom,
      createMockConfig({ features: { agentStudio: { chatWidgetAgentID } } }),
    )
    s.set(chatWidgetOpenAtom, chatWidgetOpen)
  })

  return render(
    <AIAssistantLayout basePath="/ecommerce">
      {content}
    </AIAssistantLayout>,
    { wrapper: buildProvidersWrapper({ store }).Wrapper },
  )
}

describe('AIAssistantLayout', () => {
  afterEach(() => {
    demoOptionsStore.set(resetDemoOptionsAtom)
    pathnameMock.mockReturnValue('/ecommerce/search')
  })

  it('leaves the page to the Chat widget when it is active', () => {
    renderLayout()

    expect(screen.getByTestId('page-content')).toBeInTheDocument()
    expect(screen.queryByTestId('assistant-panel')).not.toBeInTheDocument()
  })

  it('keeps page content mounted when switching assistant implementations', () => {
    const mount = vi.fn()
    const unmount = vi.fn()
    const Content = () => {
      useEffect(() => {
        mount()
        return unmount
      }, [])

      return <main data-testid="page-content" />
    }

    renderLayout({ content: <Content /> })

    act(() => demoOptionsStore.set(chatWidgetEnabledAtom, false))
    act(() => demoOptionsStore.set(chatWidgetEnabledAtom, true))

    expect(mount).toHaveBeenCalledOnce()
    expect(unmount).not.toHaveBeenCalled()
  })

  it('keeps the assistant panel when the toggle is on but no agent is configured', () => {
    renderLayout({ chatWidgetAgentID: '' })

    expect(screen.getByTestId('page-content')).toBeInTheDocument()
    expect(screen.getByTestId('assistant-panel')).toBeInTheDocument()
  })

  describe('with the official chat widget', () => {
    it('does not reserve a panel column while the chat is closed', () => {
      renderLayout({ chatWidgetOpen: false })

      expect(
        screen.getByTestId('page-content').parentElement?.parentElement,
      ).not.toHaveClass(
        'lg:pr-[var(--assistant-panel-width,400px)]',
      )
    })

    it('reserves the panel column while the chat is open', () => {
      renderLayout({ chatWidgetOpen: true })

      expect(
        screen.getByTestId('page-content').parentElement?.parentElement,
      ).toHaveClass(
        'lg:pr-[var(--assistant-panel-width,400px)]',
      )
    })

    it('does not reserve a panel column for an open chat on a fullscreen route', () => {
      pathnameMock.mockReturnValue('/ecommerce/stores')
      renderLayout({ chatWidgetOpen: true })

      expect(
        screen.getByTestId('page-content').parentElement?.parentElement,
      ).not.toHaveClass(
        'lg:pr-[var(--assistant-panel-width,400px)]',
      )
    })
  })
})
