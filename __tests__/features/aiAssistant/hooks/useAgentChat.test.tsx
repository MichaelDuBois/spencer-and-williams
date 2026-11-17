import { renderHook, act } from '@testing-library/react'
import { Provider, createStore } from 'jotai'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AssistantCatalogContext } from '@/features/aiAssistant/AssistantCatalogContext'
import {
  IMAGE_ONLY_MESSAGE,
  IMAGE_ONLY_RESPONSE_INSTRUCTION,
} from '@/features/aiAssistant/constants'
import { useAgentChat } from '@/features/aiAssistant/hooks/useAgentChat'
import type { SendCompletionOptions } from '@/features/aiAssistant/hooks/useAgentClient'
import {
  fashionContentContextState,
  productContextState,
  relatedArticlesContextState,
  travelContentContextState,
  viewerContextState,
} from '@/features/aiAssistant/stores/aiAssistant'
import { track } from '@/lib/analytics/track'
import { activeConfigAtom } from '@/stores/activeConfig'
import type { VerticalConfig } from '@/types'

import type { ReactNode } from 'react'

const sendCompletionMock = vi.fn()

vi.mock('@/lib/analytics/track', () => {
  return { track: vi.fn() }
})

const { analyzeImageMock } = vi.hoisted(() => {
  return { analyzeImageMock: vi.fn() }
})

vi.mock('@/features/aiAssistant/services/imageAnalysisService', () => {
  return { analyzeImage: analyzeImageMock }
})

vi.mock('@/features/aiAssistant/hooks/useAgentClient', () => {
  return {
    useAgentClient: () => {
      return {
        sendCompletion: sendCompletionMock,
        isReady: true,
      }
    },
  }
})

vi.mock('@/features/aiAssistant/hooks/search/useSearch', () => {
  return {
    useSearch: () => vi.fn(),
  }
})

vi.mock('@/features/aiAssistant/hooks/useToolExecutor', () => {
  return {
    useToolExecutor: () => {
      return {
        executeToolCalls: vi.fn(),
        streamingDisplay: null,
      }
    },
  }
})

const ensureIndexContextMock = vi.fn()

vi.mock('@/features/aiAssistant/hooks/useIndexContext', () => {
  return {
    useIndexContext: () => {
      return { ensureIndexContext: ensureIndexContextMock }
    },
  }
})

// Personalization/cart are exercised by their own suites; here they only need
// to yield an anonymous, empty-cart shopper so persona context stays minimal.
vi.mock('@/hooks/usePersonalization', () => {
  return {
    usePersonalization: () => {
      return {
        currentUserToken: '',
        currentOptionalFilters: [],
        mode: 'anonymous' as const,
      }
    },
  }
})

vi.mock('@/hooks/useCart', () => {
  return {
    useCart: () => {
      return { items: [], totalItems: 0, totalPrice: 0 }
    },
  }
})

const minimalConfig = {
  slug: 'fashion',
  algolia: { appId: 'X', apiKey: 'Y' },
  features: { agentStudio: { shoppingAssistantAgentID: 'agent' } },
} as unknown as VerticalConfig

type ApiMessage = {
  role: string
  parts: Array<{ text?: string }>
}

const buildWrapper = (store: ReturnType<typeof createStore>) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
  return Wrapper
}

const captureMessages = (): ApiMessage[] => {
  expect(sendCompletionMock).toHaveBeenCalledTimes(1)
  return sendCompletionMock.mock.calls[0][0] as ApiMessage[]
}

const getPartTexts = (message: ApiMessage): string[] =>
  message.parts.map((part) => part.text ?? '')

const isPersonaContext = (message: ApiMessage): boolean =>
  (message.parts[0]?.text ?? '').includes('The shopper is browsing')

// The hook always prepends a persona/vertical context note (see
// buildPersonaContext). These tests assert on page context + the user turn, so
// drop the leading persona note to keep those assertions focused.
const withoutPersonaContext = (messages: ApiMessage[]): ApiMessage[] =>
  messages.filter((message) => !isPersonaContext(message))

