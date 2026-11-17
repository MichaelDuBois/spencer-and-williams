'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import { BarChart3, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import {
  trackPersonaSelected,
  trackPersonalizationModeChange,
} from '@/lib/analytics/personalization-events'
import { cn } from '@/lib/utils'
import {
  activePersonaAtom,
  personalizationStore,
  realtimePersoEnabledAtom,
  realtimeSessionTokenAtom,
  setPersonaModeAtom,
  setRealtimeModeAtom,
} from '@/stores/personalization'
import type { SelectableProfile } from '@/types'

interface PersonaSwitcherProps {
  basePath: string
}

export const PersonaSwitcher = ({ basePath }: PersonaSwitcherProps) => {
  const config = useActiveConfig()
  const activePersona = useAtomValue(activePersonaAtom, {
    store: personalizationStore,
  })
  const realtimeEnabled = useAtomValue(realtimePersoEnabledAtom, {
    store: personalizationStore,
  })
  const realtimeToken = useAtomValue(realtimeSessionTokenAtom, {
    store: personalizationStore,
  })
  const setPersonaMode = useSetAtom(setPersonaModeAtom, {
    store: personalizationStore,
  })
  const setRealtimeMode = useSetAtom(setRealtimeModeAtom, {
    store: personalizationStore,
  })
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const personalizationEnabled = config?.features?.personalization?.enabled
  const personas = config?.features?.personalization?.personas ?? []
  const isOnAffinitiesPage = /\/affinities\//.test(pathname)

  if (!personalizationEnabled) {
    return (
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground p-2 transition-colors"
        aria-label="Account">
        <User className="h-5 w-5" />
      </button>
    )
  }

  const selectPersona = (persona: SelectableProfile | null) => {
    trackPersonalizationModeChange(() => setPersonaMode(persona))
    if (persona) trackPersonaSelected(persona)
    setIsOpen(false)
  }

  const handleSelectPersona = (persona: SelectableProfile | null) => {
    selectPersona(persona)
    if (isOnAffinitiesPage) {
      router.push(
        persona && persona.type !== 'customerGroup'
          ? `${basePath}/affinities/${persona.token}`
          : `${basePath}/search`,
      )
    }
  }

  const handleSelectRealtime = () => {
    trackPersonalizationModeChange(setRealtimeMode)
    setIsOpen(false)
    if (isOnAffinitiesPage) {
      router.push(`${basePath}/search`)
    }
  }

  const isAnonymous = !activePersona && !realtimeEnabled

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors',
            activePersona || realtimeEnabled
              ? 'bg-accent/10 text-accent'
              : 'text-muted-foreground hover:text-foreground',
          )}
          aria-label="Persona switcher">
          <User className="h-5 w-5" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="z-100 max-h-[var(--radix-popover-content-available-height)] w-64 overflow-y-auto p-2">
        <p className="text-muted-foreground text-micro px-2 pt-1 pb-2 font-medium tracking-wider uppercase">
          Persona
        </p>

        <button
          type="button"
          onClick={() => handleSelectPersona(null)}
          aria-pressed={isAnonymous}
          className={cn(
            'flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors',
            isAnonymous
              ? 'bg-accent/10 text-accent font-medium'
              : 'text-foreground hover:bg-muted',
          )}>
          <span
            className={cn(
              'h-1.5 w-1.5 shrink-0 rounded-full',
              isAnonymous ? 'bg-accent' : 'bg-border',
            )}
          />
          Anonymous
        </button>

        {personas.map((persona) => {
          const isActive = activePersona?.id === persona.id
          return (
            <div key={persona.id} className="group mt-0.5 flex items-center">
              <button
                type="button"
                onClick={() => handleSelectPersona(persona)}
                aria-pressed={isActive}
                className={cn(
                  'flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-left text-xs transition-colors',
                  isActive
                    ? 'bg-accent/10 text-accent font-medium'
                    : 'text-foreground hover:bg-muted',
                )}>
                <span
                  className={cn(
                    'h-1.5 w-1.5 shrink-0 rounded-full',
                    isActive ? 'bg-accent' : 'bg-border',
                  )}
                />
                <div className="min-w-0">
                  <p className="truncate">{persona.label}</p>
                  <p className="text-muted-foreground text-micro mt-0.5 truncate">
                    {persona.description}
                  </p>
                </div>
              </button>
              {persona.type !== 'customerGroup' && (
                <Link
                  href={`${basePath}/affinities/${persona.token}`}
                  onClick={() => selectPersona(persona)}
                  className="text-muted-foreground hover:text-accent shrink-0 rounded-md p-1.5 opacity-0 transition-all group-hover:opacity-100"
                  aria-label={`View ${persona.label} affinities`}>
                  <BarChart3 className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          )
        })}

        <div className="bg-border my-2 h-px" />
        <p className="text-muted-foreground text-micro px-2 pb-2 font-medium tracking-wider uppercase">
          Realtime
        </p>

        <div className="group flex items-center">
          <button
            type="button"
            onClick={handleSelectRealtime}
            aria-pressed={realtimeEnabled}
            className={cn(
              'flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-left text-xs transition-colors',
              realtimeEnabled
                ? 'bg-accent/10 text-accent font-medium'
                : 'text-foreground hover:bg-muted',
            )}>
            <span
              className={cn(
                'h-1.5 w-1.5 shrink-0 rounded-full',
                realtimeEnabled ? 'bg-accent' : 'bg-border',
              )}
            />
            <div className="min-w-0">
              <p className="truncate">Realtime Personalization</p>
              <p className="text-muted-foreground text-micro mt-0.5 truncate">
                Build profile from your browsing
              </p>
            </div>
          </button>
          {realtimeEnabled && realtimeToken && (
            <Link
              href={`${basePath}/affinities/${realtimeToken}`}
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-accent shrink-0 rounded-md p-1.5 opacity-0 transition-all group-hover:opacity-100"
              aria-label="View realtime affinities">
              <BarChart3 className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
