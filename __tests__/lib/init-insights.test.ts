import { beforeEach, describe, expect, it, vi } from 'vitest'

import { initInsights } from '@/lib/init-insights'

const { aaMock } = vi.hoisted(() => {return { aaMock: vi.fn() }})

vi.mock('search-insights', () => {return { default: aaMock }})

const initCalls = () => aaMock.mock.calls.filter((call) => call[0] === 'init')

describe('initInsights', () => {
  beforeEach(() => {
    aaMock.mockClear()
  })

  it('inits the singleton on the first call', () => {
    initInsights('APP_A', 'key-a')

    expect(aaMock).toHaveBeenCalledWith('init', {
      appId: 'APP_A',
      apiKey: 'key-a',
      useCookie: true,
      partial: true,
    })
  })

  it('does not re-init for the same credentials', () => {
    initInsights('APP_B', 'key-b')
    aaMock.mockClear()

    initInsights('APP_B', 'key-b')

    expect(initCalls()).toHaveLength(0)
  })

  it('re-inits when only the api key changes', () => {
    initInsights('APP_C', 'key-c')
    aaMock.mockClear()

    initInsights('APP_C', 'rotated-key-c')

    expect(aaMock).toHaveBeenCalledWith('init', {
      appId: 'APP_C',
      apiKey: 'rotated-key-c',
      useCookie: true,
      partial: true,
    })
  })

  it('re-inits on the way back to a previously used app', () => {
    initInsights('APP_D', 'key-d')
    initInsights('APP_E', 'key-e')
    initInsights('APP_D', 'key-d')

    expect(initCalls().map((call) => call[1].appId)).toEqual([
      'APP_D',
      'APP_E',
      'APP_D',
    ])
  })

  it('ignores empty credentials', () => {
    initInsights('', '')
    initInsights('APP_F', '')
    initInsights('', 'key-f')

    expect(initCalls()).toHaveLength(0)
  })
})
