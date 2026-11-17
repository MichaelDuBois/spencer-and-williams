export type ContentPDPPillVariant = 'accent' | 'outline'

export type ContentPDPPill = {
  label: string
  variant: ContentPDPPillVariant
  icon?: React.ReactNode
}

const variantClass: Record<ContentPDPPillVariant, string> = {
  accent: 'bg-accent/10 text-accent',
  outline: 'border-border text-muted-foreground border',
}

interface ContentPDPPillsProps {
  pills: ContentPDPPill[]
}

export const ContentPDPPills = ({ pills }: ContentPDPPillsProps) => {
  if (pills.length === 0) return null

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {pills.map((pill) => (
        <span
          key={`${pill.variant}-${pill.label}`}
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${variantClass[pill.variant]}`}>
          {pill.icon}
          {pill.label}
        </span>
      ))}
    </div>
  )
}
