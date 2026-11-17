interface ImageUrlOptions {
  prefix?: string
}

export const buildImageUrl = (
  rawImage: string | null | undefined,
  options: ImageUrlOptions = {},
): string | null => {
  if (!rawImage) return null

  const prefix = options.prefix ?? ''

  return `${prefix}${rawImage}`
}
