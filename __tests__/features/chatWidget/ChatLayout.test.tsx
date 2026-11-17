import { render } from '@testing-library/react'
import { useContext } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { chatWidgetClearHistoryState } from '@/features/aiAssistant/stores/aiAssistant'
import { ChatLayout } from '@/features/chatWidget/components/ChatLayout'
import {
  ChatWidgetFullscreenContext,
  useCollapseChatWidgetPanel,
} from '@/features/chatWidget/components/chatWidgetPanelContext'

import { createTestStore } from '../../helpers/jotai-wrapper'
import { installMatchMedia } from '../../helpers/matchMedia'
import { buildProvidersWrapper } from '../../helpers/test-utils'

import type { ChatMessageBase } from 'instantsearch-ui-components'
import type { ComponentProps, ReactNode } from 'react'

type MessagesComponent = ComponentProps<typeof ChatLayout>['messagesComponent']

const { chatTriggerState, pathnameMock, toggleOpen, useActiveConfigMock } =
  vi.hoisted(() => {return {
    chatTriggerState: { open: true },
    pathnameMock: vi.fn(),
    toggleOpen: vi.fn(),
    useActiveConfigMock: vi.fn(),
  }})

vi.mock('next/navigation', () => {return { usePathname: pathnameMock }})

vi.mock('@/hooks/useActiveConfig', () => {return {
  useActiveConfig: useActiveConfigMock,
}})

vi.mock('react-instantsearch', () => {return {
  ChatOverlayLayout: ({
    classNames,
    messagesComponent,
  }: {
    classNames?: { root?: string | string[] }
    messagesComponent?: ReactNode
  }) => (
    <div
      data-testid="chat-layout"
      data-root-class={
        Array.isArray(classNames?.root)
          ? classNames.root.join(' ')
          : classNames?.root
      }
    >
      {messagesComponent}
    </div>
  ),
  useChatTrigger: () => {return { open: chatTriggerState.open, toggleOpen }},
}})

const CollapseButton = () => {
  const collapsePanel = useCollapseChatWidgetPanel()

  return <button onClick={collapsePanel}>Collapse panel</button>
}

const ClearableMessages = ({
  onClearTransitionEnd,
}: {
  onClearTransitionEnd?: () => void
}) => <button onClick={onClearTransitionEnd}>Finish message clear</button>

const Header = (_props: { onToggleMaximize: () => void }) => <div />

const layoutProps = {
  open: true,
  maximized: false,
  headerComponent: <div />,
  messagesComponent: <div />,
  promptComponent: <div />,
  tools: {},
  messages: [],
  sendMessage: vi.fn(),
  regenerate: vi.fn(),
  stop: vi.fn(),
  error: undefined,
} as unknown as ComponentProps<typeof ChatLayout>

