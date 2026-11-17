import { fireEvent, render, waitFor } from '@testing-library/react'
import { type ComponentProps, useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ChatPrompt } from '@/features/chatWidget/components/ChatPrompt'
import {
  ChatWidgetImageSubmissionContext,
  type ChatWidgetImageSubmission,
} from '@/features/chatWidget/components/chatWidgetImageSubmissionContext'

class MockFileReader {
  result = 'data:image/png;base64,QUJD'
  onload: (() => void) | null = null

  readAsDataURL() {
    this.onload?.()
  }
}

const imageFile = { type: 'image/png', size: 2048 } as File

type SubmitImage = (image: ChatWidgetImageSubmission) => Promise<void>

const renderWithImageSubmission = (
  submitImage: SubmitImage,
  props: ComponentProps<typeof ChatPrompt> = {},
) =>
  render(
    <ChatWidgetImageSubmissionContext.Provider value={{ submitImage }}>
      <ChatPrompt {...props} />
    </ChatWidgetImageSubmissionContext.Provider>,
  )

const attachImage = async (
  container: HTMLElement,
  findPreview: () => HTMLElement,
) => {
  const fileInput = container.querySelector('input[type="file"]')
  if (!fileInput) throw new Error('Missing image input')
  fireEvent.change(fileInput, { target: { files: [imageFile] } })
  await waitFor(() => expect(findPreview()).toBeVisible())
}

