import type { ContentDataBlock } from '@/types/recordHit.types'

export type ContentRenderGroup =
  | { type: 'text'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'list'; items: string[] }

/**
 * Collapses a flat block list into render groups, preserving record order.
 * A fashion `list` block already holds a whole section's bullets, while B2B
 * content emits one bullet per block — flattening both and merging runs of
 * consecutive list blocks gives one list group per run either way.
 */
export const groupContentBlocks = (
  blocks: ContentDataBlock[],
): ContentRenderGroup[] => {
  const groups: ContentRenderGroup[] = []

  for (const block of blocks) {
    if (block.type === 'list') {
      const items = Array.isArray(block.text) ? block.text : [block.text]
      const last = groups[groups.length - 1]
      if (last && last.type === 'list') {
        last.items.push(...items)
      } else {
        groups.push({ type: 'list', items: [...items] })
      }
    } else if (block.type === 'heading') {
      groups.push({ type: 'heading', text: block.text })
    } else {
      groups.push({ type: 'text', text: block.text })
    }
  }

  return groups
}
