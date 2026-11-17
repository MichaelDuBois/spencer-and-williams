import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export interface TravelStatItem {
  icon: LucideIcon
  heading: string
  value: ReactNode
}

interface TravelStatsPanelProps {
  items: TravelStatItem[]
}

const TravelStat = ({ icon: Icon, heading, value }: TravelStatItem) => (
  <div className="flex gap-3 py-4 first:pt-2 last:pb-0">
    <div className="bg-accent/12 text-accent rounded-badge flex h-8 w-8 shrink-0 items-center justify-center">
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0">
      <p className="text-muted-foreground text-micro tracking-[0.2em] uppercase">
        {heading}
      </p>
      <div className="text-foreground mt-1 text-[0.95rem] leading-5">
        {value}
      </div>
    </div>
  </div>
)

export const TravelStatsPanel = ({ items }: TravelStatsPanelProps) => (
  <aside className="border-border bg-secondary/85 shadow-accent/10 rounded-2xl border px-3.5 py-3 shadow-xl">
    <div className="divide-border/70 flex flex-col divide-y">
      {items.map((item) => (
        <TravelStat key={item.heading} {...item} />
      ))}
    </div>
  </aside>
)
