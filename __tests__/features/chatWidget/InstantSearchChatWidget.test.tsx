import { act, render, waitFor } from '@testing-library/react'
import { useContext, useEffect, useImperativeHandle } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  chatWidgetClearHistoryState,
  chatWidgetOrderContextState,
  chatWidgetPendingOrderContextState,
  productContextState,
} from '@/features/aiAssistant/stores/aiAssistant'
import {
  ChatWidgetImageSubmissionContext,
  ChatWidgetQueuedImageContext,
  type ChatWidgetImageSubmission,
  type QueuedImageMessage,
} from '@/features/chatWidget/components/chatWidgetImageSubmissionContext'
import {
  InstantSearchChatWidget,
} from '@/features/chatWidget/components/InstantSearchChatWidget'
import type { ChatWidgetTransport } from '@/features/chatWidget/utils/chatWidgetTransport'
import { activeConfigAtom } from '@/stores/activeConfig'
import { getCartAtom } from '@/stores/cart'
import {
  chatWidgetEnabledAtom,
  chatWidgetPendingMessageAtom,
  demoOptionsStore,
} from '@/stores/demoOptions'
import { getOrderHistoryAtom } from '@/stores/orderHistory'
import {
  activePersonaAtom,
  personalizationStore,
} from '@/stores/personalization'

import { createTestStore } from '../../helpers/jotai-wrapper'
import { buildProvidersWrapper, createMockConfig } from '../../helpers/test-utils'

import type { ComponentType, Ref } from 'react'
import type { Tool } from 'react-instantsearch'

const { analyzeImage, chatProps, chatSendMessage, chatSetOpen, chatState, chatMount, chatUnmount, createImageThumbnail, openChat, pathnameMock, suggestionClick, toggleOpen } = vi.hoisted(() => {return {
  analyzeImage: vi.fn<() => Promise<string>>(),
  chatSendMessage: vi.fn((_message: { parts: unknown[] }) => {}),
  chatSetOpen: vi.fn(),
  createImageThumbnail: vi.fn(async (_dataUrl: string) => 'data:image/jpeg;base64,VEhVTUI='),
  chatProps: {
    imageSubmission: null as null | {
      submitImage: (image: ChatWidgetImageSubmission) => Promise<void>
    },
    queuedImageMessage: null as QueuedImageMessage | null,
    context: undefined as undefined | (() => Record<string, string>),
    tools: undefined as undefined | Record<string, Tool>,
    userMessageLeadingComponent: undefined as undefined | ComponentType,
    headerComponent: undefined as
      | undefined
      | ComponentType<{ onClear?: () => void; canClear?: boolean }>,
    persistence: undefined as undefined | { messages: boolean; open: boolean },
    transport: undefined as undefined | ChatWidgetTransport,
  },
  chatState: { isBusy: false, open: false },
  chatMount: vi.fn(),
  chatUnmount: vi.fn(),
  openChat: vi.fn((_options: { message?: string; referer?: string }) => true),
  pathnameMock: vi.fn(() => '/ecommerce/search'),
  suggestionClick: vi.fn(),
  toggleOpen: vi.fn(),
}})