describe('useAgentChat — page context injection', () => {
  beforeEach(() => {
    sendCompletionMock.mockReset()
    sendCompletionMock.mockResolvedValue({
      textContent: '',
      toolCalls: [],
      messageId: null,
      suggestions: [],
    })
    ensureIndexContextMock.mockReset()
    ensureIndexContextMock.mockResolvedValue(null)
  })

  it('sends hidden turn context immediately before the visible user turn', async () => {
    const store = createStore()
    store.set(activeConfigAtom, minimalConfig)
    const { result } = renderHook(() => useAgentChat(), {
      wrapper: buildWrapper(store),
    })

    await act(async () => {
      await result.current.sendMessage('find another option', {
        turnContext: { searchRecovery: 'The previous search had zero hits.' },
      })
    })

    const messages = withoutPersonaContext(captureMessages())
    expect(messages).toHaveLength(2)
    expect(messages[0]).toEqual({
      role: 'user',
      parts: [{ text: 'The previous search had zero hits.' }],
    })
    expect(messages[1].parts).toEqual([{ text: 'find another option' }])
    const visibleUserMessage = result.current.messages.find(
      (message) => message.role === 'user',
    )
    expect(visibleUserMessage?.parts).toEqual([
      { type: 'text', text: 'find another option' },
    ])
    expect(JSON.stringify(result.current.messages)).not.toContain(
      'The previous search had zero hits.',
    )
  })

  it('injects product context as a leading user message containing the JSON', async () => {
    const productData = {
      objectID: 'p1',
      productUrl: '/fashion/product/p1',
      name: 'Linen Shirt',
      brand: 'Spencer',
      image: 'https://cdn/img.jpg',
      price: 99.5,
      description: 'Lightweight linen',
      sizes: ['S', 'M', 'L'],
    }
    const store = createStore()
    store.set(activeConfigAtom, minimalConfig)
    store.set(productContextState, productData)

    const { result } = renderHook(() => useAgentChat(), {
      wrapper: buildWrapper(store),
    })

    await act(async () => {
      await result.current.sendMessage('hello')
    })

    const rawMessages = captureMessages()
    // Persona/vertical context is always prepended.
    expect(rawMessages.some(isPersonaContext)).toBe(true)

    const messages = withoutPersonaContext(rawMessages)
    expect(messages).toHaveLength(2)
    expect(messages[0].role).toBe('user')
    const contextText = messages[0].parts[0].text ?? ''
    expect(contextText).toContain('viewing this product page')
    expect(contextText).toContain('full product data')
    expect(contextText).toContain(JSON.stringify(productData))
    expect(messages[1].parts[0].text).toBe('hello')
  })

  it('injects product context over travel context when both are set', async () => {
    const productData = { objectID: 'p1', productUrl: '/p1', name: 'X' }
    const articleData = { objectID: 'a1', productUrl: '/a1', title: 'Y' }
    const store = createStore()
    store.set(activeConfigAtom, minimalConfig)
    store.set(productContextState, productData)
    store.set(travelContentContextState, {
      contentType: 'article',
      record: articleData as never,
    })

    const { result } = renderHook(() => useAgentChat(), {
      wrapper: buildWrapper(store),
    })

    await act(async () => {
      await result.current.sendMessage('hello')
    })

    const messages = withoutPersonaContext(captureMessages())

    expect(messages).toHaveLength(2)
    expect(messages[0].parts[0].text).toContain('product page')
    expect(messages[0].parts[0].text).toContain(JSON.stringify(productData))
    expect(messages[1].role).toBe('user')
    expect(messages[1].parts[0].text).toBe('hello')
  })

  it('injects travel article context when product context is not set', async () => {
    const articleData = { objectID: 'a1', productUrl: '/a1', title: 'Y' }
    const store = createStore()
    store.set(activeConfigAtom, minimalConfig)
    store.set(travelContentContextState, {
      contentType: 'article',
      record: articleData as never,
    })

    const { result } = renderHook(() => useAgentChat(), {
      wrapper: buildWrapper(store),
    })

    await act(async () => {
      await result.current.sendMessage('hello')
    })

    const messages = withoutPersonaContext(captureMessages())
    expect(messages).toHaveLength(2)
    expect(messages[0].parts[0].text).toContain('article page')
    expect(messages[0].parts[0].text).toContain(JSON.stringify(articleData))
  })

  it('does not inject page context when the page atoms are null', async () => {
    const store = createStore()
    store.set(activeConfigAtom, minimalConfig)

    const { result } = renderHook(() => useAgentChat(), {
      wrapper: buildWrapper(store),
    })

    await act(async () => {
      await result.current.sendMessage('hello')
    })

    // Persona/vertical context is always present; no page context is added.
    const messages = withoutPersonaContext(captureMessages())
    expect(messages).toHaveLength(1)
    expect(messages[0].role).toBe('user')
    expect(messages[0].parts[0].text).toBe('hello')
  })

  it('injects fashion article context when the other page atoms are null', async () => {
    const articleData = {
      objectID: 'fashion-article-zip-and-puff-city-kit',
      productUrl: '/fashion/article/fashion-article-zip-and-puff-city-kit',
      title: 'Zip, Puff, Roll: A City Kit for Blue-on-Grey Weekend Wear',
      aiSummary: 'A tonal blue-and-grey outfit.',
    }
    const store = createStore()
    store.set(activeConfigAtom, minimalConfig)
    store.set(fashionContentContextState, articleData as never)

    const { result } = renderHook(() => useAgentChat(), {
      wrapper: buildWrapper(store),
    })

    await act(async () => {
      await result.current.sendMessage('hello')
    })

    const messages = withoutPersonaContext(captureMessages())
    expect(messages).toHaveLength(2)
    // Travel articles produce the same 'article page' label, so the serialised
    // record is what proves this came from the fashion atom.
    expect(messages[0].parts[0].text).toContain(JSON.stringify(articleData))
    expect(messages[0].parts[0].text).toContain('article page')
    expect(messages[0].parts[0].text).toContain('article data')
    expect(messages[1].parts[0].text).toBe('hello')
  })

  it('injects product context over fashion article context when both are set', async () => {
    const productData = { objectID: 'p1', productUrl: '/p1', name: 'X' }
    const articleData = { objectID: 'a1', productUrl: '/a1', title: 'Y' }
    const store = createStore()
    store.set(activeConfigAtom, minimalConfig)
    store.set(productContextState, productData)
    store.set(fashionContentContextState, articleData as never)

    const { result } = renderHook(() => useAgentChat(), {
      wrapper: buildWrapper(store),
    })

    await act(async () => {
      await result.current.sendMessage('hello')
    })

    const messages = withoutPersonaContext(captureMessages())
    expect(messages).toHaveLength(2)
    expect(messages[0].parts[0].text).toContain('product page')
    expect(messages[0].parts[0].text).toContain(JSON.stringify(productData))
    expect(messages[0].parts[0].text).not.toContain(JSON.stringify(articleData))
  })

  it('serialises the full HitValues object so every field reaches the agent', async () => {
    const fullProduct = {
      objectID: 'p1',
      productUrl: '/fashion/product/p1',
      name: 'Linen Shirt',
      brand: 'Spencer',
      image: 'https://cdn/img.jpg',
      price: 99.5,
      description: 'Lightweight linen',
      sizes: ['S', 'M', 'L'],
    }
    const store = createStore()
    store.set(activeConfigAtom, minimalConfig)
    store.set(productContextState, fullProduct)

    const { result } = renderHook(() => useAgentChat(), {
      wrapper: buildWrapper(store),
    })

    await act(async () => {
      await result.current.sendMessage('hello')
    })

    const messages = withoutPersonaContext(captureMessages())
    const contextText = messages[0].parts[0].text ?? ''
    const jsonMatch = contextText.match(/\{.*\}/)
    expect(jsonMatch).not.toBeNull()
    const parsed = JSON.parse(jsonMatch![0])
    expect(parsed).toEqual(fullProduct)
  })

  it('drops undefined fields from the serialised payload', async () => {
    const sparseArticle = {
      objectID: 'a1',
      productUrl: '/travel/article/a1',
      title: 'Lisbon in winter',
      author: undefined,
      readTime: undefined,
    }
    const store = createStore()
    store.set(activeConfigAtom, minimalConfig)
    store.set(travelContentContextState, {
      contentType: 'article',
      record: sparseArticle as never,
    })

    const { result } = renderHook(() => useAgentChat(), {
      wrapper: buildWrapper(store),
    })

    await act(async () => {
      await result.current.sendMessage('hello')
    })

    const messages = withoutPersonaContext(captureMessages())
    const contextText = messages[0].parts[0].text ?? ''
    expect(contextText).toContain('Lisbon in winter')
    expect(contextText).not.toContain('"author"')
    expect(contextText).not.toContain('"readTime"')
    expect(contextText).not.toContain('null')
  })

  it('injects related articles directly after the product context', async () => {
    const productData = { objectID: 'p1', productUrl: '/p1', name: 'Hoodie' }
    const relatedArticles = [
      {
        objectID: 'zip-and-puff',
        title: 'Zip, Puff, Roll',
        url: '/fashion/article/zip-and-puff',
        category: 'Styling Guide',
        readingTime: 5,
      },
    ]
    const store = createStore()
    store.set(activeConfigAtom, minimalConfig)
    store.set(productContextState, productData)
    store.set(relatedArticlesContextState, relatedArticles)

    const { result } = renderHook(() => useAgentChat(), {
      wrapper: buildWrapper(store),
    })

    await act(async () => {
      await result.current.sendMessage('how would I wear this?')
    })

    const messages = withoutPersonaContext(captureMessages())

    expect(messages).toHaveLength(3)
    expect(messages[0].parts[0].text).toContain('product page')
    const articlesText = messages[1].parts[0].text ?? ''
    expect(articlesText).toContain('mention the product being viewed')
    expect(articlesText).toContain(JSON.stringify(relatedArticles))
    expect(messages[2].parts[0].text).toBe('how would I wear this?')
  })

  it('does not inject an articles note when none matched the product', async () => {
    const store = createStore()
    store.set(activeConfigAtom, minimalConfig)
    store.set(productContextState, {
      objectID: 'p1',
      productUrl: '/p1',
      name: 'Hoodie',
    })
    store.set(relatedArticlesContextState, [])

    const { result } = renderHook(() => useAgentChat(), {
      wrapper: buildWrapper(store),
    })

    await act(async () => {
      await result.current.sendMessage('hello')
    })

    const messages = withoutPersonaContext(captureMessages())
    expect(messages).toHaveLength(2)
    expect(messages[0].parts[0].text).toContain('product page')
    expect(messages[1].parts[0].text).toBe('hello')
  })
})

