import type { ContentDataBlock } from '@/types/recordHit.types'
import { groupContentBlocks } from '@/utilities/groupContentBlocks'

export const FashionArticleBody = ({
  blocks,
}: {
  blocks: ContentDataBlock[] | null | undefined
}) => {
  if (!blocks?.length) return null

  const groups = groupContentBlocks(blocks)

  return (
    <article className="mx-auto mt-12 max-w-2xl">
      {groups.map((group, index) => {
        if (group.type === 'heading') {
          return (
            <h2
              key={index}
              className="font-secondary mt-14 text-xl leading-snug capitalize first:mt-0 md:text-2xl">
              {group.text}
            </h2>
          )
        }

        if (group.type === 'list') {
          return (
            <ul
              key={index}
              className="text-foreground/80 mt-6 list-disc space-y-3 pl-6 text-[length:var(--article-body-font-size)] leading-relaxed">
              {group.items.map((item, itemIndex) => (
                <li key={itemIndex} className="pl-1">
                  {item}
                </li>
              ))}
            </ul>
          )
        }

        return (
          <p
            key={index}
            className="text-foreground/80 mt-6 text-[length:var(--article-body-font-size)] leading-loose">
            {group.text}
          </p>
        )
      })}
    </article>
  )
}
