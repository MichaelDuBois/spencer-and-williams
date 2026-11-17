import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useStagingSwitchGate } from '@/components/options/hooks/useStagingSwitchGate'
import {
  algoliaEnvironmentAtom,
  algoliaEnvironmentStore,
  stagingNoticeAcknowledgedAtom,
} from '@/stores/algoliaEnvironment'

const getEnvironment = () => algoliaEnvironmentStore.get(algoliaEnvironmentAtom)

const isAcknowledged = () =>
  algoliaEnvironmentStore.get(stagingNoticeAcknowledgedAtom)

const { trackMock } = vi.hoisted(() => {
  return { trackMock: vi.fn() }
})
vi.mock('@/lib/analytics/track', () => {
  return { track: trackMock }
})

describe('useStagingSwitchGate', () => {
  beforeEach(() => {
    algoliaEnvironmentStore.set(algoliaEnvironmentAtom, 'production')
    algoliaEnvironmentStore.set(stagingNoticeAcknowledgedAtom, false)
    trackMock.mockClear()
  })

  it('returns to production immediately without a notice', () => {
    algoliaEnvironmentStore.set(algoliaEnvironmentAtom, 'staging')
    const { result } = renderHook(() => useStagingSwitchGate())

    act(() => result.current.requestChange(false))

    expect(getEnvironment()).toBe('production')
    expect(result.current.isNoticeOpen).toBe(false)
  })

  it('opens the notice instead of enabling staging when unacknowledged', () => {
    const { result } = renderHook(() => useStagingSwitchGate())

    act(() => result.current.requestChange(true))

    expect(result.current.isNoticeOpen).toBe(true)
    expect(getEnvironment()).toBe('production')
  })

  it('enables staging without a notice once acknowledged', () => {
    algoliaEnvironmentStore.set(stagingNoticeAcknowledgedAtom, true)
    const { result } = renderHook(() => useStagingSwitchGate())

    act(() => result.current.requestChange(true))

    expect(getEnvironment()).toBe('staging')
    expect(result.current.isNoticeOpen).toBe(false)
  })

  it('acknowledges and enables staging on confirm', () => {
    const { result } = renderHook(() => useStagingSwitchGate())

    act(() => result.current.requestChange(true))
    act(() => result.current.confirm())

    expect(getEnvironment()).toBe('staging')
    expect(isAcknowledged()).toBe(true)
    expect(result.current.isNoticeOpen).toBe(false)
  })

  it('closes the notice on cancel and leaves the environment alone', () => {
    const { result } = renderHook(() => useStagingSwitchGate())

    act(() => result.current.requestChange(true))
    act(() => result.current.cancel())

    expect(result.current.isNoticeOpen).toBe(false)
    expect(getEnvironment()).toBe('production')
    expect(isAcknowledged()).toBe(false)
  })

  it('reopens the notice without a pending change', () => {
    algoliaEnvironmentStore.set(algoliaEnvironmentAtom, 'staging')
    algoliaEnvironmentStore.set(stagingNoticeAcknowledgedAtom, true)
    const { result } = renderHook(() => useStagingSwitchGate())

    act(() => result.current.reopen())

    expect(result.current.isNoticeOpen).toBe(true)
    expect(getEnvironment()).toBe('staging')
  })

  it('reports notice open state to the caller', () => {
    const onNoticeOpenChange = vi.fn()
    const { result } = renderHook(() =>
      useStagingSwitchGate({ onNoticeOpenChange }),
    )

    act(() => result.current.requestChange(true))
    expect(onNoticeOpenChange).toHaveBeenLastCalledWith(true)

    act(() => result.current.cancel())
    expect(onNoticeOpenChange).toHaveBeenLastCalledWith(false)
    expect(onNoticeOpenChange).toHaveBeenCalledTimes(2)
  })

  describe('analytics', () => {
    it('tracks the switch to staging once the notice is confirmed', () => {
      const { result } = renderHook(() => useStagingSwitchGate())

      act(() => result.current.requestChange(true))
      expect(trackMock).not.toHaveBeenCalled()

      act(() => result.current.confirm())
      expect(trackMock).toHaveBeenCalledTimes(1)
      expect(trackMock).toHaveBeenCalledWith('environment_switched', {
        from: 'production',
        to: 'staging',
      })
    })

    it('tracks nothing when the notice is cancelled', () => {
      const { result } = renderHook(() => useStagingSwitchGate())

      act(() => result.current.requestChange(true))
      act(() => result.current.cancel())

      expect(trackMock).not.toHaveBeenCalled()
    })

    it('tracks the switch to staging once acknowledged', () => {
      algoliaEnvironmentStore.set(stagingNoticeAcknowledgedAtom, true)
      const { result } = renderHook(() => useStagingSwitchGate())

      act(() => result.current.requestChange(true))

      expect(trackMock).toHaveBeenCalledWith('environment_switched', {
        from: 'production',
        to: 'staging',
      })
    })

    it('tracks the switch back to production', () => {
      algoliaEnvironmentStore.set(algoliaEnvironmentAtom, 'staging')
      const { result } = renderHook(() => useStagingSwitchGate())

      act(() => result.current.requestChange(false))

      expect(trackMock).toHaveBeenCalledWith('environment_switched', {
        from: 'staging',
        to: 'production',
      })
    })

    it('tracks nothing when staging is requested while already on it', () => {
      algoliaEnvironmentStore.set(algoliaEnvironmentAtom, 'staging')
      algoliaEnvironmentStore.set(stagingNoticeAcknowledgedAtom, true)
      const { result } = renderHook(() => useStagingSwitchGate())

      act(() => result.current.requestChange(true))

      expect(trackMock).not.toHaveBeenCalled()
    })
  })
})
