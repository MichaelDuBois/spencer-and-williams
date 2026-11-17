import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useIntentRouting } from '@/hooks/useIntentRouting'
import { activeConfigAtom } from '@/stores/activeConfig'
import {
  demoOptionsStore,
  intentRoutingEnabledAtom,
} from '@/stores/demoOptions'

import { createTestStore } from '../helpers/jotai-wrapper'
import { buildProvidersWrapper, createMockConfig } from '../helpers/test-utils'

const openWithMessageMock = vi.fn()
const useIsAIAssistantRouteMock = vi.fn()

// Mocked as a whole module so the barrel's component exports (AIAssistantPanel
// and its agent/streaming tree) never load in jsdom.
vi.mock('@/features/aiAssistant', () => {return {
  useIsAIAssistantRoute: () => useIsAIAssistantRouteMock(),
  useOpenAssistantPanel: () => {return { openWithMessage: openWithMessageMock }},
}})

const AI_MODE_OPTIONS = { navigate: false, clearHistory: false }

interface RouteOptions {
  enabledInConfig?: boolean
  toggledOn?: boolean
}

const route = (
  query: string,
  { enabledInConfig = true, toggledOn = true }: RouteOptions = {},
) => {
  const store = createTestStore((s) => {
    s.set(
      activeConfigAtom,
      createMockConfig({
        features: {
          agentStudio: {},
          intentRouting: { enabled: enabledInConfig },
        },
      }),
    )
  })

  demoOptionsStore.set(intentRoutingEnabledAtom, toggledOn)

  const { result } = renderHook(() => useIntentRouting('/fashion'), {
    wrapper: buildProvidersWrapper({ store }).Wrapper,
  })

  return result.current.routeIfConversational(query)
}

describe('useIntentRouting', () => {
  beforeEach(() => {
    demoOptionsStore.set(intentRoutingEnabledAtom, false)
    openWithMessageMock.mockReset()
    // Default: a route the assistant panel can mount on, e.g. a PDP.
    useIsAIAssistantRouteMock.mockReturnValue({
      isHomepage: false,
      isValidRoute: true,
    })
  })

  it('routes a conversational query to the assistant', () => {
    expect(route('can you recommend a wool coat')).toBe(true)
    expect(openWithMessageMock).toHaveBeenCalledWith(
      'can you recommend a wool coat',
      { expanded: false, ...AI_MODE_OPTIONS },
    )
  })

  it('trims the query before handing it to the assistant', () => {
    expect(route('   what should i wear to a wedding   ')).toBe(true)
    expect(openWithMessageMock).toHaveBeenCalledWith(
      'what should i wear to a wedding',
      { expanded: false, ...AI_MODE_OPTIONS },
    )
  })

  it('opens fullscreen on the vertical homepage', () => {
    useIsAIAssistantRouteMock.mockReturnValue({
      isHomepage: true,
      isValidRoute: false,
    })

    expect(route('can you recommend a wool coat')).toBe(true)
    expect(openWithMessageMock).toHaveBeenCalledWith(
      'can you recommend a wool coat',
      { expanded: true, ...AI_MODE_OPTIONS },
    )
  })

  it('leaves a keyword query to the traditional search path', () => {
    expect(route('wool coat')).toBe(false)
    expect(openWithMessageMock).not.toHaveBeenCalled()
  })

  it('does not route an empty or whitespace-only query', () => {
    expect(route('')).toBe(false)
    expect(route('   ')).toBe(false)
    expect(openWithMessageMock).not.toHaveBeenCalled()
  })

  it('does not route when the vertical opts out in config', () => {
    expect(
      route('can you recommend a wool coat', { enabledInConfig: false }),
    ).toBe(false)
    expect(openWithMessageMock).not.toHaveBeenCalled()
  })

  it('does not route when the demo toggle is off', () => {
    expect(route('can you recommend a wool coat', { toggledOn: false })).toBe(
      false,
    )
    expect(openWithMessageMock).not.toHaveBeenCalled()
  })

  it('does not route by default, before the demo toggle is switched on', () => {
    const store = createTestStore((s) => {
      s.set(
        activeConfigAtom,
        createMockConfig({
          features: { agentStudio: {}, intentRouting: { enabled: true } },
        }),
      )
    })

    const { result } = renderHook(() => useIntentRouting('/fashion'), {
      wrapper: buildProvidersWrapper({ store }).Wrapper,
    })

    expect(result.current.routeIfConversational('can you recommend a coat')).toBe(
      false,
    )
    expect(openWithMessageMock).not.toHaveBeenCalled()
  })

  it('does not route where the assistant panel cannot mount', () => {
    // Store locator / map routes are in neither isValidRoute nor isHomepage.
    useIsAIAssistantRouteMock.mockReturnValue({
      isHomepage: false,
      isValidRoute: false,
    })

    expect(route('can you recommend a wool coat')).toBe(false)
    expect(openWithMessageMock).not.toHaveBeenCalled()
  })
})
