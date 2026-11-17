import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Message } from '@/features/aiAssistant/components/Message'
import type { ChatMessage } from '@/features/aiAssistant/types'

const IMAGE_URL = 'data:image/png;base64,QUJD'

const userImageMessage: ChatMessage = {
  id: 'm1',
  role: 'user',
  parts: [
    { type: 'image', imageUrl: IMAGE_URL },
    { type: 'text', text: 'Find products similar to this image.' },
  ],
  createdAt: new Date(0),
}

describe('Message — image part', () => {
  it('renders the uploaded image thumbnail above the text', () => {
    const { container, getByText } = render(<Message message={userImageMessage} />)

    expect(
      container.querySelector(`img[src="${IMAGE_URL}"]`),
    ).toBeInTheDocument()
    expect(getByText('Find products similar to this image.')).toBeInTheDocument()
  })

  it('does not force the caption into the thumbnail width', () => {
    const { getByText } = render(<Message message={userImageMessage} />)

    expect(
      getByText('Find products similar to this image.').closest('.w-48'),
    ).toBeNull()
  })

  it('does not render hidden image context', () => {
    const message: ChatMessage = {
      ...userImageMessage,
      parts: [
        ...userImageMessage.parts,
        { type: 'image_context', text: 'Image Analysis:\nred sneaker' },
      ],
    }
    const { queryByText } = render(<Message message={message} />)

    expect(queryByText(/Image Analysis:/)).not.toBeInTheDocument()
  })

  it('renders nothing for an image part without a url', () => {
    const message: ChatMessage = {
      id: 'm2',
      role: 'user',
      parts: [{ type: 'image' }],
      createdAt: new Date(0),
    }
    const { container } = render(<Message message={message} />)
    expect(container.querySelector('img')).not.toBeInTheDocument()
  })
})
