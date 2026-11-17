import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { b2bWarehouseConfig } from '@/app/b2b-warehouse/config'
import { PERSONAS } from '@/app/b2b-warehouse/personas'
import { PersonaSwitcher } from '@/components/PersonaSwitcher'
import { activeConfigAtom } from '@/stores/activeConfig'
import {
  activePersonaAtom,
  personalizationStore,
  realtimePersoEnabledAtom,
  realtimeSessionTokenAtom,
} from '@/stores/personalization'
import type { SelectableProfile } from '@/types'

import { GROUP_0 } from '@tests/helpers/customerGroups'
import {
  buildJotaiWrapper,
  createTestStore,
} from '@tests/helpers/jotai-wrapper'
import { createMockConfig } from '@tests/helpers/test-utils'

const navigation = vi.hoisted(() => {
  return {
    pathname: '/b2b-warehouse/search',
    push: vi.fn(),
  }
})
const { trackMock } = vi.hoisted(() => {
  return { trackMock: vi.fn() }
})
vi.mock('@/lib/analytics/track', () => {
  return { track: trackMock }
})

vi.mock('next/navigation', () => {
  return {
    usePathname: () => navigation.pathname,
    useRouter: () => {
      return { push: navigation.push }
    },
  }
})

const renderSwitcher = (
  personas: SelectableProfile[] = [GROUP_0, PERSONAS[0]],
) => {
  const store = createTestStore((s) =>
    s.set(
      activeConfigAtom,
      createMockConfig({
        slug: 'b2b-warehouse',
        features: {
          agentStudio: {},
          personalization: { enabled: true, personas },
        },
      }),
    ),
  )
  render(<PersonaSwitcher basePath="/b2b-warehouse" />, {
    wrapper: buildJotaiWrapper(store),
  })
  return store
}

describe('PersonaSwitcher profile types', () => {
  beforeEach(() => {
    navigation.pathname = '/b2b-warehouse/search'
    navigation.push.mockClear()
    personalizationStore.set(activePersonaAtom, null)
    personalizationStore.set(realtimePersoEnabledAtom, false)
    personalizationStore.set(realtimeSessionTokenAtom, '')
  })

  it('selects a group with the keyboard without offering an affinity link', async () => {
    const user = userEvent.setup()
    const store = renderSwitcher()
    await user.click(screen.getByRole('button', { name: 'Persona switcher' }))
    expect(
      screen.queryByRole('link', { name: `View ${GROUP_0.label} affinities` }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: `View ${PERSONAS[0].label} affinities`,
      }),
    ).toHaveAttribute('href', `/b2b-warehouse/affinities/${PERSONAS[0].token}`)
    screen.getByRole('button', { name: /Customer Group 0/ }).focus()
    await user.keyboard('{Enter}')
    expect(personalizationStore.get(activePersonaAtom)).toEqual(GROUP_0)
    expect(navigation.push).not.toHaveBeenCalled()
    expect(
      screen.queryByRole('button', { name: /Customer Group 0/ }),
    ).not.toBeInTheDocument()
  })

  it('leaves an affinity page when a group is selected', async () => {
    navigation.pathname = `/b2b-warehouse/affinities/${PERSONAS[0].token}`
    const user = userEvent.setup()
    renderSwitcher()
    await user.click(screen.getByRole('button', { name: 'Persona switcher' }))
    await user.click(screen.getByRole('button', { name: /Customer Group 0/ }))
    expect(navigation.push).toHaveBeenCalledWith('/b2b-warehouse/search')
  })

  it('preserves navigation to an ordinary persona affinity page', async () => {
    navigation.pathname = '/b2b-warehouse/affinities/other-token'
    const user = userEvent.setup()
    renderSwitcher()
    await user.click(screen.getByRole('button', { name: 'Persona switcher' }))
    await user.click(
      screen.getByRole('button', { name: new RegExp(PERSONAS[0].label) }),
    )
    expect(navigation.push).toHaveBeenCalledWith(
      `/b2b-warehouse/affinities/${PERSONAS[0].token}`,
    )
  })
})

