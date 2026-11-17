'use client'

import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import {
  trackPersonaSelected,
  trackPersonalizationModeChange,
} from '@/lib/analytics/personalization-events'
import {
  mediaProfileChoiceAtom,
  mediaProfilePickerOpenAtom,
  type MediaProfileChoice,
} from '@/stores/mediaEntertainment'
import {
  activePersonaAtom,
  personalizationStore,
  realtimePersoEnabledAtom,
  setPersonaModeAtom,
  setRealtimeModeAtom,
} from '@/stores/personalization'
import type { Persona } from '@/types'

export const MEDIA_PERSONAS = (
  mediaEntertainmentConfig.features?.personalization?.personas ?? []
).filter((profile) => profile.type !== 'customerGroup')

export const getMediaPersona = (personaId: string): Persona | undefined =>
  MEDIA_PERSONAS.find((persona) => persona.id === personaId)

/**
 * The viewer's profile, as the media vertical sees it.
 *
 * The shared `personalization` store stays the source of truth for search — every
 * selector below writes through to it. What this adds is a persisted *choice*,
 * which the shared store deliberately does not keep: its atoms are in-memory, so
 * without this a reload would drop the viewer into the anonymous bucket and empty
 * both rails mid-demo.
 */
export const useMediaProfile = () => {
  const [choice, setChoice] = useAtom(mediaProfileChoiceAtom)
  const [isPickerOpen, setPickerOpen] = useAtom(mediaProfilePickerOpenAtom)
  const persona = useAtomValue(activePersonaAtom, {
    store: personalizationStore,
  })
  const realtimeEnabled = useAtomValue(realtimePersoEnabledAtom, {
    store: personalizationStore,
  })
  const setPersonaMode = useSetAtom(setPersonaModeAtom, {
    store: personalizationStore,
  })
  const setRealtimeMode = useSetAtom(setRealtimeModeAtom, {
    store: personalizationStore,
  })

  const selectPersona = useCallback(
    (selected: Persona) => {
      trackPersonalizationModeChange(() => setPersonaMode(selected))
      trackPersonaSelected(selected)
      setChoice({ kind: 'persona', personaId: selected.id })
      setPickerOpen(false)
    },
    [setPersonaMode, setChoice, setPickerOpen],
  )

  const selectRealtime = useCallback(() => {
    trackPersonalizationModeChange(setRealtimeMode)
    setChoice({ kind: 'realtime' })
    setPickerOpen(false)
  }, [setRealtimeMode, setChoice, setPickerOpen])

  const selectAnonymous = useCallback(() => {
    trackPersonalizationModeChange(() => setPersonaMode(null))
    setChoice({ kind: 'anonymous' })
    setPickerOpen(false)
  }, [setPersonaMode, setChoice, setPickerOpen])

  /**
   * Puts a persisted choice back into the shared personalization atoms. Called
   * once by the profile gate on mount, not from every consumer of this hook.
   */
  const restoreChoice = useCallback(
    (restored: MediaProfileChoice) => {
      if (restored.kind === 'realtime') {
        setRealtimeMode()
        return
      }

      // A persona since renamed or dropped from config resolves to undefined,
      // which lands the viewer on anonymous rather than on a dangling token.
      setPersonaMode(
        restored.kind === 'persona'
          ? (getMediaPersona(restored.personaId) ?? null)
          : null,
      )
    },
    [setPersonaMode, setRealtimeMode],
  )

  const openPicker = useCallback(() => setPickerOpen(true), [setPickerOpen])
  const closePicker = useCallback(() => setPickerOpen(false), [setPickerOpen])

  return {
    personas: MEDIA_PERSONAS,
    choice,
    persona,
    realtimeEnabled,
    isPickerOpen,
    openPicker,
    closePicker,
    selectPersona,
    selectRealtime,
    selectAnonymous,
    restoreChoice,
  }
}
