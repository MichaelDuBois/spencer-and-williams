import { describe, expect, it } from 'vitest'

import {
  availableTools,
  getToolHandler,
  isServerExecutedTool,
  isValidTool,
} from '@/features/aiAssistant/tools/registry'

describe('tool registry', () => {
  it('returns the handler for each registered tool name', () => {
    expect(getToolHandler('search')?.name).toBe('search')
    expect(getToolHandler('displayResults')?.name).toBe('displayResults')
    expect(getToolHandler('displayOrders')?.name).toBe('displayOrders')
    expect(getToolHandler('suggestActions')?.name).toBe('suggestActions')
  })

  it('returns undefined for an unknown tool name', () => {
    expect(getToolHandler('nope')).toBeUndefined()
  })

  it('validates tool names against the registry', () => {
    expect(isValidTool('search')).toBe(true)
    expect(isValidTool('nope')).toBe(false)
  })

  it('lists every registered tool name', () => {
    expect(availableTools).toEqual(
      expect.arrayContaining([
        'search',
        'displayResults',
        'displayOrders',
        'suggestActions',
      ]),
    )
    expect(availableTools).toHaveLength(4)
  })

  it('recognizes built-in server-executed index-search tools', () => {
    expect(isServerExecutedTool('algolia_search_index_support_faq')).toBe(true)
    expect(isServerExecutedTool('algolia_search_index_products')).toBe(true)
  })

  it('does not treat client-handled or unknown tools as server-executed', () => {
    expect(isServerExecutedTool('search')).toBe(false)
    expect(isServerExecutedTool('displayResults')).toBe(false)
    expect(isServerExecutedTool('displayOrders')).toBe(false)
    expect(isServerExecutedTool('')).toBe(false)
  })
})