describe('useAgentChat — image search', () => {
  const imageArgs = {
    text: 'blue shoes',
    imageDataUrl: 'data:image/png;base64,QUJD',
    base64Image: 'QUJD',
    mediaType: 'image/png',
  }

  const renderChat = () => {
    const store = createStore()
    store.set(activeConfigAtom, minimalConfig)
    return renderHook(() => useAgentChat(), { wrapper: buildWrapper(store) })
  }

  beforeEach(() => {
    sendCompletionMock.mockReset()
    sendCompletionMock.mockResolvedValue({
      textContent: '',
      toolCalls: [],
      messageId: null,
      suggestions: [],
    })
    analyzeImageMock.mockReset()
    analyzeImageMock.mockResolvedValue('red leather sneaker')
    ensureIndexContextMock.mockReset()
    ensureIndexContextMock.mockResolvedValue(null)
  })

  it('analyzes the image and injects the analysis into the last user message', async () => {
    const { result } = renderChat()

    await act(async () => {
      await result.current.sendImageMessage(imageArgs)
    })

    expect(analyzeImageMock).toHaveBeenCalledWith({
      base64Image: 'QUJD',
      mediaType: 'image/png',
    })

    const messages = captureMessages()
    const lastParts = getPartTexts(messages[messages.length - 1])
    expect(lastParts).toEqual([
      'blue shoes',
      'Image Analysis:\nred leather sneaker',
    ])
    // The raw image data URL is never sent to the agent.
    expect(JSON.stringify(messages)).not.toContain('data:image/png;base64')
  })

  it('adds image-only response guidance when no text is provided', async () => {
    const { result } = renderChat()

    await act(async () => {
      await result.current.sendImageMessage({ ...imageArgs, text: '  ' })
    })

    const messages = captureMessages()
    // Observations and response guidance travel as separate parts.
    expect(getPartTexts(messages[messages.length - 1])).toEqual([
      'Image Analysis:\nred leather sneaker',
      IMAGE_ONLY_RESPONSE_INSTRUCTION,
    ])
  })

  it('omits the analysis block when the vision endpoint returns nothing', async () => {
    analyzeImageMock.mockResolvedValue('')
    const { result } = renderChat()

    await act(async () => {
      await result.current.sendImageMessage(imageArgs)
    })

    const messages = captureMessages()
    expect(getPartTexts(messages[messages.length - 1])).toEqual(['blue shoes'])
  })

  it('does not add image-only response guidance when text is provided', async () => {
    const { result } = renderChat()

    await act(async () => {
      await result.current.sendImageMessage(imageArgs)
    })

    const messages = captureMessages()
    expect(getPartTexts(messages[messages.length - 1])).not.toContain(
      IMAGE_ONLY_RESPONSE_INSTRUCTION,
    )
  })

  it('sends hidden placeholder text for an image-only turn with an empty analysis', async () => {
    analyzeImageMock.mockResolvedValue('   ')
    const { result } = renderChat()

    await act(async () => {
      await result.current.sendImageMessage({ ...imageArgs, text: '' })
    })

    const messages = captureMessages()
    expect(getPartTexts(messages[messages.length - 1])).toEqual([
      IMAGE_ONLY_MESSAGE,
      IMAGE_ONLY_RESPONSE_INSTRUCTION,
    ])
  })

  it('keeps the image context in history for follow-up requests', async () => {
    sendCompletionMock.mockImplementation(
      async (_messages: ApiMessage[], callbacks?: SendCompletionOptions) => {
        callbacks?.onTextDelta?.('Here are close matches.')
        return {
          textContent: 'Here are close matches.',
          toolCalls: [],
          messageId: null,
          suggestions: [],
        }
      },
    )
    const { result } = renderChat()

    await act(async () => {
      await result.current.sendImageMessage({ ...imageArgs, text: '' })
    })
    await act(async () => {
      await result.current.sendMessage('cheaper please')
    })

    expect(sendCompletionMock).toHaveBeenCalledTimes(2)
    const followUp = sendCompletionMock.mock.calls[1][0] as ApiMessage[]
    expect(followUp.every((message) => message.parts.length > 0)).toBe(true)
    const imageTurn = followUp[followUp.length - 3]
    expect(imageTurn.role).toBe('user')
    expect(getPartTexts(imageTurn)).toEqual([
      'Image Analysis:\nred leather sneaker',
      IMAGE_ONLY_RESPONSE_INSTRUCTION,
    ])
    expect(getPartTexts(followUp[followUp.length - 1])).toEqual([
      'cheaper please',
    ])
  })

  it('keeps a failed image-only turn non-empty in later requests', async () => {
    analyzeImageMock.mockRejectedValueOnce(new Error('vision boom'))
    const { result } = renderChat()

    await act(async () => {
      await result.current.sendImageMessage({ ...imageArgs, text: '' })
    })
    await act(async () => {
      await result.current.sendMessage('hello')
    })

    const messages = captureMessages()
    expect(messages.every((message) => message.parts.length > 0)).toBe(true)
    expect(getPartTexts(messages[messages.length - 2])).toEqual([
      IMAGE_ONLY_MESSAGE,
      IMAGE_ONLY_RESPONSE_INSTRUCTION,
    ])
  })

  it('renders the uploaded image as a thumbnail on the user message', async () => {
    const { result } = renderChat()

    await act(async () => {
      await result.current.sendImageMessage(imageArgs)
    })

    const userMessage = result.current.messages.find((m) => m.role === 'user')
    expect(userMessage?.parts).toEqual(
      expect.arrayContaining([
        { type: 'image', imageUrl: 'data:image/png;base64,QUJD' },
        { type: 'text', text: 'blue shoes' },
      ]),
    )
  })

  it('moves through analyzing_image before streaming and settles idle', async () => {
    let resolveAnalysis: (value: string) => void = () => {}
    analyzeImageMock.mockReturnValue(
      new Promise<string>((resolve) => {
        resolveAnalysis = resolve
      }),
    )

    const { result } = renderChat()

    let pending: Promise<void>
    act(() => {
      pending = result.current.sendImageMessage(imageArgs)
    })

    // While the vision call is in flight the status reflects the analysis phase.
    expect(result.current.status).toBe('analyzing_image')

    await act(async () => {
      resolveAnalysis('red leather sneaker')
      await pending
    })

    expect(result.current.status).toBe('idle')
    expect(sendCompletionMock).toHaveBeenCalledTimes(1)
  })

  it('reports an error and removes the empty placeholder when analysis fails', async () => {
    analyzeImageMock.mockRejectedValue(new Error('vision boom'))
    const { result } = renderChat()

    await act(async () => {
      await result.current.sendImageMessage(imageArgs)
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('vision boom')
    // The empty assistant placeholder is cleaned up; only the user message remains.
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].role).toBe('user')
    // The failed turn never reached the agent.
    expect(sendCompletionMock).not.toHaveBeenCalled()
  })
})

