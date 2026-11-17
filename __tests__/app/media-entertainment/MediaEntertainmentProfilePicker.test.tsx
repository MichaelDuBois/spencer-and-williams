import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { MediaEntertainmentProfileButton } from '@/app/media-entertainment/_components/MediaEntertainmentProfileButton'
import { MediaEntertainmentProfilePicker } from '@/app/media-entertainment/_components/MediaEntertainmentProfilePicker'
import { PERSONAS } from '@/app/media-entertainment/personas'
import {
  mediaProfileChoiceAtom,
  mediaProfilePickerOpenAtom,
} from '@/stores/mediaEntertainment'
import {
  activePersonaAtom,
  personalizationStore,
  realtimePersoEnabledAtom,
  realtimeSessionTokenAtom,
} from '@/stores/personalization'

import {
  buildJotaiWrapper,
  createTestStore,
} from '@tests/helpers/jotai-wrapper'
import { installMatchMedia } from '@tests/helpers/matchMedia'

const [marvelFan] = PERSONAS

const renderPicker = (store = createTestStore()) => {
  render(<MediaEntertainmentProfilePicker />, {
    wrapper: buildJotaiWrapper(store),
  })

  return store
}

describe('MediaEntertainmentProfilePicker', () => {
  beforeEach(() => {
    installMatchMedia(true)
    sessionStorage.clear()
    // The personalization atoms live on the global store, so reset them here.
    personalizationStore.set(activePersonaAtom, null)
    personalizationStore.set(realtimePersoEnabledAtom, false)
    personalizationStore.set(realtimeSessionTokenAtom, '')
  })

  it('opens on first entry, with no choice recorded', () => {
    renderPicker()

    expect(
      screen.getByRole('dialog', { name: "Who's watching?" }),
    ).toBeInTheDocument()
  })

  it('offers every configured persona, plus realtime and anonymous', () => {
    renderPicker()

    for (const persona of PERSONAS) {
      expect(
        screen.getByRole('button', { name: new RegExp(persona.label) }),
      ).toBeInTheDocument()
    }
    expect(
      screen.getByRole('button', { name: /Realtime profile/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Anonymous/ }),
    ).toBeInTheDocument()
  })

  it.each([
    { label: 'Ava', image: 'superhero.webp' },
    { label: 'Noah', image: 'dinosaur.webp' },
    { label: 'Realtime profile', image: 'laptop.webp' },
    { label: 'Anonymous', image: 'hoodie.webp' },
  ])(
    'shows the $label avatar in the picker and selected header',
    async ({ label, image }) => {
      const user = userEvent.setup()
      render(
        <>
          <MediaEntertainmentProfilePicker />
          <MediaEntertainmentProfileButton />
        </>,
        { wrapper: buildJotaiWrapper(createTestStore()) },
      )

      const picker = screen.getByRole('dialog')
      const tile = within(picker).getByRole('button', {
        name: new RegExp(label),
      })
      const avatar = within(tile).getByRole('presentation')
      const imageSrc = `/images/media-entertainment/avatars/${image}`
      expect(avatar).toHaveAttribute('src', imageSrc)
      expect(avatar.parentElement).toHaveClass(
        'rounded-full',
        'overflow-hidden',
      )

      tile.focus()
      await user.keyboard('{Enter}')
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())

      const header = screen.getByRole('button', {
        name: `Switch profile — watching as ${label}`,
      })
      const headerAvatar = within(header).getByRole('presentation')
      expect(headerAvatar).toHaveAttribute('src', imageSrc)
      expect(headerAvatar.parentElement).toHaveClass(
        'rounded-full',
        'overflow-hidden',
      )
    },
  )

  it('sets the persona on the shared store and records the choice', async () => {
    const user = userEvent.setup()
    const store = renderPicker()

    await user.click(
      screen.getByRole('button', { name: new RegExp(marvelFan.label) }),
    )

    expect(personalizationStore.get(activePersonaAtom)?.id).toBe('marvel-fan')
    expect(store.get(mediaProfileChoiceAtom)).toEqual({
      kind: 'persona',
      personaId: 'marvel-fan',
    })
  })

  it('closes once a profile is picked', async () => {
    const user = userEvent.setup()
    renderPicker()

    await user.click(
      screen.getByRole('button', { name: new RegExp(marvelFan.label) }),
    )

    // Motion animates the overlay out, so removal lands a frame after the click.
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('turns on realtime personalization with a session token', async () => {
    const user = userEvent.setup()
    renderPicker()

    await user.click(screen.getByRole('button', { name: /Realtime profile/ }))

    expect(personalizationStore.get(realtimePersoEnabledAtom)).toBe(true)
    expect(personalizationStore.get(realtimeSessionTokenAtom)).toMatch(
      /^realtime-/,
    )
    expect(personalizationStore.get(activePersonaAtom)).toBeNull()
  })

  it('records an explicit anonymous choice, so the picker stops reappearing', async () => {
    const user = userEvent.setup()
    const store = renderPicker()

    await user.click(screen.getByRole('button', { name: /Anonymous/ }))

    expect(store.get(mediaProfileChoiceAtom)).toEqual({ kind: 'anonymous' })
    expect(personalizationStore.get(activePersonaAtom)).toBeNull()
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('stays shut on later renders once a choice exists', () => {
    renderPicker(
      createTestStore((store) =>
        store.set(mediaProfileChoiceAtom, { kind: 'anonymous' }),
      ),
    )

    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('offers no way out before a choice is made', () => {
    renderPicker()

    expect(
      screen.queryByRole('button', { name: /Keep watching as/ }),
    ).toBeNull()
  })

  it('offers a way out, naming the active profile, once reopened as a switcher', async () => {
    const user = userEvent.setup()
    personalizationStore.set(activePersonaAtom, marvelFan)
    const store = renderPicker(
      createTestStore((testStore) => {
        testStore.set(mediaProfileChoiceAtom, {
          kind: 'persona',
          personaId: 'marvel-fan',
        })
        testStore.set(mediaProfilePickerOpenAtom, true)
      }),
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: `Keep watching as ${marvelFan.label}`,
      }),
    )

    expect(store.get(mediaProfilePickerOpenAtom)).toBe(false)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('links every persona tile at its own affinities', () => {
    renderPicker()

    expect(
      screen
        .getAllByRole('link', { name: 'Affinities' })
        .map((link) => link.getAttribute('href')),
      // One per persona, and none for the realtime tile, which has no session
      // token before it is selected.
    ).toEqual(
      PERSONAS.map(
        (persona) => `/media-entertainment/affinities/${persona.token}`,
      ),
    )
  })
})
