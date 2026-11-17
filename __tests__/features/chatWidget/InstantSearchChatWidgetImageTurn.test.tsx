import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { InstantSearch } from 'react-instantsearch'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  IMAGE_ONLY_MESSAGE,
  IMAGE_ONLY_RESPONSE_INSTRUCTION,
} from '@/features/aiAssistant/constants'
import { InstantSearchChatWidget } from '@/features/chatWidget/components/InstantSearchChatWidget'
import { activeConfigAtom } from '@/stores/activeConfig'
import { chatWidgetEnabledAtom, demoOptionsStore } from '@/stores/demoOptions'
import { isRecord } from '@/utilities/isRecord'

import { createTestStore } from '../../helpers/jotai-wrapper'
import {
  buildProvidersWrapper,
  createMockConfig,
} from '../../helpers/test-utils'

const { analyzeImage } = vi.hoisted(() => {
  return { analyzeImage: vi.fn(async () => 'red leather sneaker') }
})

vi.mock('next/navigation', () => {
  return {
    usePathname: () => '/ecommerce/search',
    useRouter: () => {
      return { push: vi.fn() }
    },
    useSearchParams: () => new URLSearchParams(),
  }
})
vi.mock('@/features/aiAssistant/services/imageAnalysisService', () => {
  return { analyzeImage }
})
// jsdom has no canvas to downscale with.
vi.mock('@/features/chatWidget/utils/createImageThumbnail', () => {
  return { createImageThumbnail: async () => THUMBNAIL_URL }
})

const AGENT_ID = 'persistence-agent'
const STORAGE_KEY = `instantsearch-chat-initial-messages-${AGENT_ID}`
const THUMBNAIL_URL = 'data:image/jpeg;base64,VEhVTUI='
const ANSWER = 'Here are similar sneakers.'
const IMAGE_TURN_CONTEXT = {
  imageAnalysis: 'Image Analysis:\nred leather sneaker',
  imageInstruction: IMAGE_ONLY_RESPONSE_INSTRUCTION,
}

const SEARCH_CLIENT = {
  appId: 'APP_ID',
  apiKey: 'API_KEY',
  search: async (requests: unknown[]) => {
    return {
      results: requests.map(() => {
        return {
          hits: [],
          nbHits: 0,
          page: 0,
          nbPages: 0,
          hitsPerPage: 20,
          processingTimeMS: 1,
          query: '',
          params: '',
          exhaustiveNbHits: true,
        }
      }),
    }
  },
}

// Search tool output padded to a realistic Agent Studio payload size.
const createHits = (descriptionLength: number) =>
  Array.from({ length: 20 }, (_, index) => {
    return {
      objectID: `sneaker-${index}`,
      name: `Sneaker ${index}`,
      description: 'x'.repeat(descriptionLength),
    }
  })

const createAnswerChunks = (descriptionLength: number) => [
  { type: 'start', messageId: 'assistant-image' },
  { type: 'start-step' },
  {
    type: 'tool-input-available',
    toolCallId: 'search-1',
    toolName: 'algolia_search_index',
    input: { query: 'red leather sneaker' },
  },
  {
    type: 'tool-output-available',
    toolCallId: 'search-1',
    output: { hits: createHits(descriptionLength), nbHits: 20 },
  },
  { type: 'finish-step' },
  { type: 'start-step' },
  { type: 'text-start', id: 'text-1' },
  { type: 'text-delta', id: 'text-1', delta: ANSWER },
  { type: 'text-end', id: 'text-1' },
]

const FINISH_CHUNKS = [
  { type: 'data-suggestions', data: { suggestions: ['Show cheaper options'] } },
  { type: 'finish-step' },
  { type: 'finish' },
]

const toSse = (chunks: unknown[]): string =>
  chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join('')

const createResponse = (body: BodyInit) =>
  new Response(body, { headers: { 'content-type': 'text/event-stream' } })

