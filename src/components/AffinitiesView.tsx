'use client'

import { ArrowLeft } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'

import { CopyToClipboard } from '@/components/ui/CopyToClipboard'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useAffinities } from '@/hooks/useAffinities'
import { enterFadeIn, transitionNormal, transitionSlow } from '@/lib/animations'

const useAffinitiesView = (token: string) => {
  const config = useActiveConfig()
  const personas = config?.features?.personalization?.personas ?? []
  const persona = personas.find((p) => p.token === token)
  const isCustomerGroup = persona?.type === 'customerGroup'
  const isRealtime = !isCustomerGroup && token.startsWith('realtime-')
  const { affinities, isLoading } = useAffinities(
    persona || isRealtime ? token : '',
    persona,
  )
  const vertical = config?.slug ?? ''

  return {
    persona,
    isCustomerGroup,
    isRealtime,
    affinities,
    isLoading,
    vertical,
  }
}

interface AffinitiesViewProps {
  token: string
}

export const AffinitiesView = ({ token }: AffinitiesViewProps) => {
  const {
    persona,
    isCustomerGroup,
    isRealtime,
    affinities,
    isLoading,
    vertical,
  } = useAffinitiesView(token)
  const isKnown = (!isCustomerGroup && Boolean(persona)) || isRealtime
  const label = persona ? persona.label : 'Realtime Session'

  return (
    <motion.div
      className="container mx-auto max-w-3xl px-4 py-12"
      {...enterFadeIn(12)}
      transition={transitionSlow}>
      <Link
        href={`/${vertical}/search`}
        className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-1.5 text-sm transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to search
      </Link>

      <h1 className="text-foreground mb-2 text-2xl font-semibold">
        User Affinities
      </h1>

      {!isKnown && (
        <p className="text-muted-foreground">Unknown personalization token.</p>
      )}

      {isKnown && (
        <>
          <p className="text-muted-foreground mb-1">
            Viewing affinities for{' '}
            <span className="text-accent font-medium">{label}</span>
          </p>
          <CopyToClipboard value={token} className="mb-8" />

          {isLoading && (
            <div className="text-muted-foreground animate-pulse text-sm">
              Loading profile...
            </div>
          )}

          {affinities && !isLoading && (
            <div className="space-y-6">
              {Object.entries(affinities).map(([facet, values], facetIdx) => (
                <motion.div
                  key={facet}
                  {...enterFadeIn(8)}
                  transition={{ ...transitionNormal, delay: facetIdx * 0.1 }}>
                  <h2 className="text-foreground mb-3 text-sm font-medium">
                    {facet}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(values)
                      .sort(([, a], [, b]) => b - a)
                      .map(([value, score], valueIdx) => (
                        <motion.div
                          key={value}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            ...transitionNormal,
                            delay: facetIdx * 0.1 + valueIdx * 0.03,
                          }}
                          className="bg-accent/10 text-accent inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium">
                          {value}
                          <span className="bg-accent/20 text-micro rounded-full px-1.5 py-0.5">
                            {Math.round(score)}
                          </span>
                        </motion.div>
                      ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!affinities && !isLoading && (
            <p className="text-muted-foreground text-sm">
              No affinities found for this user.
            </p>
          )}
        </>
      )}
    </motion.div>
  )
}
