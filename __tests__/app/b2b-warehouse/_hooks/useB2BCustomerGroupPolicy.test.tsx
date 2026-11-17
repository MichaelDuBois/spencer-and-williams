import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useB2BCustomerGroupPolicy } from '@/app/b2b-warehouse/_hooks/useB2BCustomerGroupPolicy'
import { PERSONAS } from '@/app/b2b-warehouse/personas'
import { activeConfigAtom } from '@/stores/activeConfig'
import {
  setPersonaModeAtom,
  setRealtimeModeAtom,
} from '@/stores/personalization'
import {
  ignoredUrlStoreIdAtom,
  selectedStoreAtom,
  selectedStoreStore,
} from '@/stores/selectedStore'

import { GROUP_0, GROUP_1 } from '@tests/helpers/customerGroups'
import {
  buildJotaiWrapper,
  createTestStore,
} from '@tests/helpers/jotai-wrapper'
import { createMockConfig } from '@tests/helpers/test-utils'

const route = vi.hoisted(() => {return { query: '' }})

vi.mock('next/navigation', () => {return {
  useSearchParams: () => new URLSearchParams(route.query),
}})

describe('useB2BCustomerGroupPolicy', () => {
  beforeEach(() => {
    route.query = ''
    selectedStoreStore.set(ignoredUrlStoreIdAtom, null)
  })

  it('uses the URL warehouse before the selected store hydrates', () => {
    route.query = 'storeId=1'
    const store = createTestStore((s) => {
      s.set(activeConfigAtom, createMockConfig({ slug: 'b2b-warehouse' }))
      s.set(setPersonaModeAtom, GROUP_0)
    })
    const { result } = renderHook(() => useB2BCustomerGroupPolicy(), {
      wrapper: buildJotaiWrapper(store),
    })

    expect(result.current).toEqual({
      status: 'ready',
      groupId: GROUP_0.groupId,
      discount: 0.15,
      warehouseId: '1',
    })
  })

  it('ignores a URL warehouse the user cleared in this vertical', () => {
    route.query = 'storeId=1'
    const store = createTestStore((s) => {
      s.set(activeConfigAtom, createMockConfig({ slug: 'b2b-warehouse' }))
    })
    selectedStoreStore.set(ignoredUrlStoreIdAtom, {
      vertical: 'b2b-warehouse',
      storeId: '1',
    })
    const { result } = renderHook(() => useB2BCustomerGroupPolicy(), {
      wrapper: buildJotaiWrapper(store),
    })
    expect(result.current).toMatchObject({ warehouseId: null })
  })

  it('keeps the URL warehouse when the ignore belongs to another vertical', () => {
    route.query = 'storeId=1'
    const store = createTestStore((s) => {
      s.set(activeConfigAtom, createMockConfig({ slug: 'b2b-warehouse' }))
    })
    selectedStoreStore.set(ignoredUrlStoreIdAtom, {
      vertical: 'grocery',
      storeId: '1',
    })
    const { result } = renderHook(() => useB2BCustomerGroupPolicy(), {
      wrapper: buildJotaiWrapper(store),
    })
    expect(result.current).toMatchObject({ warehouseId: '1' })
  })

  it('follows the existing profile and warehouse state through mode changes', () => {
    const store = createTestStore((s) => {
      s.set(activeConfigAtom, createMockConfig({ slug: 'b2b-warehouse' }))
      s.set(setPersonaModeAtom, GROUP_0)
    })
    const { result } = renderHook(() => useB2BCustomerGroupPolicy(), {
      wrapper: buildJotaiWrapper(store),
    })
    expect(result.current).toEqual({
      status: 'ready',
      groupId: GROUP_0.groupId,
      discount: 0.15,
      warehouseId: null,
    })

    act(() =>
      store.set(selectedStoreAtom, { vertical: 'b2b-warehouse', storeId: '1' }),
    )
    expect(result.current).toMatchObject({
      groupId: GROUP_0.groupId,
      warehouseId: '1',
    })
    act(() => store.set(setPersonaModeAtom, GROUP_1))
    expect(result.current).toMatchObject({
      groupId: GROUP_1.groupId,
      discount: 0.3,
      warehouseId: '1',
    })
    act(() => store.set(setRealtimeModeAtom))
    expect(result.current).toMatchObject({
      groupId: null,
      discount: 0,
      warehouseId: '1',
    })
    act(() => store.set(setPersonaModeAtom, PERSONAS[0]))
    expect(result.current).toMatchObject({
      groupId: null,
      discount: 0,
      warehouseId: '1',
    })
    act(() => store.set(setPersonaModeAtom, null))
    act(() => store.set(selectedStoreAtom, null))
    expect(result.current).toEqual({
      status: 'ready',
      groupId: null,
      discount: 0,
      warehouseId: null,
    })
  })

  it('stays inactive until B2B config is available and outside the B2B vertical', () => {
    const store = createTestStore((s) => s.set(setPersonaModeAtom, GROUP_0))
    const { result } = renderHook(() => useB2BCustomerGroupPolicy(), {
      wrapper: buildJotaiWrapper(store),
    })
    expect(result.current).toEqual({ status: 'inactive' })
    act(() =>
      store.set(activeConfigAtom, createMockConfig({ slug: 'fashion' })),
    )
    expect(result.current).toEqual({ status: 'inactive' })
  })

  it('exposes invalid configuration without replacing it with an anonymous policy', () => {
    const store = createTestStore((s) => {
      s.set(activeConfigAtom, createMockConfig({ slug: 'b2b-warehouse' }))
      s.set(setPersonaModeAtom, { ...GROUP_0, discount: NaN })
    })
    const { result } = renderHook(() => useB2BCustomerGroupPolicy(), {
      wrapper: buildJotaiWrapper(store),
    })
    expect(result.current).toEqual({ status: 'invalid', reason: 'group' })
  })
})
