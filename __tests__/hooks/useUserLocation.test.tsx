import { act, renderHook, waitFor } from '@testing-library/react'
import { Provider, createStore } from 'jotai'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useUserLocation } from '@/hooks/useUserLocation'
import { geoSearchStore, userLocationAtom } from '@/stores/geoSearch'

import type { ReactNode } from 'react'

const getCurrentPositionMock = vi.fn()

beforeEach(() => {
  vi.stubGlobal('navigator', {
    geolocation: { getCurrentPosition: getCurrentPositionMock },
  })
  getCurrentPositionMock.mockReset()
  // The pinned atom lives in jotai's global store, so reset it between tests.
  geoSearchStore.set(userLocationAtom, { status: 'loading', coords: null })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const buildWrapper = () => {
  const store = createStore()
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
  return Wrapper
}

describe('useUserLocation', () => {
  it('starts in loading state with no coords', () => {
    const { result } = renderHook(() => useUserLocation(), {
      wrapper: buildWrapper(),
    })
    expect(result.current.status).toBe('loading')
    expect(result.current.coords).toBeNull()
  })

  it('transitions to granted with coords on success when autoRequest is true', async () => {
    getCurrentPositionMock.mockImplementation((success) => {
      success({ coords: { latitude: 40.7, longitude: -74.0 } })
    })
    const { result } = renderHook(
      () => useUserLocation({ autoRequest: true }),
      { wrapper: buildWrapper() },
    )
    await waitFor(() => expect(result.current.status).toBe('granted'))
    expect(result.current.coords).toEqual({ lat: 40.7, lng: -74.0 })
  })

  it('transitions to denied when the browser rejects the request', async () => {
    getCurrentPositionMock.mockImplementation((_success, error) => {
      error(new Error('denied'))
    })
    const { result } = renderHook(
      () => useUserLocation({ autoRequest: true }),
      { wrapper: buildWrapper() },
    )
    await waitFor(() => expect(result.current.status).toBe('denied'))
    expect(result.current.coords).toBeNull()
  })

  it('treats missing navigator.geolocation as denied', async () => {
    vi.stubGlobal('navigator', {})
    const { result } = renderHook(
      () => useUserLocation({ autoRequest: true }),
      { wrapper: buildWrapper() },
    )
    await waitFor(() => expect(result.current.status).toBe('denied'))
  })

  it('manual requestLocation recovers from denied state', async () => {
    getCurrentPositionMock.mockImplementationOnce((_success, error) => {
      error(new Error('denied'))
    })
    const { result } = renderHook(
      () => useUserLocation({ autoRequest: true }),
      { wrapper: buildWrapper() },
    )
    await waitFor(() => expect(result.current.status).toBe('denied'))

    getCurrentPositionMock.mockImplementationOnce((success) => {
      success({ coords: { latitude: 51.5, longitude: -0.1 } })
    })
    act(() => result.current.requestLocation())
    await waitFor(() => expect(result.current.status).toBe('granted'))
    expect(result.current.coords).toEqual({ lat: 51.5, lng: -0.1 })
  })
})