vi.mock('react-instantsearch', () => {return {
  createDefaultTools: () => {return {
    algolia_search_index: { layoutComponent: () => <></> },
  }},
  Chat: ({
    ref,
    agentId,
    context,
    tools,
    persistence,
    transport,
    userMessageLeadingComponent: UserMessageLeadingComponent,
    headerComponent: HeaderComponent,
    layoutComponent: LayoutComponent,
    suggestionsComponent: SuggestionsComponent,
  }: {
    ref: Ref<{ sendMessage: typeof chatSendMessage; setOpen: typeof chatSetOpen }>
    agentId: string
    context: () => Record<string, string>
    tools: Record<string, Tool>
    userMessageLeadingComponent: ComponentType
    persistence: { messages: boolean; open: boolean }
    transport: ChatWidgetTransport | undefined
    headerComponent: ComponentType<{ onClear?: () => void; canClear?: boolean }>
    layoutComponent: ComponentType
    suggestionsComponent: ComponentType<{
      suggestions: string[]
      onSuggestionClick: (suggestion: string) => void
    }>
  }) => {
    useEffect(() => {
      chatMount()
      return chatUnmount
    }, [])
    useImperativeHandle(ref, () => {
      return { sendMessage: chatSendMessage, setOpen: chatSetOpen }
    })
    chatProps.context = context
    chatProps.tools = tools
    chatProps.userMessageLeadingComponent = UserMessageLeadingComponent
    chatProps.headerComponent = HeaderComponent
    chatProps.persistence = persistence
    chatProps.transport = transport
    chatProps.imageSubmission = useContext(ChatWidgetImageSubmissionContext)
    chatProps.queuedImageMessage = useContext(ChatWidgetQueuedImageContext)

    return (
      <div
        data-testid="chat"
        data-agent-id={agentId}
        data-header-component={HeaderComponent.name}
        data-layout-component={LayoutComponent.name}>
        <SuggestionsComponent
          suggestions={['Show cheaper options']}
          onSuggestionClick={suggestionClick}
        />
      </div>
    )
  },
  useChatTrigger: () => {return {
    open: chatState.open,
    openChat,
    toggleOpen,
    isChatBusy: chatState.isBusy,
  }},
}})

vi.mock('next/navigation', () => {return { usePathname: pathnameMock }})
vi.mock('@/features/aiAssistant/services/imageAnalysisService', () => {
  return { analyzeImage }
})
vi.mock('@/features/chatWidget/utils/createImageThumbnail', () => {
  return { createImageThumbnail }
})

interface RenderOptions {
  enabled?: boolean
  chatWidgetAgentId?: string
  pendingMessage?: string | null
  orderContext?: {
    orderId: string
    items: Array<{ objectID: string; name: string }>
  }
  clearHistory?: boolean
  productContext?: { objectID: string; productUrl: string; name: string }
}

const renderWidget = ({
  enabled = true,
  chatWidgetAgentId = 'chat-agent-1',
  pendingMessage = null,
  orderContext = undefined,
  clearHistory = false,
  productContext,
}: RenderOptions = {}) => {
  const store = createTestStore((s) => {
    s.set(
      activeConfigAtom,
      createMockConfig({
        features: {
          agentStudio: chatWidgetAgentId
            ? { chatWidgetAgentID: chatWidgetAgentId }
            : {},
        },
      }),
    )
    s.set(chatWidgetEnabledAtom, enabled)
    s.set(chatWidgetPendingMessageAtom, pendingMessage)
    s.set(chatWidgetOrderContextState, orderContext ?? null)
    s.set(chatWidgetPendingOrderContextState, orderContext ?? null)
    s.set(chatWidgetClearHistoryState, clearHistory)
    s.set(productContextState, productContext ?? null)
  })
  demoOptionsStore.set(chatWidgetEnabledAtom, enabled)

  return {
    store,
    ...render(<InstantSearchChatWidget />, {
      wrapper: buildProvidersWrapper({ store }).Wrapper,
    }),
  }
}

const IMAGE_SUBMISSION = {
  kind: 'captioned' as const,
  text: 'Find this',
  base64Image: 'QUJD',
  mediaType: 'image/png',
}
const IMAGE_URL = 'data:image/png;base64,QUJD'
const IMAGE_MESSAGE = {
  metadata: { chatImage: { isImageOnly: false } },
  parts: [
    {
      type: 'data-chat-image',
      data: { url: 'data:image/jpeg;base64,VEhVTUI=' },
    },
    { type: 'text', text: 'Find this' },
  ],
}

