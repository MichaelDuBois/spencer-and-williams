import { describe, expect, it } from 'vitest'

import { shouldRenderSearchIndexResults } from '@/features/chatWidget/tools/searchIndexTool'

describe('shouldRenderSearchIndexResults', () => {
  it('hides native results when grouped results are present', () => {
    expect(
      shouldRenderSearchIndexResults({
        parts: [{ type: 'tool-algolia_grouped_results' }],
      }),
    ).toBe(false)
  })

  it('shows native results when grouped results are absent', () => {
    expect(
      shouldRenderSearchIndexResults({
        parts: [{ type: 'tool-algolia_search_index_ecommerce_ns_prod' }],
      }),
    ).toBe(true)
  })
})