describe('ChatPrompt', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('forwards text changes to the Chat state handler', () => {
    let receivedValue = ''
    const onInput = vi.fn((event: InputEvent) => {
      receivedValue = (event.currentTarget as HTMLTextAreaElement).value
    })
    const { getByLabelText } = render(<ChatPrompt onInput={onInput} />)

    fireEvent.change(getByLabelText('Type your message'), {
      target: { value: 'Find a black sofa' },
    })

    expect(onInput).toHaveBeenCalledOnce()
    expect(receivedValue).toBe('Find a black sofa')
  })

  it('uses matching compact action widths and vertically centered input text', () => {
    const { getByLabelText } = render(<ChatPrompt />)

    expect(getByLabelText('Upload an image')).toHaveClass('w-10')
    expect(getByLabelText('Type your message')).toHaveClass(
      'h-8',
      'leading-5',
    )
  })

  it('caps the image preview width so it does not span a fullscreen prompt', async () => {
    vi.stubGlobal('FileReader', MockFileReader)
    const { container, getByText } = render(<ChatPrompt />)

    await attachImage(container, () => getByText('Image ready to send'))

    expect(
      container.querySelector('[alt="Image ready to send"]')?.closest('.mb-3'),
    ).toHaveClass('max-w-sm')
  })

  it('submits the current message from the Send button or Enter', () => {
    const onSubmit = vi.fn()
    const { getByLabelText } = render(
      <ChatPrompt value="Find a black sofa" onSubmit={onSubmit} />,
    )

    fireEvent.click(getByLabelText('Send message'))
    fireEvent.keyDown(getByLabelText('Type your message'), { key: 'Enter' })

    expect(onSubmit).toHaveBeenCalledTimes(2)
  })

  it('allows a newline with Shift+Enter', () => {
    const onSubmit = vi.fn()
    const { getByLabelText } = render(
      <ChatPrompt value="Find a black sofa" onSubmit={onSubmit} />,
    )

    fireEvent.keyDown(getByLabelText('Type your message'), {
      key: 'Enter',
      shiftKey: true,
    })

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('uses the same control to stop an active response', () => {
    const onStop = vi.fn()
    const { getByLabelText } = render(
      <ChatPrompt status="streaming" onStop={onStop} />,
    )

    fireEvent.click(getByLabelText('Stop response'))

    expect(onStop).toHaveBeenCalledOnce()
  })

  it('submits an analyzed image with the visible prompt', async () => {
    vi.stubGlobal('FileReader', MockFileReader)
    const submitImage = vi.fn<SubmitImage>().mockResolvedValue(undefined)
    const onSubmit = vi.fn()
    const onInput = vi.fn()
    const { container, getByLabelText, getByText } = renderWithImageSubmission(
      submitImage,
      { value: 'Find something like this', onInput, onSubmit },
    )

    await attachImage(container, () => getByText('Image ready to send'))
    expect(
      getByText('Add a question about this image or send as is.'),
    ).toBeVisible()
    fireEvent.click(getByLabelText('Send message'))

    await waitFor(() =>
      expect(submitImage).toHaveBeenCalledExactlyOnceWith({
        kind: 'captioned',
        text: 'Find something like this',
        base64Image: 'QUJD',
        mediaType: 'image/png',
      }),
    )
    await waitFor(() =>
      expect(container.querySelector('[alt="Image ready to send"]')).toBeNull(),
    )
    expect(onSubmit).not.toHaveBeenCalled()
    expect(onInput).toHaveBeenCalledWith({ currentTarget: { value: '' } })
  })

  it('marks a submission without prompt text as image-only', async () => {
    vi.stubGlobal('FileReader', MockFileReader)
    const submitImage = vi.fn<SubmitImage>().mockResolvedValue(undefined)
    const onSubmit = vi.fn()
    const ControlledPrompt = () => {
      const [value, setValue] = useState('')

      return (
        <ChatPrompt
          value={value}
          onInput={(event) =>
            setValue((event.currentTarget as HTMLTextAreaElement).value)
          }
          onSubmit={onSubmit}
        />
      )
    }
    const { container, getByLabelText } = render(
      <ChatWidgetImageSubmissionContext.Provider value={{ submitImage }}>
        <ControlledPrompt />
      </ChatWidgetImageSubmissionContext.Provider>,
    )
    await attachImage(container, () => getByLabelText('Send message'))
    await waitFor(() =>
      expect(getByLabelText('Send message')).not.toBeDisabled(),
    )
    fireEvent.click(getByLabelText('Send message'))

    await waitFor(() =>
      expect(submitImage).toHaveBeenCalledWith({
        kind: 'image-only',
        base64Image: 'QUJD',
        mediaType: 'image/png',
      }),
    )
    await waitFor(() =>
      expect(container.querySelector('[alt="Image ready to send"]')).toBeNull(),
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('keeps an uploaded image when analysis fails', async () => {
    vi.stubGlobal('FileReader', MockFileReader)
    const submitImage = vi
      .fn<SubmitImage>()
      .mockRejectedValue(new Error('Image analysis did not return a result'))
    const onSubmit = vi.fn()
    const onInput = vi.fn()
    const { container, getByLabelText, getByText } = renderWithImageSubmission(
      submitImage,
      { value: 'Find this', onInput, onSubmit },
    )

    await attachImage(container, () => getByText('Image ready to send'))
    fireEvent.click(getByLabelText('Send message'))

    await waitFor(() =>
      expect(
        getByText('Could not analyze the image. Please try again.'),
      ).toBeVisible(),
    )
    expect(container.querySelector('[alt="Image ready to send"]')).toBeVisible()
    expect(getByLabelText('Type your message')).toBeEnabled()
    expect(getByLabelText('Send message')).toBeEnabled()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(onInput).not.toHaveBeenCalled()
  })

  it('clears the analysis error when a retry succeeds', async () => {
    vi.stubGlobal('FileReader', MockFileReader)
    const submitImage = vi
      .fn<SubmitImage>()
      .mockRejectedValueOnce(new Error('Image analysis failed'))
      .mockResolvedValueOnce(undefined)
    const { container, getByLabelText, getByText, queryByText } =
      renderWithImageSubmission(submitImage)

    await attachImage(container, () => getByText('Image ready to send'))
    fireEvent.click(getByLabelText('Send message'))
    await waitFor(() =>
      expect(
        getByText('Could not analyze the image. Please try again.'),
      ).toBeVisible(),
    )

    fireEvent.keyDown(getByLabelText('Type your message'), { key: 'Enter' })

    await waitFor(() =>
      expect(container.querySelector('[alt="Image ready to send"]')).toBeNull(),
    )
    expect(submitImage).toHaveBeenCalledTimes(2)
    expect(
      queryByText('Could not analyze the image. Please try again.'),
    ).toBeNull()
  })

  it('keeps the image and sends nothing without an image submission provider', async () => {
    vi.stubGlobal('FileReader', MockFileReader)
    const onSubmit = vi.fn()
    const { container, getByLabelText, getByText } = render(
      <ChatPrompt value="Find this" onSubmit={onSubmit} />,
    )

    await attachImage(container, () => getByText('Image ready to send'))
    fireEvent.click(getByLabelText('Send message'))

    expect(container.querySelector('[alt="Image ready to send"]')).toBeVisible()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('hides the preview while image analysis is in progress', async () => {
    vi.stubGlobal('FileReader', MockFileReader)
    let resolveAnalysis: () => void = () => {}
    const submitImage = vi.fn<SubmitImage>(
      () =>
        new Promise<void>((resolve) => {
          resolveAnalysis = resolve
        }),
    )
    const onSubmit = vi.fn()
    const { container, getByLabelText, getByText } = renderWithImageSubmission(
      submitImage,
      { value: 'Find something similar', onSubmit },
    )

    await attachImage(container, () => getByText('Image ready to send'))
    fireEvent.click(getByLabelText('Send message'))

    await waitFor(() =>
      expect(container.querySelector('[alt="Image ready to send"]')).toBeNull(),
    )
    expect(getByLabelText('Analyzing image').querySelector('svg')).toHaveClass(
      'lucide-square',
    )

    resolveAnalysis()
    await waitFor(() => expect(getByLabelText('Send message')).toBeVisible())
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
