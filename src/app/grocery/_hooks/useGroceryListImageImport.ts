'use client'

import { useMutation } from '@tanstack/react-query'
import { useCallback } from 'react'

import { extractGroceryListFromImage } from '@/app/grocery/_services/groceryImageService'
import {
  IMAGE_IMPORT_ERRORS,
  MAX_IMAGE_SIZE_BYTES,
  readFileAsBase64,
} from '@/utilities/imageFile'

// Re-exported for existing consumers/tests that reference them from this hook.
export { IMAGE_IMPORT_ERRORS, MAX_IMAGE_SIZE_BYTES }

interface UseGroceryListImageImportArgs {
  onImportSuccess: (items: string[]) => void
}

export const useGroceryListImageImport = ({
  onImportSuccess,
}: UseGroceryListImageImportArgs) => {
  const mutation = useMutation<string[], Error, File>({
    mutationFn: async (file: File) => {
      if (!file.type.startsWith('image/')) {
        throw new Error(IMAGE_IMPORT_ERRORS.invalidType)
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        throw new Error(IMAGE_IMPORT_ERRORS.tooLarge)
      }

      const { base64Image, mediaType } = await readFileAsBase64(file)
      return extractGroceryListFromImage({ base64Image, mediaType })
    },
    onSuccess: (items) => {
      onImportSuccess(items)
    },
  })

  const importImage = useCallback(
    (file: File) => {
      mutation.mutate(file)
    },
    [mutation],
  )

  return {
    importImage,
    reset: mutation.reset,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    importedItems: mutation.data ?? [],
    isEmpty: mutation.isSuccess && (mutation.data?.length ?? 0) === 0,
  }
}