const answerResponse = async () =>
  createResponse(
    toSse([...createAnswerChunks(100), ...FINISH_CHUNKS]) + 'data: [DONE]\n\n',
  )

const renderWidget = () => {
  const store = createTestStore((s) => {
    s.set(
      activeConfigAtom,
      createMockConfig({
        features: { agentStudio: { chatWidgetAgentID: AGENT_ID } },
      }),
    )
    s.set(chatWidgetEnabledAtom, true)
  })
  demoOptionsStore.set(chatWidgetEnabledAtom, true)

  return render(
    <InstantSearch searchClient={SEARCH_CLIENT as never} indexName="products">
      <InstantSearchChatWidget />
    </InstantSearch>,
    { wrapper: buildProvidersWrapper({ store }).Wrapper },
  )
}

const sendImageTurn = async (container: HTMLElement) => {
  const input = await waitFor(() => {
    const fileInput =
      container.querySelector<HTMLInputElement>('input[type="file"]')
    if (!fileInput) throw new Error('The image upload input is missing')
    return fileInput
  })
  const file = new File(['image'], 'sneaker.png', { type: 'image/png' })
  await act(async () => {
    fireEvent.change(input, { target: { files: [file] } })
  })

  const sendButton = await screen.findByRole('button', {
    name: 'Send message',
  })
  await waitFor(() => expect(sendButton).toBeEnabled())
  await act(async () => {
    fireEvent.click(sendButton)
  })
}

// Each request replays history, so only the latest user message is the current turn.
const getLastUserTurnContext = (requestBody: unknown): unknown => {
  const body: unknown = JSON.parse(String(requestBody))
  const messages =
    isRecord(body) && Array.isArray(body.messages) ? body.messages : []
  const lastUser = messages.findLast(
    (message: unknown) => isRecord(message) && message.role === 'user',
  )
  return isRecord(lastUser) && isRecord(lastUser.metadata)
    ? lastUser.metadata.turnContext
    : undefined
}

const getUserTurnContexts = (requestBody: unknown): unknown[] => {
  const body: unknown = JSON.parse(String(requestBody))
  const messages =
    isRecord(body) && Array.isArray(body.messages) ? body.messages : []
  return messages
    .filter((message: unknown) => isRecord(message) && message.role === 'user')
    .map((message: unknown) =>
      isRecord(message) && isRecord(message.metadata)
        ? message.metadata.turnContext
        : undefined,
    )
}

const expectRestoredImageTurn = async () => {
  const image = screen.getByRole('img', { name: 'Uploaded image' })
  expect(image).toHaveAttribute('src', THUMBNAIL_URL)
  expect(await screen.findByText(ANSWER)).toBeInTheDocument()
}

