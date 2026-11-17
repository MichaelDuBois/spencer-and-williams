import { act, fireEvent, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'

import { B2BWarehouseAssistantLayout } from '@/app/b2b-warehouse/_components/B2BWarehouseAssistantLayout'
import { activeConfigAtom } from '@/stores/activeConfig'
import { setPersonaModeAtom } from '@/stores/personalization'

import { GROUP_0, GROUP_1 } from '@tests/helpers/customerGroups'
import { createTestStore } from '@tests/helpers/jotai-wrapper'
import { createMockConfig, render } from '@tests/helpers/test-utils'

vi.mock('next/navigation', () => {
  return {
    usePathname: () => '/b2b-warehouse/search',
    useSearchParams: () => new URLSearchParams(),
  }
})
vi.mock('@/features/aiAssistant/components/AIAssistantPanel', () => {
  return { AIAssistantPanel: () => <input aria-label="Assistant prompt" /> }
})

it('resets assistant-local state while preserving the mounted storefront', () => {
  const store = createTestStore((s) => {
    s.set(activeConfigAtom, createMockConfig({ slug: 'b2b-warehouse' }))
    s.set(setPersonaModeAtom, GROUP_0)
  })
  render(
    <B2BWarehouseAssistantLayout>
      <input aria-label="Storefront input" />
    </B2BWarehouseAssistantLayout>,
    { store },
  )
  fireEvent.change(screen.getByLabelText('Storefront input'), {
    target: { value: 'drill' },
  })
  fireEvent.change(screen.getByLabelText('Assistant prompt'), {
    target: { value: 'group 0 question' },
  })
  act(() => store.set(setPersonaModeAtom, GROUP_1))
  expect(screen.getByLabelText('Storefront input')).toHaveValue('drill')
  expect(screen.getByLabelText('Assistant prompt')).toHaveValue('')
})
