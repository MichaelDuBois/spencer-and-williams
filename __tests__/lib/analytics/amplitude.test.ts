import { beforeEach, describe, expect, it, vi } from 'vitest'

const { addMock, initMock, sessionReplayPluginMock, demoContextPluginMock } =
  vi.hoisted(() => {
    return {
      addMock: vi.fn(),
      initMock: vi.fn(),
      sessionReplayPluginMock: vi.fn((options: unknown) => {
        return { name: 'session-replay', options }
      }),
      demoContextPluginMock: vi.fn(() => {
        return { name: 'demo-context', type: 'enrichment' }
      }),
    }
  })

vi.mock('@amplitude/analytics-browser', () => {
  return { add: addMock, init: initMock, Types: { LogLevel: { Debug: 4 } } }
})

vi.mock('@amplitude/plugin-session-replay-browser', () => {
  return { sessionReplayPlugin: sessionReplayPluginMock }
})

vi.mock('@/lib/analytics/demo-context-plugin', () => {
  return { demoContextPlugin: demoContextPluginMock }
})

// A fresh module per test: the enabled flag is module state that init sets.
const loadAmplitude = () => import('@/lib/analytics/amplitude')

describe('initAmplitude', () => {
  beforeEach(() => {
    vi.resetModules()
    addMock.mockClear()
    initMock.mockClear()
    sessionReplayPluginMock.mockClear()
    demoContextPluginMock.mockClear()
  })

  it.each([undefined, ''])('does nothing when the api key is %j', async (apiKey) => {
    const { initAmplitude, isAmplitudeEnabled } = await loadAmplitude()
    initAmplitude(apiKey)

    expect(sessionReplayPluginMock).not.toHaveBeenCalled()
    expect(demoContextPluginMock).not.toHaveBeenCalled()
    expect(addMock).not.toHaveBeenCalled()
    expect(initMock).not.toHaveBeenCalled()
    expect(isAmplitudeEnabled()).toBe(false)
  })

  it('reports Amplitude as enabled once initialized', async () => {
    const { initAmplitude, isAmplitudeEnabled } = await loadAmplitude()
    initAmplitude('test-key')

    expect(isAmplitudeEnabled()).toBe(true)
  })

  it('adds session replay at 100% with light masking', async () => {
    const { initAmplitude } = await loadAmplitude()
    initAmplitude('test-key')

    expect(sessionReplayPluginMock).toHaveBeenCalledWith({
      sampleRate: 1,
      privacyConfig: { defaultMaskLevel: 'light' },
    })
    expect(addMock).toHaveBeenCalledWith({
      name: 'session-replay',
      options: {
        sampleRate: 1,
        privacyConfig: { defaultMaskLevel: 'light' },
      },
    })
  })

  it('adds the demo context plugin', async () => {
    const { initAmplitude } = await loadAmplitude()
    initAmplitude('test-key')

    expect(addMock).toHaveBeenCalledWith({
      name: 'demo-context',
      type: 'enrichment',
    })
  })

  it('registers every plugin before init', async () => {
    const { initAmplitude } = await loadAmplitude()
    initAmplitude('test-key')

    expect(addMock).toHaveBeenCalledTimes(2)
    for (const order of addMock.mock.invocationCallOrder) {
      expect(order).toBeLessThan(initMock.mock.invocationCallOrder[0])
    }
  })

  it('inits with the key and path-only pageview autocapture', async () => {
    const { initAmplitude } = await loadAmplitude()
    initAmplitude('test-key')

    expect(initMock).toHaveBeenCalledWith(
      'test-key',
      expect.objectContaining({
        autocapture: {
          attribution: true,
          sessions: true,
          pageViews: { trackHistoryChanges: 'pathOnly' },
          elementInteractions: true,
          formInteractions: true,
          fileDownloads: false,
          frustrationInteractions: true,
        },
      })
    )
  })
})