describe('InstantSearchChatWidget image turn', () => {
  let fetchMock = vi.spyOn(globalThis, 'fetch')

  beforeEach(() => {
    sessionStorage.clear()
    sessionStorage.setItem('instantsearch-chat-open-chat', 'true')
    fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(answerResponse)
    Element.prototype.scrollTo = () => {}
  })

  afterEach(() => {
    fetchMock.mockRestore()
    sessionStorage.clear()
  })

  it('renders the queued turn exactly like the sent turn', async () => {
    let resolveAnalysis: (analysis: string) => void = () => {}
    analyzeImage.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveAnalysis = resolve
        }),
    )
    const { container } = renderWidget()
    await sendImageTurn(container)

    const queuedTurn = await waitFor(() => {
      const turn = container.querySelector(
        '.sw-ChatWidget-queuedTurn .ais-ChatMessage[data-role="user"]',
      )
      if (!turn) throw new Error('The queued turn is missing')
      return turn.cloneNode(true)
    })
    await act(async () => {
      resolveAnalysis('red leather sneaker')
    })

    const sentTurn = await waitFor(() => {
      const turn = container.querySelector(
        '.ais-ChatMessages-content > .ais-ChatMessage[data-role="user"]',
      )
      if (!turn) throw new Error('The sent turn is missing')
      return turn
    })
    expect(
      container.querySelector('.sw-ChatWidget-queuedTurn'),
    ).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Analyzing image')).not.toBeInTheDocument()
    expect(sentTurn.isEqualNode(queuedTurn)).toBe(true)
  })

  it('restores the image, its text and the answer after a reload', async () => {
    const { container, unmount } = renderWidget()
    await sendImageTurn(container)
    await screen.findByText(ANSWER)
    await waitFor(() =>
      expect(sessionStorage.getItem(STORAGE_KEY)).toContain(ANSWER),
    )
    expect(sessionStorage.getItem(STORAGE_KEY)).toContain('chatImage')
    expect(screen.queryByText(IMAGE_ONLY_MESSAGE)).not.toBeInTheDocument()

    const body = String(fetchMock.mock.calls[0][1]?.body)
    expect(body).toContain('MUST begin with exactly one of these sentences')
    expect(body).toContain(
      'No message with your image? Here’s what comes closest.',
    )
    expect(body).toContain(
      'No message with your image? I couldn’t find a close match.',
    )
    expect(body).not.toContain('Find a similar item.')
    expect(body).toContain('red leather sneaker')
    expect(body).not.toContain('data-chat-image')
    expect(body).not.toContain(THUMBNAIL_URL)

    unmount()
    renderWidget()

    await expectRestoredImageTurn()
    expect(screen.queryByText(IMAGE_ONLY_MESSAGE)).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('sends the analysis with the image turn and not with the follow-up turn', async () => {
    const { container } = renderWidget()
    await sendImageTurn(container)
    await screen.findByText(ANSWER)
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce())

    expect(getLastUserTurnContext(fetchMock.mock.calls[0][1]?.body)).toMatchObject(
      IMAGE_TURN_CONTEXT,
    )

    const textarea = screen.getByLabelText('Type your message')
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Show cheaper options' } })
    })
    const sendButton = screen.getByRole('button', { name: 'Send message' })
    await waitFor(() => expect(sendButton).toBeEnabled())
    await act(async () => {
      fireEvent.click(sendButton)
    })
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))

    const followUpContext = getLastUserTurnContext(
      fetchMock.mock.calls[1][1]?.body,
    )
    expect(followUpContext).toMatchObject({
      routeContext: expect.stringContaining('/ecommerce/search'),
    })
    expect(followUpContext).not.toHaveProperty('imageAnalysis')
    expect(followUpContext).not.toHaveProperty('imageInstruction')
    // The earlier image turn still replays its own context.
    expect(
      getUserTurnContexts(fetchMock.mock.calls[1][1]?.body)[0],
    ).toMatchObject(IMAGE_TURN_CONTEXT)
  })

  it('keeps the image turn context after a reload and on regenerate', async () => {
    const { container, unmount } = renderWidget()
    await sendImageTurn(container)
    await screen.findByText(ANSWER)
    await waitFor(() =>
      expect(sessionStorage.getItem(STORAGE_KEY)).toContain(ANSWER),
    )
    expect(sessionStorage.getItem(STORAGE_KEY)).toContain('imageInstruction')

    unmount()
    renderWidget()
    await expectRestoredImageTurn()

    const regenerate = await screen.findByRole('button', { name: 'Regenerate' })
    await act(async () => {
      fireEvent.click(regenerate)
    })
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))

    expect(getLastUserTurnContext(fetchMock.mock.calls[1][1]?.body)).toMatchObject(
      IMAGE_TURN_CONTEXT,
    )
  })

  it('shows an error and keeps the image without sending when analysis fails', async () => {
    analyzeImage.mockRejectedValueOnce(new Error('Image analysis failed'))
    const { container } = renderWidget()
    await sendImageTurn(container)

    expect(
      await screen.findByText('Could not analyze the image. Please try again.'),
    ).toBeVisible()
    expect(screen.getByAltText('Image ready to send')).toBeVisible()
    expect(
      container.querySelector('.sw-ChatWidget-queuedTurn'),
    ).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Analyzing image')).not.toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
