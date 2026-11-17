import { BookOpen, ExternalLink } from 'lucide-react'

import { DOCUMENTATION_LINKS } from '@/lib/documentation-links'

export const LandingFooter = () => (
  <footer className="mt-12 border-t border-slate-200 pt-6">
    <nav
      aria-label="Documentation"
      className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-600">
      <span className="inline-flex items-center gap-1.5">
        <BookOpen className="h-3.5 w-3.5" aria-hidden />
        Documentation
      </span>
      {DOCUMENTATION_LINKS.map(({ name, href }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-sm transition-colors hover:text-slate-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-600">
          {name}
          <ExternalLink className="h-3 w-3" aria-hidden />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      ))}
      <span className="text-slate-500">Algolia internal</span>
    </nav>
  </footer>
)
