import type { B2BContentDocumentationHitValues } from '@/app/b2b-content/hitValues.types'

export const B2BDocumentationBody = ({
  doc,
}: {
  doc: B2BContentDocumentationHitValues
}) => {
  if (!doc.description) return null

  return (
    <p className="text-foreground/85 mt-8 text-[length:var(--article-body-font-size)] leading-relaxed">
      {doc.description}
    </p>
  )
}
