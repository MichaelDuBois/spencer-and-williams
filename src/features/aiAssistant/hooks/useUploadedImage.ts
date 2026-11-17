'use client'

import { useCallback, useState } from 'react'

import {
  IMAGE_IMPORT_ERRORS,
  MAX_IMAGE_SIZE_BYTES,
  readFileAsBase64,
} from '@/utilities/imageFile'

export interface UploadedImage {
  /** Data URL used both for the preview banner and the transcript thumbnail. */
  dataUrl: string
  /** Raw payload forwarded to the vision endpoint on send. */
  base64Image: string
  mediaType: string
}

/**
 * Holds an image the user selected for a deferred send: validates it (image,
 * within the shared size cap), reads it to base64, and keeps it until the user
 * submits or clears it.
 * Selecting a file never sends anything — the caller reads `uploaded` on submit.
 */
export const useUploadedImage = () => {
  const [uploaded, setUploaded] = useState<UploadedImage | null>(null)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = useCallback(async (file: File) => {
    setError(null)
    setUploaded(null)

    if (!file.type.startsWith('image/')) {
      setError(IMAGE_IMPORT_ERRORS.invalidType)
      return
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError(IMAGE_IMPORT_ERRORS.tooLarge)
      return
    }

    try {
      const { base64Image, mediaType } = await readFileAsBase64(file)
      setUploaded({
        dataUrl: `data:${mediaType};base64,${base64Image}`,
        base64Image,
        mediaType,
      })
    } catch {
      setError(IMAGE_IMPORT_ERRORS.readFailed)
    }
  }, [])

  const clear = useCallback(() => {
    setUploaded(null)
    setError(null)
  }, [])

  return { uploaded, error, uploadFile, clear }
}
