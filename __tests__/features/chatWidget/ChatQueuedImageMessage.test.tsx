import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { IMAGE_ONLY_MESSAGE } from '@/features/aiAssistant/constants'
import { ChatQueuedImageMessage } from '@/features/chatWidget/components/ChatQueuedImageMessage'
import { ChatWidgetQueuedImageContext } from '@/features/chatWidget/components/chatWidgetImageSubmissionContext'

const IMAGE_URL = 'data:image/jpeg;base64,QUJD'

describe('ChatQueuedImageMessage', () => {
  it('portals a queued image turn and native-style loader into the transcript', async () => {
    const { container } = render(
      <div className="sw-ChatWidget">
        <div className="ais-ChatMessages-content" />
        <ChatWidgetQueuedImageContext.Provider
          value={{ text: 'Find this', isImageOnly: false, imageUrl: IMAGE_URL }}>
          <ChatQueuedImageMessage />
        </ChatWidgetQueuedImageContext.Provider>
      </div>,
    )

    expect(await screen.findByText('Find this')).toBeVisible()

    const transcript = container.querySelector('.ais-ChatMessages-content')
    expect(transcript?.querySelector('[aria-label="Analyzing image"]')).toHaveClass(
      'ais-ChatMessageLoader',
    )
    expect(
      transcript?.querySelector('.ais-ChatMessageLoader-spinner'),
    ).toBeInTheDocument()
    expect(transcript?.querySelectorAll('[role="status"]')).toHaveLength(1)
  })

  it('shows the attached image above the queued text', async () => {
    render(
      <div className="sw-ChatWidget">
        <div className="ais-ChatMessages-content" />
        <ChatWidgetQueuedImageContext.Provider
          value={{ text: 'Find this', isImageOnly: false, imageUrl: IMAGE_URL }}>
          <ChatQueuedImageMessage />
        </ChatWidgetQueuedImageContext.Provider>
      </div>,
    )

    const image = await screen.findByRole('img', { name: 'Uploaded image' })
    const imageWrapper = image.parentElement
    const text = screen.getByText('Find this')
    expect(image).toHaveAttribute('src', IMAGE_URL)
    expect(imageWrapper).toHaveClass('sw-ChatWidget-userImage')
    expect(image.closest('.ais-ChatMessage-message')?.firstChild).toBe(
      imageWrapper,
    )
    expect(imageWrapper?.nextSibling).toBe(text)
    expect(text).toHaveClass('ais-ChatMessage-text', 'sw-ChatWidget-userImageText')
    expect(image.closest('.ais-ChatMessage')).toHaveAttribute('data-role', 'user')
  })

  it('does not show an empty text bubble for an image-only turn', async () => {
    const { container } = render(
      <div className="sw-ChatWidget">
        <div className="ais-ChatMessages-content" />
        <ChatWidgetQueuedImageContext.Provider
          value={{
            text: IMAGE_ONLY_MESSAGE,
            isImageOnly: true,
            imageUrl: IMAGE_URL,
          }}>
          <ChatQueuedImageMessage />
        </ChatWidgetQueuedImageContext.Provider>
      </div>,
    )

    expect(await screen.findByRole('img', { name: 'Uploaded image' })).toBeVisible()
    expect(container.querySelector('.ais-ChatMessage-text')).toBeNull()
  })

  it('waits for the thumbnail before adding the turn', () => {
    const { container } = render(
      <div className="sw-ChatWidget">
        <div className="ais-ChatMessages-content" />
        <ChatWidgetQueuedImageContext.Provider
          value={{ text: 'Find this', isImageOnly: false, imageUrl: null }}>
          <ChatQueuedImageMessage />
        </ChatWidgetQueuedImageContext.Provider>
      </div>,
    )

    expect(
      container.querySelector('.ais-ChatMessages-content'),
    ).toBeEmptyDOMElement()
  })

  it('does not add a turn when no image is queued', () => {
    const { container } = render(
      <div className="sw-ChatWidget">
        <div className="ais-ChatMessages-content" />
        <ChatWidgetQueuedImageContext.Provider value={null}>
          <ChatQueuedImageMessage />
        </ChatWidgetQueuedImageContext.Provider>
      </div>,
    )

    expect(
      container.querySelector('.ais-ChatMessages-content'),
    ).toBeEmptyDOMElement()
  })

  it('moves the queued turn when InstantSearch replaces the transcript', async () => {
    const { container } = render(
      <div className="sw-ChatWidget">
        <div className="ais-ChatMessages-content" />
        <ChatWidgetQueuedImageContext.Provider
          value={{
            text: 'Find a lamp.',
            isImageOnly: false,
            imageUrl: IMAGE_URL,
          }}>
          <ChatQueuedImageMessage />
        </ChatWidgetQueuedImageContext.Provider>
      </div>,
    )

    await screen.findByText('Find a lamp.')
    const oldTranscript = container.querySelector('.ais-ChatMessages-content')
    const newTranscript = document.createElement('div')
    newTranscript.className = 'ais-ChatMessages-content'
    oldTranscript?.replaceWith(newTranscript)

    await screen.findByText('Find a lamp.')
    expect(newTranscript).toContainElement(screen.getByText('Find a lamp.'))
  })

  it('targets the fresh transcript when it was replaced before an image queued', async () => {
    const renderWidget = (
      queuedImage: {
        text: string
        isImageOnly: boolean
        imageUrl: string
      } | null,
    ) => (
      <div className="sw-ChatWidget">
        <div className="ais-ChatMessages-content" />
        <ChatWidgetQueuedImageContext.Provider value={queuedImage}>
          <ChatQueuedImageMessage />
        </ChatWidgetQueuedImageContext.Provider>
      </div>
    )
    const { container, rerender } = render(renderWidget(null))

    const oldTranscript = container.querySelector('.ais-ChatMessages-content')
    const newTranscript = document.createElement('div')
    newTranscript.className = 'ais-ChatMessages-content'
    oldTranscript?.replaceWith(newTranscript)

    rerender(
      renderWidget({
        text: 'Find a chair.',
        isImageOnly: false,
        imageUrl: IMAGE_URL,
      }),
    )

    expect(await screen.findByText('Find a chair.')).toBeVisible()
    expect(newTranscript).toContainElement(screen.getByText('Find a chair.'))
  })
})
