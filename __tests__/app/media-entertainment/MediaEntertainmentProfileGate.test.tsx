import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { MediaEntertainmentProfileGate } from '@/app/media-entertainment/_components/MediaEntertainmentProfileGate'
import { PERSONAS } from '@/app/media-entertainment/personas'
import {
  mediaProfileChoiceAtom,
  mediaProfilePickerOpenAtom,
  type MediaProfileChoice,
} from '@/stores/mediaEntertainment'
import {
  activePersonaAtom,
  personalizationStore,
  realtimePersoEnabledAtom,
  realtimeSessionTokenAtom,
} from '@/stores/personalization'

import { buildJotaiWrapper, createTestStore } from '@tests/helpers/jotai-wrapper'
import { installMatchMedia } from '@tests/helpers/matchMedia'

const [marvelFan, kidsFamily] = PERSONAS

const renderGate = (choice?: MediaProfileChoice) => {
  const store = createTestStore((testStore) => {
    if (choice) testStore.set(mediaProfileChoiceAtom, choice)
  })

  render(<MediaEntertainmentProfileGate />, {
    wrapper: buildJotaiWrapper(store),
  })

  return store
}

describe('MediaEntertainmentProfileGate', () => {
  beforeEach(() => {
    installMatchMedia(true)
    sessionStorage.clear()
    // The personalization atoms live on the global store, so reset them here.
    personalizationStore.set(activePersonaAtom, null)
    personalizationStore.set(realtimePersoEnabledAtom, false)
    personalizationStore.set(realtimeSessionTokenAtom, '')
  })

  it('puts a persisted persona back on the shared store', async () => {
    renderGate({ kind: 'persona', personaId: kidsFamily.id })

    await waitFor(() =>
      expect(personalizationStore.get(activePersonaAtom)?.id).toBe(
        kidsFamily.id,
      ),
    )
    expect(personalizationStore.get(activePersonaAtom)?.token).toBe(
      kidsFamily.token,
    )
  })

  it('turns realtime personalization back on for a persisted realtime choice', async () => {
    renderGate({ kind: 'realtime' })

    await waitFor(() =>
      expect(personalizationStore.get(realtimePersoEnabledAtom)).toBe(true),
    )
    expect(personalizationStore.get(realtimeSessionTokenAtom)).toMatch(
      /^realtime-/,
    )
  })

  it('lands a persona that is no longer in config on anonymous, not a dangling token', async () => {
    renderGate({ kind: 'persona', personaId: 'retired-persona' })

    await waitFor(() =>
      expect(personalizationStore.get(activePersonaAtom)).toBeNull(),
    )
    expect(personalizationStore.get(realtimePersoEnabledAtom)).toBe(false)
  })

  it('restores nothing, and shows the picker, when no choice was recorded', async () => {
    renderGate()

    expect(
      await screen.findByRole('dialog', { name: "Who's watching?" }),
    ).toBeInTheDocument()
    expect(personalizationStore.get(activePersonaAtom)).toBeNull()
  })

  it('leaves a later switch alone rather than restoring over it', async () => {
    const user = userEvent.setup()
    const store = createTestStore((testStore) => {
      testStore.set(mediaProfileChoiceAtom, {
        kind: 'persona',
        personaId: marvelFan.id,
      })
      // Open, as it would be after the header avatar reopens it as a switcher.
      testStore.set(mediaProfilePickerOpenAtom, true)
    })

    render(<MediaEntertainmentProfileGate />, {
      wrapper: buildJotaiWrapper(store),
    })

    await waitFor(() =>
      expect(personalizationStore.get(activePersonaAtom)?.id).toBe(
        marvelFan.id,
      ),
    )

    // Picking the other persona changes `choice`, which the restore effect
    // watches — the guard must keep it from running a second time and putting
    // the old persona back.
    await user.click(
      screen.getByRole('button', { name: new RegExp(kidsFamily.label) }),
    )

    expect(personalizationStore.get(activePersonaAtom)?.id).toBe(kidsFamily.id)
  })
})