describe('InstantSearchChatWidget', () => {
  beforeEach(() => {
    demoOptionsStore.set(chatWidgetEnabledAtom, false)
    personalizationStore.set(activePersonaAtom, null)
    openChat.mockReset()
    openChat.mockReturnValue(true)
    analyzeImage.mockReset()
    chatSendMessage.mockReset()
    chatSetOpen.mockReset()
    createImageThumbnail.mockClear()
    chatMount.mockClear()
    chatUnmount.mockClear()
    toggleOpen.mockClear()
    suggestionClick.mockClear()
    chatState.isBusy = false
    chatState.open = false
    chatProps.context = undefined
    chatProps.tools = undefined
    chatProps.userMessageLeadingComponent = undefined
    chatProps.headerComponent = undefined
    chatProps.persistence = undefined
    chatProps.transport = undefined
    chatProps.imageSubmission = null
    chatProps.queuedImageMessage = null
    pathnameMock.mockReturnValue('/ecommerce/search')
  })

  it('keeps Chat mounted and hidden while the demo toggle is off', () => {
    const { getByTestId, store } = renderWidget({ enabled: false })

    expect(getByTestId('chat')).not.toBeVisible()
    act(() => demoOptionsStore.set(chatWidgetEnabledAtom, true))
    act(() => demoOptionsStore.set(chatWidgetEnabledAtom, false))

    expect(chatMount).toHaveBeenCalledTimes(1)
    expect(chatUnmount).not.toHaveBeenCalled()
  })

  it('follows the global demo toggle rather than the scoped provider store', () => {
    const { getByTestId, store } = renderWidget({ enabled: false })

    act(() => store.set(chatWidgetEnabledAtom, true))
    expect(getByTestId('chat')).not.toBeVisible()

    act(() => demoOptionsStore.set(chatWidgetEnabledAtom, true))
    expect(getByTestId('chat')).toBeVisible()
  })

  it('renders nothing when the vertical declares no chat widget agent', () => {
    const { container } = renderWidget({ chatWidgetAgentId: '' })

    expect(container).toBeEmptyDOMElement()
  })

  it('configures the official chat with the application components', () => {
    const { getByTestId } = renderWidget()

    const chat = getByTestId('chat')
    expect(chat).toHaveAttribute('data-agent-id', 'chat-agent-1')
    expect(chat).toHaveAttribute(
      'data-header-component',
      'ChatHeaderWithOrderReset',
    )
    expect(chat).toHaveAttribute('data-layout-component', 'ChatLayout')
  })

  it('passes the personalization transport for the agent to Chat', () => {
    renderWidget()

    expect(chatProps.transport?.api).toBe(
      'https://app_id.algolia.net/agent-studio/1/agents/chat-agent-1/completions?compatibilityMode=ai-sdk-5',
    )
    expect(chatProps.transport?.prepareSendMessagesRequest).toEqual(
      expect.any(Function),
    )
  })

  it('keeps tools stable after checkout and reads the new order when invoked', async () => {
    const { store } = renderWidget()
    const initialTools = chatProps.tools
    const initialContext = chatProps.context
    const order = {
      id: 'checkout-order',
      items: [],
      subtotal: 10,
      shipping: 0,
      total: 10,
      createdAt: 100,
    }
    await act(async () => {
      store.set(getOrderHistoryAtom('ecommerce'), { guest: [order] })
      store.set(getCartAtom('ecommerce'), { items: [], updatedAt: Date.now() })
    })
    expect(chatProps.tools).toBe(initialTools)
    expect(chatProps.context).toBe(initialContext)
    const onToolCall = initialTools?.displayOrders.onToolCall
    if (!onToolCall) throw new Error('Missing displayOrders handler')
    const addToolResult = vi.fn()
    await onToolCall({
      toolCallId: 'checkout-call',
      toolName: 'displayOrders',
      input: { limit: 1 },
      signal: new AbortController().signal,
      addToolResult,
    })
    expect(addToolResult).toHaveBeenCalledWith({
      output: { orders: [expect.objectContaining({ id: order.id })] },
    })
  })

  it('recreates tools when the persona changes', async () => {
    renderWidget()
    const initialTools = chatProps.tools
    await act(async () => {
      personalizationStore.set(activePersonaAtom, {
        id: 'new-persona',
        label: 'New persona',
        token: 'new-persona',
        affinities: {},
        description: '',
        optionalFilters: [],
      })
    })
    expect(chatProps.tools).not.toBe(initialTools)
  })

  it('registers displayOrders as a client-side tool', () => {
    renderWidget()

    expect(chatProps.tools).toHaveProperty('displayOrders')
  })

  it('persists the open panel through product navigation', () => {
    renderWidget()

    expect(chatProps.persistence).toEqual({ messages: true, open: true })
  })

  it('passes current shopper and cart-page context with each user turn', () => {
    pathnameMock.mockReturnValue('/ecommerce/cart')
    renderWidget()

    expect(chatProps.context?.()).toMatchObject({
      shopperContext: expect.stringContaining('ecommerce'),
      routeContext: expect.stringContaining('/ecommerce/cart'),
    })
  })

  it('passes the current route and PDP record with each user turn', () => {
    pathnameMock.mockReturnValue('/ecommerce/product/p1')
    renderWidget({
      productContext: {
        objectID: 'p1',
        productUrl: '/ecommerce/product/p1',
        name: 'Trail Shoe',
      },
    })

    expect(chatProps.context?.()).toMatchObject({
      pageContext: expect.stringContaining('currently viewing this product page'),
      routeContext: expect.stringContaining('/ecommerce/product/p1'),
    })
    expect(chatProps.context?.().pageContext).toContain('Trail Shoe')
  })

  it('passes the completed order with a post-purchase chat turn', async () => {
    renderWidget({
      orderContext: {
        orderId: 'SW-TEST-0001',
        items: [{ objectID: 'p1', name: 'Trail Shoe' }],
      },
    })
    let initialContext: Record<string, string> | undefined

    await act(async () => {
      initialContext = chatProps.context?.()
    })

    expect(initialContext).toMatchObject({
      orderContext: expect.stringContaining('Order SW-TEST-0001'),
    })
    expect(initialContext?.orderContext).toContain('Trail Shoe')
  })

  it('sends order context only with the initial post-purchase turn', async () => {
    renderWidget({
      orderContext: {
        orderId: 'SW-TEST-0001',
        items: [{ objectID: 'p1', name: 'Trail Shoe' }],
      },
    })
    let initialContext: Record<string, string> | undefined
    let followUpContext: Record<string, string> | undefined

    await act(async () => {
      initialContext = chatProps.context?.()
      followUpContext = chatProps.context?.()
    })

    expect(initialContext).toMatchObject({
      orderContext: expect.stringContaining('Order SW-TEST-0001'),
    })
    expect(followUpContext).not.toHaveProperty('orderContext')
  })

  it('adds the viewed-product card above the first user message', () => {
    const { store } = renderWidget({
      productContext: {
        objectID: 'p1',
        productUrl: '/ecommerce/product/p1',
        name: 'Trail Shoe',
      },
    })
    const LeadingComponent = chatProps.userMessageLeadingComponent
    if (!LeadingComponent) throw new Error('No leading component registered')

    const { getByText } = render(<LeadingComponent />, {
      wrapper: buildProvidersWrapper({ store }).Wrapper,
    })

    expect(getByText('Viewing this product:')).toBeInTheDocument()
    expect(getByText('Trail Shoe')).toBeInTheDocument()
  })

  it('adds the completed-order card above a post-purchase user message', () => {
    const { store } = renderWidget({
      orderContext: {
        orderId: 'SW-TEST-0001',
        items: [{ objectID: 'p1', name: 'Trail Shoe' }],
      },
    })
    const LeadingComponent = chatProps.userMessageLeadingComponent
    if (!LeadingComponent) throw new Error('No leading component registered')

    const { getByText } = render(<LeadingComponent />, {
      wrapper: buildProvidersWrapper({ store }).Wrapper,
    })

    expect(getByText('Your order:')).toBeInTheDocument()
    expect(getByText('Trail Shoe')).toBeInTheDocument()
  })

  it('renders no leading context wrapper without a viewed product', () => {
    const { store } = renderWidget()
    const LeadingComponent = chatProps.userMessageLeadingComponent
    if (!LeadingComponent) throw new Error('No leading component registered')

    const { container } = render(<LeadingComponent />, {
      wrapper: buildProvidersWrapper({ store }).Wrapper,
    })

    expect(container.querySelector('.sw-ChatWidget-productContext')).toBeNull()
  })

  it('keeps the context callback stable when the cart changes', async () => {
    const { store } = renderWidget()
    const initialContext = chatProps.context

    await act(async () => {
      store.set(getCartAtom('ecommerce'), {
        items: [{ objectID: 'sku-1', name: 'Running shoes', quantity: 1 }],
        updatedAt: Date.now(),
      })
    })

    expect(chatProps.context).toBe(initialContext)
    expect(chatProps.context?.()).toMatchObject({
      shopperContext: expect.stringContaining('Running shoes x1'),
    })
  })

  it('drains a pending message into the chat and clears it', async () => {
    const { store } = renderWidget({ pendingMessage: 'show me running shoes' })

    await waitFor(() => {
      expect(openChat).toHaveBeenCalledWith({
        message: 'show me running shoes',
        referer: 'ai-mode',
      })
    })
    expect(store.get(chatWidgetPendingMessageAtom)).toBeNull()
    expect(openChat).toHaveBeenCalledTimes(1)
  })

  it('does not replay a sent message after switching assistant modes', () => {
    const { store } = renderWidget({ pendingMessage: 'show me running shoes' })

    expect(openChat).toHaveBeenCalledTimes(1)
    act(() => store.set(chatWidgetEnabledAtom, false))
    act(() => store.set(chatWidgetEnabledAtom, true))

    expect(openChat).toHaveBeenCalledTimes(1)
    expect(chatMount).toHaveBeenCalledTimes(1)
    expect(chatUnmount).not.toHaveBeenCalled()
  })

  it('does not close a hidden Chat when navigating to a fullscreen route', () => {
    chatState.open = true
    const { rerender } = renderWidget({ enabled: false })

    pathnameMock.mockReturnValue('/ecommerce')
    rerender(<InstantSearchChatWidget />)

    expect(toggleOpen).not.toHaveBeenCalled()
  })

  it('opens an empty Chat when switching from an open custom assistant', async () => {
    const { store } = renderWidget({ pendingMessage: '' })

    await waitFor(() => {
      expect(openChat).toHaveBeenCalledWith({
        message: '',
        referer: 'ai-mode',
      })
    })
    expect(store.get(chatWidgetPendingMessageAtom)).toBeNull()
  })

  it('retains a pending message until the chat accepts it', async () => {
    chatState.isBusy = true
    openChat.mockImplementation(() => !chatState.isBusy)
    const { store, rerender } = renderWidget({
      pendingMessage: 'show me running shoes',
    })

    expect(openChat).not.toHaveBeenCalled()
    expect(store.get(chatWidgetPendingMessageAtom)).toBe(
      'show me running shoes',
    )

    chatState.isBusy = false
    rerender(<InstantSearchChatWidget />)

    await waitFor(() =>
      expect(store.get(chatWidgetPendingMessageAtom)).toBeNull(),
    )
    expect(openChat).toHaveBeenCalledTimes(1)
  })

  it('does not open the chat when there is no pending message', () => {
    renderWidget()

    expect(openChat).not.toHaveBeenCalled()
  })

  it('waits for the existing conversation to clear before sending a message', async () => {
    const { store, rerender } = renderWidget({
      pendingMessage: 'Where is my order?',
      clearHistory: true,
    })

    expect(openChat).not.toHaveBeenCalled()
    const HeaderComponent = chatProps.headerComponent
    if (!HeaderComponent) throw new Error('No header component registered')

    const onClear = vi.fn()
    render(<HeaderComponent onClear={onClear} canClear />, {
      wrapper: buildProvidersWrapper({ store }).Wrapper,
    })

    await waitFor(() => {
      expect(onClear).toHaveBeenCalledOnce()
      expect(store.get(chatWidgetClearHistoryState)).toBe(true)
    })
    store.set(chatWidgetClearHistoryState, false)
    rerender(<InstantSearchChatWidget />)

    await waitFor(() => {
      expect(openChat).toHaveBeenCalledWith({
        message: 'Where is my order?',
        referer: 'ai-mode',
      })
    })
  })

  it('clears the stored order context when the conversation is cleared', () => {
    const { store } = renderWidget({
      orderContext: {
        orderId: 'SW-TEST-0001',
        items: [{ objectID: 'p1', name: 'Trail Shoe' }],
      },
    })
    const HeaderComponent = chatProps.headerComponent
    if (!HeaderComponent) throw new Error('No header component registered')
    expect(store.get(chatWidgetOrderContextState)).not.toBeNull()

    const onClear = vi.fn()
    const { getByRole } = render(
      <HeaderComponent onClear={onClear} canClear />,
      { wrapper: buildProvidersWrapper({ store }).Wrapper },
    )
    getByRole('button', { name: 'Clear conversation' }).click()

    expect(onClear).toHaveBeenCalledOnce()
    expect(store.get(chatWidgetOrderContextState)).toBeNull()
  })

  it('sends an analyzed image turn with its thumbnail and analysis in that turn only', async () => {
    let resolveAnalysis: (analysis: string) => void = () => {}
    analyzeImage.mockReturnValue(
      new Promise((resolve) => {
        resolveAnalysis = resolve
      }),
    )
    const sentContexts: Array<Record<string, string> | undefined> = []
    chatSendMessage.mockImplementation(() => {
      sentContexts.push(chatProps.context?.())
    })
    renderWidget()

    let submission: Promise<void> | undefined
    act(() => {
      submission = chatProps.imageSubmission?.submitImage(IMAGE_SUBMISSION)
    })
    expect(chatProps.queuedImageMessage).toEqual({
      text: 'Find this',
      isImageOnly: false,
      imageUrl: null,
    })
    await waitFor(() =>
      expect(chatProps.queuedImageMessage).toEqual({
        text: 'Find this',
        isImageOnly: false,
        imageUrl: 'data:image/jpeg;base64,VEhVTUI=',
      }),
    )

    await act(async () => {
      resolveAnalysis('red leather sneaker')
      await submission
    })

    expect(createImageThumbnail).toHaveBeenCalledExactlyOnceWith(IMAGE_URL)
    expect(chatSetOpen).toHaveBeenCalledWith(true)
    expect(chatSendMessage).toHaveBeenCalledExactlyOnceWith(IMAGE_MESSAGE)
    expect(openChat).not.toHaveBeenCalled()
    expect(sentContexts).toHaveLength(1)
    expect(sentContexts[0]).toMatchObject({
      imageAnalysis: 'Image Analysis:\nred leather sneaker',
    })
    expect(chatProps.context?.()).not.toHaveProperty('imageAnalysis')
    expect(chatProps.queuedImageMessage).toBeNull()
  })

  it('clears the queued turn and analysis when Chat is busy', async () => {
    analyzeImage.mockResolvedValue('red leather sneaker')
    chatState.isBusy = true
    renderWidget()

    await act(async () => {
      await expect(
        chatProps.imageSubmission?.submitImage(IMAGE_SUBMISSION),
      ).rejects.toThrow('Chat did not accept the image message')
    })

    expect(chatSendMessage).not.toHaveBeenCalled()
    expect(chatProps.queuedImageMessage).toBeNull()
    expect(chatProps.context?.()).not.toHaveProperty('imageAnalysis')
  })

  it('clears the queued turn without sending when image analysis fails', async () => {
    analyzeImage.mockRejectedValue(new Error('Image analysis failed'))
    renderWidget()

    await act(async () => {
      await expect(
        chatProps.imageSubmission?.submitImage(IMAGE_SUBMISSION),
      ).rejects.toThrow('Image analysis failed')
    })

    expect(chatSendMessage).not.toHaveBeenCalled()
    expect(chatProps.queuedImageMessage).toBeNull()
    expect(chatProps.context?.()).not.toHaveProperty('imageAnalysis')
  })

  it('does not re-queue the turn when the thumbnail finishes after a failed analysis', async () => {
    let resolveThumbnail: (url: string) => void = () => {}
    createImageThumbnail.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveThumbnail = resolve
      }),
    )
    analyzeImage.mockRejectedValue(new Error('Image analysis failed'))
    renderWidget()

    await act(async () => {
      await expect(
        chatProps.imageSubmission?.submitImage(IMAGE_SUBMISSION),
      ).rejects.toThrow('Image analysis failed')
    })
    await act(async () => {
      resolveThumbnail('data:image/jpeg;base64,VEhVTUI=')
    })

    expect(chatSendMessage).not.toHaveBeenCalled()
    expect(chatProps.queuedImageMessage).toBeNull()
  })

  it('rejects without sending when image analysis comes back empty', async () => {
    analyzeImage.mockResolvedValue('   ')
    renderWidget()

    await act(async () => {
      await expect(
        chatProps.imageSubmission?.submitImage(IMAGE_SUBMISSION),
      ).rejects.toThrow('Image analysis did not return a result')
    })

    expect(chatSendMessage).not.toHaveBeenCalled()
    expect(chatProps.queuedImageMessage).toBeNull()
    expect(chatProps.context?.()).not.toHaveProperty('imageAnalysis')
  })

  it('rejects without sending a text-only turn when the thumbnail fails', async () => {
    analyzeImage.mockResolvedValue('red leather sneaker')
    createImageThumbnail.mockRejectedValueOnce(new Error('Could not load the image'))
    renderWidget()

    await act(async () => {
      await expect(
        chatProps.imageSubmission?.submitImage(IMAGE_SUBMISSION),
      ).rejects.toThrow('Could not load the image')
    })

    expect(chatSendMessage).not.toHaveBeenCalled()
    expect(chatProps.queuedImageMessage).toBeNull()
    expect(chatProps.context?.()).not.toHaveProperty('imageAnalysis')
  })

  it('holds a hand-off until the image turn has been sent first', async () => {
    let resolveAnalysis: (analysis: string) => void = () => {}
    analyzeImage.mockReturnValue(
      new Promise((resolve) => {
        resolveAnalysis = resolve
      }),
    )
    const { store, rerender } = renderWidget()

    let submission: Promise<void> | undefined
    act(() => {
      submission = chatProps.imageSubmission?.submitImage(IMAGE_SUBMISSION)
    })
    act(() => store.set(chatWidgetPendingMessageAtom, 'show me running shoes'))

    expect(openChat).not.toHaveBeenCalled()
    expect(store.get(chatWidgetPendingMessageAtom)).toBe(
      'show me running shoes',
    )

    // Live Chat goes busy once the image turn is sent.
    chatSendMessage.mockImplementation(() => {
      chatState.isBusy = true
    })
    await act(async () => {
      resolveAnalysis('red leather sneaker')
      await submission
    })

    expect(chatSendMessage).toHaveBeenCalledExactlyOnceWith(IMAGE_MESSAGE)
    expect(openChat).not.toHaveBeenCalled()
    expect(store.get(chatWidgetPendingMessageAtom)).toBe(
      'show me running shoes',
    )

    chatState.isBusy = false
    rerender(<InstantSearchChatWidget />)

    await waitFor(() =>
      expect(store.get(chatWidgetPendingMessageAtom)).toBeNull(),
    )
    expect(openChat).toHaveBeenCalledExactlyOnceWith({
      message: 'show me running shoes',
      referer: 'ai-mode',
    })
    expect(chatSendMessage).toHaveBeenCalledOnce()
  })

  it('keeps a pending message Chat refused while busy', async () => {
    openChat.mockReturnValue(false)
    const { store } = renderWidget({ pendingMessage: 'show me running shoes' })

    await waitFor(() => expect(openChat).toHaveBeenCalledOnce())
    expect(store.get(chatWidgetPendingMessageAtom)).toBe(
      'show me running shoes',
    )
  })

  it('disables follow-up suggestions while an image is analyzed', async () => {
    let resolveAnalysis: (analysis: string) => void = () => {}
    analyzeImage.mockReturnValue(
      new Promise((resolve) => {
        resolveAnalysis = resolve
      }),
    )
    const { getByRole } = renderWidget()
    const suggestion = getByRole('button', { name: 'Show cheaper options' })

    let submission: Promise<void> | undefined
    act(() => {
      submission = chatProps.imageSubmission?.submitImage(IMAGE_SUBMISSION)
    })

    expect(suggestion).toBeDisabled()
    act(() => suggestion.click())
    expect(suggestionClick).not.toHaveBeenCalled()

    await act(async () => {
      resolveAnalysis('red leather sneaker')
      await submission
    })

    expect(suggestion).toBeEnabled()
    act(() => suggestion.click())
    expect(suggestionClick).toHaveBeenCalledExactlyOnceWith(
      'Show cheaper options',
    )
    expect(chatSendMessage).toHaveBeenCalledExactlyOnceWith(IMAGE_MESSAGE)
  })
})
