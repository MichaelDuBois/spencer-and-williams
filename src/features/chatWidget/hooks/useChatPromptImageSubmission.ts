'use client'

import { useContext, useState } from 'react'

import {
  type UploadedImage,
  useUploadedImage,
} from '@/features/aiAssistant/hooks/useUploadedImage'
import { ChatWidgetImageSubmissionContext } from '@/features/chatWidget/components/chatWidgetImageSubmissionContext'

interface UseChatPromptImageSubmissionOptions {
  value: string
  onInput?: (event: InputEvent) => void
}

interface ChatPromptImageSubmission {
  uploaded: UploadedImage | null
  uploadError: string | null
  analysisError: string | null
  isAnalyzingImage: boolean
  uploadFile: (file: File) => Promise<void>
  clear: () => void
  submitUploadedImage: () => Promise<void>
}

const EMPTY_INPUT_EVENT = {
  currentTarget: { value: '' },
} as unknown as InputEvent

/** Holds the prompt's attached image and sends it through the widget's image submission. */
export const useChatPromptImageSubmission = ({
  value,
  onInput,
}: UseChatPromptImageSubmissionOptions): ChatPromptImageSubmission => {
  const imageSubmission = useContext(ChatWidgetImageSubmissionContext)
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const { uploaded, error: uploadError, uploadFile, clear } = useUploadedImage()

  const submitUploadedImage = async (): Promise<void> => {
    const imageSubmit = imageSubmission?.submitImage
    if (!uploaded || !imageSubmit) return

    const text = value.trim()
    setAnalysisError(null)
    setIsAnalyzingImage(true)
    try {
      await imageSubmit({
        ...(text ? { kind: 'captioned', text } : { kind: 'image-only' }),
        base64Image: uploaded.base64Image,
        mediaType: uploaded.mediaType,
      })

      clear()
      // The widget sent the turn itself, so empty the Chat input it left behind.
      if (value) onInput?.(EMPTY_INPUT_EVENT)
    } catch {
      setAnalysisError('Could not analyze the image. Please try again.')
    } finally {
      setIsAnalyzingImage(false)
    }
  }

  return {
    uploaded,
    uploadError,
    analysisError,
    isAnalyzingImage,
    uploadFile,
    clear,
    submitUploadedImage,
  }
}
