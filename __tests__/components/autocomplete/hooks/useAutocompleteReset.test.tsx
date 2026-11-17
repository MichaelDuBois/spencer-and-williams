import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAutocompleteReset } from '@/components/autocomplete/hooks/useAutocompleteReset'

import type { FormEvent } from 'react'

const { refine } = vi.hoisted(() => {return { refine: vi.fn() }})

vi.mock('react-instantsearch', () => {return {
  useSearchBox: () => {return { refine }},
}})

const createResetEvent = (target: EventTarget) => {
  const preventDefault = vi.fn()
  const stopPropagation = vi.fn()
  const event = {
    target,
    preventDefault,
    stopPropagation,
  } as unknown as FormEvent<HTMLDivElement>
  return { event, preventDefault, stopPropagation }
}

const createForm = (inputAttributes: Record<string, string> = {}) => {
  const form = document.createElement('form')
  const input = document.createElement('input')
  input.className = 'ais-AutocompleteInput'
  Object.entries(inputAttributes).forEach(([name, value]) =>
    input.setAttribute(name, value),
  )
  form.append(input)
  return form
}

describe('useAutocompleteReset', () => {
  beforeEach(() => {
    refine.mockClear()
  })

  it('ignores resets whose target is not a form', () => {
    const { result } = renderHook(() => useAutocompleteReset())
    const { event, preventDefault, stopPropagation } = createResetEvent(
      document.createElement('div'),
    )

    expect(() => result.current(event)).not.toThrow()
    expect(refine).not.toHaveBeenCalled()
    expect(preventDefault).not.toHaveBeenCalled()
    expect(stopPropagation).not.toHaveBeenCalled()
  })

  it('ignores forms without an autocomplete input', () => {
    const { result } = renderHook(() => useAutocompleteReset())
    const { event, preventDefault } = createResetEvent(
      document.createElement('form'),
    )

    result.current(event)
    expect(refine).not.toHaveBeenCalled()
    expect(preventDefault).not.toHaveBeenCalled()
  })

  it('leaves the active autocomplete to its own reset handler', () => {
    const { result } = renderHook(() => useAutocompleteReset())
    const { event, preventDefault } = createResetEvent(
      createForm({ 'aria-expanded': 'false' }),
    )

    result.current(event)
    expect(refine).not.toHaveBeenCalled()
    expect(preventDefault).not.toHaveBeenCalled()
  })

  it('clears the query for the inactive autocomplete shell', () => {
    const { result } = renderHook(() => useAutocompleteReset())
    const { event, preventDefault, stopPropagation } = createResetEvent(
      createForm(),
    )

    result.current(event)
    expect(refine).toHaveBeenCalledWith('')
    expect(preventDefault).toHaveBeenCalledOnce()
    expect(stopPropagation).toHaveBeenCalledOnce()
  })
})
