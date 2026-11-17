import { ExternalLink } from 'lucide-react'

import { AccentIconTile } from '@/components/AccentIconTile'
import { AEM_DEMOS, AEM_DEMOS_HEADING } from '@/verticals/aem-demos'

interface DemoBarAemDemosProps {
  onNavigate: () => void
}

export const DemoBarAemDemos = ({ onNavigate }: DemoBarAemDemosProps) => (
  <section
    aria-labelledby="demo-menu-aem-heading"
    className="mt-6 border-t border-slate-200 pt-6">
    <h2
      id="demo-menu-aem-heading"
      className="mb-4 text-lg font-semibold tracking-tight text-slate-900">
      {AEM_DEMOS_HEADING}
    </h2>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {AEM_DEMOS.map(({ name, href, icon, accentColor }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
          style={{ borderColor: accentColor }}
          className="group flex items-center gap-3 rounded-xl border bg-white p-4 transition-all hover:-translate-y-1 hover:shadow-lg">
          <AccentIconTile icon={icon} accentColor={accentColor} />
          <h3 className="text-sm font-semibold text-slate-900">{name}</h3>
          <ExternalLink
            className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-400"
            aria-hidden
          />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      ))}
    </div>
  </section>
)
