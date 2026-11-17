const THUMBNAIL_MAX_SIZE = 400
const THUMBNAIL_QUALITY = 0.75
const THUMBNAIL_BACKGROUND = '#ffffff'

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new window.Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not load the image'))
    image.src = src
  })

/** Downscales an image data URL to a small JPEG that fits in the persisted chat history. */
export const createImageThumbnail = async (
  dataUrl: string,
  maxSize = THUMBNAIL_MAX_SIZE,
): Promise<string> => {
  const image = await loadImage(dataUrl)
  const width = image.naturalWidth
  const height = image.naturalHeight
  if (!width || !height) throw new Error('Image has no dimensions')

  const scale = Math.min(1, maxSize / Math.max(width, height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width * scale))
  canvas.height = Math.max(1, Math.round(height * scale))

  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas is not available')

  // JPEG has no alpha, so transparent pixels would otherwise turn black.
  context.fillStyle = THUMBNAIL_BACKGROUND
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  const thumbnail = canvas.toDataURL('image/jpeg', THUMBNAIL_QUALITY)
  if (!thumbnail.startsWith('data:image/')) {
    throw new Error('Could not encode the thumbnail')
  }
  return thumbnail
}
