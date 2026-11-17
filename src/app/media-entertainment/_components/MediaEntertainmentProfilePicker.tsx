'use client'

import { useAtomValue } from 'jotai'
import { AnimatePresence, motion } from 'motion/react'

import { MediaEntertainmentProfileTile } from '@/app/media-entertainment/_components/MediaEntertainmentProfileTile'
import {
  ANONYMOUS_TILE_VARIANT,
  getPersonaTileVariant,
  REALTIME_TILE_VARIANT,
} from '@/app/media-entertainment/_components/MediaEntertainmentProfileVariants'
import { useMediaProfile } from '@/app/media-entertainment/_hooks/useMediaProfile'
import { mediaEntertainmentConfig as config } from '@/app/media-entertainment/config'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { enterFadeIn, transitionSlow } from '@/lib/animations'
import {
  personalizationStore,
  realtimeSessionTokenAtom,
} from '@/stores/personalization'

const HEADING_ID = 'media-profile-picker-heading'

// The two tiles that stand for no persona, named so they can share the active
// and muted bookkeeping with the persona tiles.
const REALTIME_TILE_ID = 'realtime'
const ANONYMOUS_TILE_ID = 'anonymous'

const basePath = `/${config.slug}`

/**
 * "Who's watching?" — the profile picker.
 *
 * Shown until a choice has been made, and reopenable from the header afterwards.
 * Not dismissible by scrim or Escape on first entry: with no choice recorded there
 * is nothing behind it to go back to, and every rail below depends on the answer.
 * Once a choice exists, closing is allowed and the picker behaves as a switcher.
 */
export const MediaEntertainmentProfilePicker = () => {
  const {
    personas,
    choice,
    persona,
    realtimeEnabled,
    isPickerOpen,
    closePicker,
    selectPersona,
    selectRealtime,
    selectAnonymous,
  } = useMediaProfile()
  const realtimeToken = useAtomValue(realtimeSessionTokenAtom, {
    store: personalizationStore,
  })

  const hasChoice = choice !== null
  const isOpen = !hasChoice || isPickerOpen
  const activeLabel =
    persona?.label ?? (realtimeEnabled ? 'Realtime profile' : 'Anonymous')

  // Which tile is the current one — `null` before any choice, when no tile
  // should stand out and none should be dimmed against it.
  const activeTileId = persona
    ? persona.id
    : realtimeEnabled
      ? REALTIME_TILE_ID
      : hasChoice
        ? ANONYMOUS_TILE_ID
        : null

  useBodyScrollLock(isOpen)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="media-profile-picker"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transitionSlow}
          onClick={hasChoice ? closePicker : undefined}
          role="dialog"
          aria-modal="true"
          aria-labelledby={HEADING_ID}
          // Above the header (z-40), the assistant panel (z-50) and the detail
          // sheet (z-55) — nothing should be reachable behind an unanswered picker.
          className="bg-background fixed inset-0 z-60 flex flex-col items-center justify-center px-6">
          <motion.div
            {...enterFadeIn(12)}
            transition={transitionSlow}
            onClick={(event) => event.stopPropagation()}
            className="flex flex-col items-center">
            {/* `font-secondary` is Archivo Black in this theme — no `font-bold`
                on top of it, which would synthesise a second weight. */}
            <h1
              id={HEADING_ID}
              className="font-secondary text-2xl tracking-tight text-white uppercase md:text-4xl">
              Who&apos;s watching?
            </h1>

            <div className="mt-10 flex flex-wrap items-start justify-center gap-6 md:gap-10">
              {personas.map((candidate) => (
                <MediaEntertainmentProfileTile
                  key={candidate.id}
                  label={candidate.label}
                  description={candidate.description}
                  variant={getPersonaTileVariant(candidate.id)}
                  isActive={activeTileId === candidate.id}
                  isMuted={
                    activeTileId !== null && activeTileId !== candidate.id
                  }
                  onSelect={() => selectPersona(candidate)}
                  affinitiesHref={`${basePath}/affinities/${candidate.token}`}
                  onAffinitiesClick={() => selectPersona(candidate)}
                />
              ))}

              <MediaEntertainmentProfileTile
                label="Realtime profile"
                description="Learns from what you browse"
                variant={REALTIME_TILE_VARIANT}
                isActive={activeTileId === REALTIME_TILE_ID}
                isMuted={
                  activeTileId !== null && activeTileId !== REALTIME_TILE_ID
                }
                onSelect={selectRealtime}
                affinitiesHref={
                  realtimeEnabled && realtimeToken
                    ? `${basePath}/affinities/${realtimeToken}`
                    : undefined
                }
                onAffinitiesClick={closePicker}
              />

              <MediaEntertainmentProfileTile
                label="Anonymous"
                description="No profile, no personalization"
                variant={ANONYMOUS_TILE_VARIANT}
                isActive={activeTileId === ANONYMOUS_TILE_ID}
                isMuted={
                  activeTileId !== null && activeTileId !== ANONYMOUS_TILE_ID
                }
                onSelect={selectAnonymous}
              />
            </div>

            {hasChoice && (
              <button
                type="button"
                onClick={closePicker}
                className="text-muted-foreground hover:text-foreground focus-visible:outline-ring mt-12 cursor-pointer text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2">
                Keep watching as {activeLabel}
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
