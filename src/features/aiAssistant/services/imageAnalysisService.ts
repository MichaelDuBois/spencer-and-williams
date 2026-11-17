import { invokeEdgeFunction } from '@/services/invokeEdgeFunction'

export interface AnalyzeImageParams {
  base64Image: string
  mediaType: string
}

export const analyzeImage = async ({
  base64Image,
  mediaType,
}: AnalyzeImageParams): Promise<string> => {
  const data = await invokeEdgeFunction<{ analysis?: string }>(
    'analyze-image',
    { base64Image, mediaType },
    'Failed to analyze image',
  )

  return data?.analysis ?? ''
}