it.each([
  ['Customer Group 0', 'customer_group_0', 0.15],
  ['Customer Group 1', 'customer_group_1', 0.3],
])(
  'exposes configured %s in the real B2B dropdown',
  async (label, groupId, discount) => {
    const user = userEvent.setup()
    const store = createTestStore((s) =>
      s.set(activeConfigAtom, b2bWarehouseConfig),
    )
    render(<PersonaSwitcher basePath="/b2b-warehouse" />, {
      wrapper: buildJotaiWrapper(store),
    })
    await user.click(screen.getByRole('button', { name: 'Persona switcher' }))
    const option = screen.getByRole('button', {
      name: new RegExp(String(label)),
    })
    expect(screen.getByText(`${Number(discount) * 100}% group discount`)).toBeVisible()
    expect(
      screen.queryByRole('link', { name: `View ${label} affinities` }),
    ).not.toBeInTheDocument()
    option.focus()
    await user.keyboard('{Enter}')
    expect(personalizationStore.get(activePersonaAtom)).toMatchObject({
      type: 'customerGroup',
      groupId,
      discount,
    })
    await user.click(screen.getByRole('button', { name: 'Persona switcher' }))
    expect(
      screen.getByRole('button', { name: new RegExp(String(label)) }),
    ).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'Anonymous' }))
    expect(personalizationStore.get(activePersonaAtom)).toBeNull()
  },
)

describe('PersonaSwitcher analytics', () => {
  const pick = async (name: string | RegExp) => {
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Persona switcher' }))
    await user.click(screen.getByRole('button', { name }))
  }

  const eventsNamed = (eventName: string) =>
    trackMock.mock.calls.filter(([name]) => name === eventName)

  beforeEach(() => {
    navigation.pathname = '/b2b-warehouse/search'
    trackMock.mockClear()
    personalizationStore.set(activePersonaAtom, null)
    personalizationStore.set(realtimePersoEnabledAtom, false)
    personalizationStore.set(realtimeSessionTokenAtom, '')
    renderSwitcher([GROUP_0, PERSONAS[0], PERSONAS[1]])
  })

  it('tracks a persona pick and the switch out of anonymous', async () => {
    await pick(new RegExp(PERSONAS[0].label))

    expect(trackMock).toHaveBeenCalledWith('persona_selected', {
      persona: PERSONAS[0].id,
      persona_type: 'persona',
    })
    expect(trackMock).toHaveBeenCalledWith('personalization_mode_changed', {
      from: 'anonymous',
      to: 'persona',
    })
  })

  it('tracks a customer group pick with its profile type', async () => {
    await pick(/Customer Group 0/)

    expect(trackMock).toHaveBeenCalledWith('persona_selected', {
      persona: GROUP_0.id,
      persona_type: 'customerGroup',
    })
    expect(trackMock).toHaveBeenCalledWith('personalization_mode_changed', {
      from: 'anonymous',
      to: 'customerGroup',
    })
  })

  it('tracks another persona pick without a mode change', async () => {
    personalizationStore.set(activePersonaAtom, PERSONAS[0])

    await pick(new RegExp(PERSONAS[1].label))

    expect(eventsNamed('persona_selected')).toEqual([
      [
        'persona_selected',
        { persona: PERSONAS[1].id, persona_type: 'persona' },
      ],
    ])
    expect(eventsNamed('personalization_mode_changed')).toEqual([])
  })

  it('tracks a persona picked from its affinity link', async () => {
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Persona switcher' }))
    // jsdom cannot follow the link; the handlers still run before this.
    document.addEventListener('click', (event) => event.preventDefault(), {
      once: true,
    })
    await user.click(
      screen.getByRole('link', { name: `View ${PERSONAS[0].label} affinities` }),
    )

    expect(trackMock).toHaveBeenCalledWith('persona_selected', {
      persona: PERSONAS[0].id,
      persona_type: 'persona',
    })
    expect(trackMock).toHaveBeenCalledWith('personalization_mode_changed', {
      from: 'anonymous',
      to: 'persona',
    })
  })

  it('tracks the switch to realtime without a persona pick', async () => {
    personalizationStore.set(activePersonaAtom, PERSONAS[0])

    await pick(/Realtime Personalization/)

    expect(trackMock).toHaveBeenCalledTimes(1)
    expect(trackMock).toHaveBeenCalledWith('personalization_mode_changed', {
      from: 'persona',
      to: 'realtime',
    })
  })

  it('tracks the return to anonymous without a persona pick', async () => {
    personalizationStore.set(realtimePersoEnabledAtom, true)

    await pick('Anonymous')

    expect(trackMock).toHaveBeenCalledTimes(1)
    expect(trackMock).toHaveBeenCalledWith('personalization_mode_changed', {
      from: 'realtime',
      to: 'anonymous',
    })
  })

  it('tracks nothing when anonymous is picked again', async () => {
    await pick('Anonymous')

    expect(trackMock).not.toHaveBeenCalled()
  })

  it('tracks nothing when realtime is picked again', async () => {
    personalizationStore.set(realtimePersoEnabledAtom, true)

    await pick(/Realtime Personalization/)

    expect(trackMock).not.toHaveBeenCalled()
  })
})