describe('ChatLayout', () => {
  it.each([
    ['/ecommerce', false, true],
    ['/ecommerce/search', true, true],
    ['/ecommerce/search', false, false],
  ])(
    'exposes full-screen mode on %s (maximized: %s)',
    (pathname, maximized, expected) => {
      pathnameMock.mockReturnValue(pathname)
      const Probe = () => (
        <output data-testid="fullscreen">
          {String(useContext(ChatWidgetFullscreenContext))}
        </output>
      )
      const { getByTestId } = render(
        <ChatLayout
          {...layoutProps}
          maximized={maximized}
          messagesComponent={<Probe />}
        />,
      )
      expect(getByTestId('fullscreen')).toHaveTextContent(String(expected))
    },
  )

  beforeEach(() => {
    pathnameMock.mockReturnValue('/ecommerce/search')
    useActiveConfigMock.mockReturnValue({ slug: 'ecommerce' })
    toggleOpen.mockClear()
    chatTriggerState.open = true
    installMatchMedia(false)
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 0,
    })
  })

  it('passes order cards and suggestions to the message renderer without the repeated text', () => {
    const orderPart = {
      type: 'tool-displayOrders',
      toolCallId: 'orders-1',
      state: 'output-available',
      input: {},
      output: {
        intro: 'Here are your most recent orders:',
        orders: [{ id: 'order-1', createdAt: 100, total: 20, items: [] }],
      },
    } satisfies ChatMessageBase['parts'][number]
    const messages: ChatMessageBase[] = [
      {
        id: 'assistant-1',
        role: 'assistant',
        parts: [
          orderPart,
          { type: 'text', text: `✅ ${orderPart.output.intro}` },
          { type: 'text', text: 'The return window is 30 days.' },
          {
            type: 'data-suggestions',
            data: { suggestions: ['Track my order'] },
          },
        ],
      },
    ]
    const Messages = ({
      messages: renderedMessages,
    }: {
      messages: ChatMessageBase[]
    }) => (
      <div data-testid="rendered-messages">
        {JSON.stringify(renderedMessages)}
      </div>
    )
    const { getByTestId } = render(
      <ChatLayout
        {...layoutProps}
        messagesComponent={<Messages messages={messages} />}
      />,
    )

    const rendered = getByTestId('rendered-messages')
    expect(rendered).toHaveTextContent('Here are your most recent orders:')
    expect(rendered).toHaveTextContent('order-1')
    expect(rendered).toHaveTextContent('Track my order')
    expect(rendered).toHaveTextContent('The return window is 30 days.')
    expect(JSON.parse(rendered.textContent ?? '[]')[0].parts).toEqual([
      orderPart,
      { type: 'text', text: 'The return window is 30 days.' },
      messages[0].parts[3],
    ])
    expect(messages[0].parts).toHaveLength(4)
  })

  it('docks on content routes and preserves supplied root classes', () => {
    const { getByTestId } = render(
      <ChatLayout {...layoutProps} classNames={{ root: 'sw-ChatWidget' }} />,
    )

    expect(getByTestId('chat-layout')).toHaveAttribute(
      'data-root-class',
      'sw-ChatWidget sw-ChatWidget--side-panel',
    )
  })

  it('uses the full-screen layout on a vertical homepage and map route', () => {
    pathnameMock.mockReturnValue('/ecommerce/')
    const { getByTestId, rerender } = render(
      <ChatLayout {...layoutProps} classNames={{ root: 'sw-ChatWidget' }} />,
    )

    expect(getByTestId('chat-layout')).toHaveAttribute(
      'data-root-class',
      'sw-ChatWidget sw-ChatWidget--fullscreen',
    )

    pathnameMock.mockReturnValue('/ecommerce/stores')
    rerender(
      <ChatLayout {...layoutProps} classNames={{ root: 'sw-ChatWidget' }} />,
    )

    expect(getByTestId('chat-layout')).toHaveAttribute(
      'data-root-class',
      'sw-ChatWidget sw-ChatWidget--fullscreen',
    )
  })

  it('moves a docked panel above the header after scrolling', () => {
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 24,
    })
    const { getByTestId } = render(
      <ChatLayout {...layoutProps} classNames={{ root: 'sw-ChatWidget' }} />,
    )

    expect(getByTestId('chat-layout')).toHaveAttribute(
      'data-root-class',
      'sw-ChatWidget sw-ChatWidget--side-panel sw-ChatWidget--scrolled',
    )
  })

  it('makes the minimize callback available to cards when expanded', () => {
    const onToggleMaximize = vi.fn()
    const { getByRole } = render(
      <ChatLayout
        {...layoutProps}
        maximized
        headerComponent={<Header onToggleMaximize={onToggleMaximize} />}
        messagesComponent={<CollapseButton />}
      />,
    )

    getByRole('button', { name: 'Collapse panel' }).click()

    expect(onToggleMaximize).toHaveBeenCalledOnce()
  })

  it('closes a docked panel from a card on mobile widths', () => {
    installMatchMedia(true)
    const onToggleMaximize = vi.fn()
    const { getByRole } = render(
      <ChatLayout
        {...layoutProps}
        headerComponent={<Header onToggleMaximize={onToggleMaximize} />}
        messagesComponent={<CollapseButton />}
      />,
    )

    getByRole('button', { name: 'Collapse panel' }).click()

    expect(toggleOpen).toHaveBeenCalledOnce()
    expect(onToggleMaximize).not.toHaveBeenCalled()
  })

  it('offers no collapse callback on a docked desktop panel', () => {
    const { getByRole } = render(
      <ChatLayout {...layoutProps} messagesComponent={<CollapseButton />} />,
    )

    getByRole('button', { name: 'Collapse panel' }).click()

    expect(toggleOpen).not.toHaveBeenCalled()
  })

  it('releases a pending message after Chat finishes clearing', () => {
    const store = createTestStore((s) => {
      s.set(chatWidgetClearHistoryState, true)
    })
    const onClearTransitionEnd = vi.fn()
    const { Wrapper } = buildProvidersWrapper({ store })
    const { getByRole } = render(
      <ChatLayout
        {...layoutProps}
        messagesComponent={
          <ClearableMessages onClearTransitionEnd={onClearTransitionEnd} />
        }
      />,
      { wrapper: Wrapper },
    )

    getByRole('button', { name: 'Finish message clear' }).click()

    expect(onClearTransitionEnd).toHaveBeenCalledOnce()
    expect(store.get(chatWidgetClearHistoryState)).toBe(false)
  })

  it.each([
    ['undefined', undefined],
    ['a string', 'Plain messages'],
  ])('passes %s messagesComponent through and still clears later', (_label, messagesComponent) => {
    const store = createTestStore((s) => {
      s.set(chatWidgetClearHistoryState, true)
    })
    const { Wrapper } = buildProvidersWrapper({ store })
    const { getByRole, getByTestId, rerender } = render(
      <ChatLayout
        {...layoutProps}
        messagesComponent={messagesComponent as unknown as MessagesComponent}
      />,
      { wrapper: Wrapper },
    )

    expect(getByTestId('chat-layout')).toHaveTextContent(messagesComponent ?? '')
    expect(store.get(chatWidgetClearHistoryState)).toBe(true)

    rerender(<ChatLayout {...layoutProps} messagesComponent={<ClearableMessages />} />)
    getByRole('button', { name: 'Finish message clear' }).click()

    expect(store.get(chatWidgetClearHistoryState)).toBe(false)
  })
})
