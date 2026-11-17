import { IMAGE_ONLY_RESPONSE_INSTRUCTION } from '@/features/aiAssistant/constants'
import type { ChatMessage } from '@/features/aiAssistant/types'

export interface ImageContext {
  /** Observations from the vision endpoint, prefixed with `Image Analysis:`. */
  imageAnalysis: string
  /** Response guidance, kept apart from the observations. */
  imageInstruction?: string
}

/** Formats an image analysis as hidden agent context, or null when it is empty. */
export const buildImageContext = (
  analysis: string,
  isImageOnly: boolean,
): ImageContext | null => {
  const observations = analysis.trim()
  if (!observations) return null

  return {
    imageAnalysis: `Image Analysis:\n${observations}`,
    ...(isImageOnly
      ? { imageInstruction: IMAGE_ONLY_RESPONSE_INSTRUCTION }
      : {}),
  }
}

/** Lists the context entries in request order (observations, then guidance). */
export const getImageContextTexts = (context: ImageContext): string[] =>
  context.imageInstruction
    ? [context.imageAnalysis, context.imageInstruction]
    : [context.imageAnalysis]

/** Replaces a message's hidden image context parts, which are sent but never rendered. */
export const withImageContextParts = (
  message: ChatMessage,
  texts: string[],
): ChatMessage => {
  return {
    ...message,
    parts: [
      ...message.parts.filter((part) => part.type !== 'image_context'),
      ...texts.map((text) => {
        return { type: 'image_context' as const, text }
      }),
    ],
  }
}