describe('useAgentChat — request errors', () => {
  beforeEach(() => {
    sendCompletionMock.mockReset()
    ensureIndexContextMock.mockReset()
    ensureIndexContextMock.mockResolvedValue(null)
  })

  it('shows a friendly error when the agent request times out', async () => {
    sendCompletionMock.mockRejectedValue(
      new DOMException('The operation timed out', 'TimeoutError'),
    )
    const store = createStore()
    store.set(activeConfigAtom, minimalConfig)
    const { result } = renderHook(() => useAgentChat(), {
      wrapper: buildWrapper(store),
    })

    await act(async () => {
      await result.current.sendMessage('hello')
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe(
      'The assistant took too long to respond. Please try again.',
    )
    expect(result.current.error).not.toContain('timed out')
  })
})

describe('useAgentChat — index context injection', () => {
  const indexContext = '[Index context: brand: "Nike"]'

  beforeEach(() => {
    sendCompletionMock.mockReset()
    sendCompletionMock.mockResolvedValue({
      textContent: '',
      toolCalls: [],
      messageId: null,
      suggestions: [],
    })
    ensureIndexContextMock.mockReset()
    ensureIndexContextMock.mockResolvedValue(indexContext)
  })

  const renderChat = () => {
    const store = createStore()
    store.set(activeConfigAtom, minimalConfig)
    return {
      store,
      ...renderHook(() => useAgentChat(), { wrapper: buildWrapper(store) }),
    }
  }

  it('prepends the index context as the leading user message', async () => {
    const { result } = renderChat()

    await act(async () => {
      await result.current.sendMessage('hello')
    })

    const messages = withoutPersonaContext(captureMessages())
    expect(messages).toHaveLength(2)
    expect(messages[0].role).toBe('user')
    expect(messages[0].parts[0].text).toBe(indexContext)
    expect(messages[1].parts[0].text).toBe('hello')
  })

  it('places the index context ahead of the page context', async () => {
    const store = createStore()
    store.set(activeConfigAtom, minimalConfig)
    store.set(productContextState, {
      objectID: 'p1',
      productUrl: '/p1',
      name: 'X',
    })

    const { result } = renderHook(() => useAgentChat(), {
      wrapper: buildWrapper(store),
    })

    await act(async () => {
      await result.current.sendMessage('hello')
    })

    const messages = withoutPersonaContext(captureMessages())
    expect(messages).toHaveLength(3)
    expect(messages[0].parts[0].text).toBe(indexContext)
    expect(messages[1].parts[0].text).toContain('product page')
    expect(messages[2].parts[0].text).toBe('hello')
  })

  it('omits the block when no context is available', async () => {
    ensureIndexContextMock.mockResolvedValue(null)
    const { result } = renderChat()

    await act(async () => {
      await result.current.sendMessage('hello')
    })

    const messages = withoutPersonaContext(captureMessages())
    expect(messages).toHaveLength(1)
    expect(messages[0].parts[0].text).toBe('hello')
  })

  it('waits for the context before calling the agent', async () => {
    let resolveContext: (value: string | null) => void = () => {}
    ensureIndexContextMock.mockReturnValue(
      new Promise<string | null>((resolve) => {
        resolveContext = resolve
      }),
    )

    const { result } = renderChat()

    let pending: Promise<void>
    act(() => {
      pending = result.current.sendMessage('hello')
    })

    expect(sendCompletionMock).not.toHaveBeenCalled()

    await act(async () => {
      resolveContext(indexContext)
      await pending
    })

    const messages = captureMessages()
    expect(messages[0].parts[0].text).toBe(indexContext)
  })

  it('prepends the context on image sends too', async () => {
    analyzeImageMock.mockReset()
    analyzeImageMock.mockResolvedValue('red leather sneaker')
    const { result } = renderChat()

    await act(async () => {
      await result.current.sendImageMessage({
        text: 'blue shoes',
        imageDataUrl: 'data:image/png;base64,QUJD',
        base64Image: 'QUJD',
        mediaType: 'image/png',
      })
    })

    const messages = captureMessages()
    expect(messages[0].parts[0].text).toBe(indexContext)
  })
})

describe('useAgentChat — viewer context', () => {
  beforeEach(() => {
    sendCompletionMock.mockReset()
    sendCompletionMock.mockResolvedValue({
      textContent: '',
      toolCalls: [],
      messageId: null,
      suggestions: [],
    })
    ensureIndexContextMock.mockReset()
    ensureIndexContextMock.mockResolvedValue(null)
  })

  const sendWithViewerContext = async (viewerContext: string | null) => {
    const store = createStore()
    store.set(activeConfigAtom, minimalConfig)
    if (viewerContext) store.set(viewerContextState, viewerContext)

    const { result } = renderHook(() => useAgentChat(), {
      wrapper: buildWrapper(store),
    })

    await act(async () => {
      await result.current.sendMessage('what should I watch?')
    })

    return captureMessages()
  }

  it('sends the commerce persona note when no viewer context is set', async () => {
    const messages = await sendWithViewerContext(null)

    expect(messages.some(isPersonaContext)).toBe(true)
  })

  // Two notes describing the same person — one calling them a shopper, one a
  // viewer — is worse than either, so a vertical's note replaces the default.
  it('replaces the commerce persona note rather than adding to it', async () => {
    const viewerContext = '[Context: The viewer is on the "Noah" profile.]'
    const messages = await sendWithViewerContext(viewerContext)

    expect(messages.some(isPersonaContext)).toBe(false)
    expect(messages[0].parts[0].text).toBe(viewerContext)
    expect(messages[1].parts[0].text).toBe('what should I watch?')
  })
})

describe('useAgentChat cancellation', () => {
  it('honors scope cancellation and omits a product that has not passed current validation', async () => {
    const store = createStore()
    store.set(activeConfigAtom, minimalConfig)
    store.set(productContextState, {
      objectID: 'old',
      name: 'Old product',
      productUrl: '/old',
    })
    const controller = new AbortController()
    const pending = Promise.withResolvers<{
      textContent: string
      toolCalls: []
      suggestions: string[]
      messageId: null
    }>()
    let callbacks: SendCompletionOptions | undefined
    sendCompletionMock
      .mockReset()
      .mockImplementation((_messages, options: SendCompletionOptions) => {
        callbacks = options
        return pending.promise
      })
    ensureIndexContextMock.mockResolvedValue(null)
    const catalog = {
      queryOptions: {},
      productCacheKey: ['b2b-products'],
      isReady: true,
      sessionKey: '0',
      context:
        '[Catalog context: Customer group: customer_group_0. Warehouse: 1.]',
      productContext: null,
      resetSession: vi.fn(),
      signal: controller.signal,
    }
    const { result } = renderHook(() => useAgentChat(), {
      wrapper: ({ children }) => (
        <Provider store={store}>
          <AssistantCatalogContext.Provider value={catalog}>
            {children}
          </AssistantCatalogContext.Provider>
        </Provider>
      ),
    })
    let request: Promise<void>
    await act(async () => {
      request = result.current.sendMessage('drill')
    })
    const sent = JSON.stringify(captureMessages())
    expect(sent).toContain('customer_group_0')
    expect(sent).not.toContain('Old product')
    const before = result.current.messages
    await act(async () => {
      controller.abort()
      callbacks?.onTextDelta?.('old response')
      pending.resolve({
        textContent: 'old response',
        toolCalls: [],
        suggestions: ['old suggestion'],
        messageId: null,
      })
      await request
    })
    expect(callbacks?.signal?.aborted).toBe(true)
    expect(result.current.messages).toEqual(before)
    expect(result.current.suggestions).toEqual([])
  })
})

describe('useAgentChat — message tracking', () => {
  const imageArgs = {
    imageDataUrl: 'data:image/png;base64,QUJD',
    base64Image: 'QUJD',
    mediaType: 'image/png',
  }

  const renderChat = ({ isCatalogReady = true } = {}) => {
    const store = createStore()
    store.set(activeConfigAtom, minimalConfig)
    const catalog = {
      queryOptions: {},
      productCacheKey: ['b2b-products'],
      isReady: isCatalogReady,
      sessionKey: '0',
      context: '',
      productContext: null,
      resetSession: vi.fn(),
      signal: new AbortController().signal,
    }
    return renderHook(() => useAgentChat(), {
      wrapper: ({ children }) => (
        <Provider store={store}>
          <AssistantCatalogContext.Provider value={catalog}>
            {children}
          </AssistantCatalogContext.Provider>
        </Provider>
      ),
    })
  }

  const messageSentCalls = () =>
    vi
      .mocked(track)
      .mock.calls.filter(([name]) => name === 'assistant_message_sent')

  beforeEach(() => {
    vi.mocked(track).mockClear()
    sendCompletionMock.mockReset()
    sendCompletionMock.mockResolvedValue({
      textContent: '',
      toolCalls: [],
      messageId: null,
      suggestions: [],
    })
    analyzeImageMock.mockReset()
    analyzeImageMock.mockResolvedValue('red leather sneaker')
    ensureIndexContextMock.mockReset()
    ensureIndexContextMock.mockResolvedValue(null)
  })

  it('tracks a sent text message', async () => {
    const { result } = renderChat()

    await act(async () => {
      await result.current.sendMessage('do you sell tents?')
    })

    expect(messageSentCalls()).toEqual([
      [
        'assistant_message_sent',
        { surface: 'ai_assistant', message: 'do you sell tents?' },
      ],
    ])
  })

  it('does not track a blank message', async () => {
    const { result } = renderChat()

    await act(async () => {
      await result.current.sendMessage('   ')
    })

    expect(track).not.toHaveBeenCalled()
  })

  it('does not track a message dropped while the catalog is not ready', async () => {
    const { result } = renderChat({ isCatalogReady: false })

    await act(async () => {
      await result.current.sendMessage('do you sell tents?')
    })

    expect(sendCompletionMock).not.toHaveBeenCalled()
    expect(track).not.toHaveBeenCalled()
  })

  it('tracks an image message with its typed prompt', async () => {
    const { result } = renderChat()

    await act(async () => {
      await result.current.sendImageMessage({ ...imageArgs, text: 'in blue?' })
    })

    expect(messageSentCalls()).toEqual([
      ['assistant_message_sent', { surface: 'ai_assistant', message: 'in blue?' }],
    ])
  })

  it('tracks an image-only message with the default prompt it sends', async () => {
    const { result } = renderChat()

    await act(async () => {
      await result.current.sendImageMessage({ ...imageArgs, text: '' })
    })

    expect(messageSentCalls()).toEqual([
      [
        'assistant_message_sent',
        { surface: 'ai_assistant', message: '' },
      ],
    ])
  })

  it('does not track an image message dropped while the catalog is not ready', async () => {
    const { result } = renderChat({ isCatalogReady: false })

    await act(async () => {
      await result.current.sendImageMessage({ ...imageArgs, text: 'in blue?' })
    })

    expect(analyzeImageMock).not.toHaveBeenCalled()
    expect(track).not.toHaveBeenCalled()
  })
})
