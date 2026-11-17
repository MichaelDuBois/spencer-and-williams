import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  MEDIA_PERSONAS,
  useMediaProfile,
} from '@/app/media-entertainment/_hooks/useMediaProfile'
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

const { trackMock } = vi.hoisted(() => {
  return { trackMock: vi.fn() }
})
vi.mock('@/lib/analytics/track', () => {
  return { track: trackMock }
})

const [firstPersona, secondPersona] = MEDIA_PERSONAS

const renderProfile = () =>
  renderHook(() => useMediaProfile(), {
    wrapper: buildJotaiWrapper(createTestStore()),
  }).result

describe('useMediaProfile analytics', () => {
  beforeEach(() => {
    sessionStorage.clear()
    trackMock.mockClear()
    personalizationStore.set(activePersonaAtom, null)
    personalizationStore.set(realtimePersoEnabledAtom, false)
    personalizationStore.set(realtimeSessionTokenAtom, '')
  })

  it('tracks a persona pick and the switch out of anonymous', () => {
    const result = renderProfile()

    act(() => result.current.selectPersona(firstPersona))

    expect(trackMock).toHaveBeenCalledTimes(2)
    expect(trackMock).toHaveBeenCalledWith('persona_selected', {
      persona: firstPersona.id,
      persona_type: 'persona',
    })
    expect(trackMock).toHaveBeenCalledWith('personalization_mode_changed', {
      from: 'anonymous',
      to: 'persona',
    })
  })

  it('tracks another persona pick without a mode change', () => {
    personalizationStore.set(activePersonaAtom, firstPersona)
    const result = renderProfile()

    act(() => result.current.selectPersona(secondPersona))

    expect(trackMock).toHaveBeenCalledTimes(1)
    expect(trackMock).toHaveBeenCalledWith('persona_selected', {
      persona: secondPersona.id,
      persona_type: 'persona',
    })
  })

  it('tracks the switch to realtime without a persona pick', () => {
    personalizationStore.set(activePersonaAtom, firstPersona)
    const result = renderProfile()

    act(() => result.current.selectRealtime())

    expect(trackMock).toHaveBeenCalledTimes(1)
    expect(trackMock).toHaveBeenCalledWith('personalization_mode_changed', {
      from: 'persona',
      to: 'realtime',
    })
  })

  it('tracks the return to anonymous without a persona pick', () => {
    personalizationStore.set(realtimePersoEnabledAtom, true)
    const result = renderProfile()

    act(() => result.current.selectAnonymous())

    expect(trackMock).toHaveBeenCalledTimes(1)
    expect(trackMock).toHaveBeenCalledWith('personalization_mode_changed', {
      from: 'realtime',
      to: 'anonymous',
    })
  })

  it('tracks nothing when anonymous is picked again', () => {
    const result = renderProfile()

    act(() => result.current.selectAnonymous())

    expect(trackMock).not.toHaveBeenCalled()
  })

  it.each([
    [{ kind: 'persona', personaId: firstPersona.id }],
    [{ kind: 'realtime' }],
    [{ kind: 'anonymous' }],
  ] as const)('tracks nothing when restoring %j', (choice) => {
    const result = renderProfile()

    act(() => result.current.restoreChoice(choice))

    expect(trackMock).not.toHaveBeenCalled()
  })
})
