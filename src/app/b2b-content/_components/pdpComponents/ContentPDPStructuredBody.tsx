import type { B2BContentDataBlock } from '@/types/recordHit.types'
import { groupContentBlocks } from '@/utilities/groupContentBlocks'

interface ContentPDPStructuredBodyProps {
  blocks: B2BContentDataBlock[] | null | undefined
}

export const ContentPDPStructuredBody = ({
  blocks,
}: ContentPDPStructuredBodyProps) => {
  if (!blocks?.length) return null

  const groups = groupContentBlocks(blocks)

  return (
    <article className="text-foreground/85 mt-10 space-y-5 text-[length:var(--article-body-font-size)] leading-relaxed">
      {groups.map((group, index) => {
        if (group.type === 'heading') {
          return (
            <h3
              key={index}
              className="text-foreground mt-8 mb-2 text-xl leading-tight font-semibold">
              {group.text}
            </h3>
          )
        }

        if (group.type === 'list') {
          return (
            <ul key={index} className="list-disc space-y-2 pl-6">
              {group.items.map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
          )
        }

        return (
          <p key={index} className="my-4">
            {group.text}
          </p>
        )
      })}
    </article>
  )
}
