import { invokeEdgeFunction } from '@/services/invokeEdgeFunction'

export interface ExtractGroceryListParams {
  base64Image: string
  mediaType: string
}

/**
 * Thin client wrapper around the grocery-list extraction endpoint — a Supabase
 * Edge Function (`extract-grocery-list`) that holds the OpenAI key server-side
 * and returns `{ groceryList: string[] }`. This is the single swap seam: only
 * this file knows where the vision logic lives; the hook, button, validation,
 * and state layer stay untouched.
 */
export const extractGroceryListFromImage = async ({
  base64Image,
  mediaType,
}: ExtractGroceryListParams): Promise<string[]> => {
  const data = await invokeEdgeFunction<{ groceryList?: string[] }>(
    'extract-grocery-list',
    { base64Image, mediaType },
    'Failed to extract grocery list from image',
  )

  return data?.groceryList ?? []
}
