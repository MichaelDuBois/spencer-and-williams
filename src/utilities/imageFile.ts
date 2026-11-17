export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024

export const IMAGE_IMPORT_ERRORS = {
  invalidType: 'Please choose an image file.',
  tooLarge: 'Image must be smaller than 10MB.',
  readFailed: 'Could not read the selected image.',
} as const

export const readFileAsBase64 = (
  file: File,
): Promise<{ base64Image: string; mediaType: string }> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error(IMAGE_IMPORT_ERRORS.readFailed))
        return
      }
      const [meta, base64Image] = result.split(',')
      const mediaType = meta.match(/data:([^;]+);base64/)?.[1] ?? file.type
      if (!base64Image) {
        reject(new Error(IMAGE_IMPORT_ERRORS.readFailed))
        return
      }
      resolve({ base64Image, mediaType })
    }
    reader.onerror = () => reject(new Error(IMAGE_IMPORT_ERRORS.readFailed))
    reader.readAsDataURL(file)
  })
