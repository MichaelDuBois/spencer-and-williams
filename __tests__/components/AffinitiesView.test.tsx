import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AffinitiesView } from '@/components/AffinitiesView'
import { activeConfigAtom } from '@/stores/activeConfig'

import { GROUP_0 } from '@tests/helpers/customerGroups'
import { createTestStore } from '@tests/helpers/jotai-wrapper'
import {
  buildProvidersWrapper,
  createMockConfig,
} from '@tests/helpers/test-utils'

describe('AffinitiesView', () => {
  it.each([GROUP_0.token, 'realtime-group-token'])(
    'does not expose a group affinity page or request its profile: %s',
    (token) => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch')
      try {
        const store = createTestStore((s) =>
          s.set(
            activeConfigAtom,
            createMockConfig({
              slug: 'b2b-warehouse',
              features: {
                agentStudio: {},
                personalization: {
                  enabled: true,
                  personas: [{ ...GROUP_0, token }],
                },
              },
            }),
          ),
        )
        const { Wrapper } = buildProvidersWrapper({ store })
        render(<AffinitiesView token={token} />, { wrapper: Wrapper })
        expect(
          screen.getByText('Unknown personalization token.'),
        ).toBeInTheDocument()
        expect(screen.queryByText(GROUP_0.label)).not.toBeInTheDocument()
        expect(fetchSpy).not.toHaveBeenCalled()
      } finally {
        fetchSpy.mockRestore()
      }
    },
  )
})
