'use client'

import Link from 'next/link'

import { tabHref, tabLabel } from '@/app/b2b-content/_utils/tabUtils'
import type { B2BContentSearchTabKey } from '@/app/b2b-content/_utils/tabUtils'
import { B2B_CONTENT_INDEX_KEYS } from '@/app/b2b-content/types'
import { useHrefWithQueryString } from '@/hooks/useHrefWithQueryString'
import { cn } from '@/lib/utils'

const TAB_KEYS: B2BContentSearchTabKey[] = ['all', ...B2B_CONTENT_INDEX_KEYS]

interface SearchTabsProps {
  activeTab: B2BContentSearchTabKey
}

export const SearchTabs = ({ activeTab }: SearchTabsProps) => {
  const buildHref = useHrefWithQueryString()

  return (
    <nav aria-label="Search sections" className="border-border border-b">
      <div className="flex flex-wrap gap-4 sm:gap-6">
        {TAB_KEYS.map((key) => (
          <Link
            key={key}
            href={buildHref(tabHref(key))}
            aria-current={key === activeTab ? 'page' : undefined}
            className={cn(
              'border-b-2 px-1 py-3 text-sm font-medium transition-colors',
              key === activeTab
                ? 'border-accent text-foreground'
                : 'text-muted-foreground hover:text-foreground border-transparent',
            )}>
            {tabLabel(key)}
          </Link>
        ))}
      </div>
    </nav>
  )
}
