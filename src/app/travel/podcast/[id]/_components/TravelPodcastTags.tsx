import { formatDisplayLabel } from '@/app/travel/_utils/travelContentFormatters'

export const TravelPodcastTags = ({ tags }: { tags: string[] }) => {
  if (tags.length === 0) {
    return null
  }

  return (
    <div className="mt-8 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="border-border bg-background text-foreground/85 rounded-badge inline-flex border px-3 py-1.5 text-xs tracking-[0.16em] uppercase">
          {formatDisplayLabel(tag)}
        </span>
      ))}
    </div>
  )
}
