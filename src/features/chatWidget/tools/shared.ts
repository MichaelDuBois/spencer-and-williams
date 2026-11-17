import { isPlainRecord } from '@/utilities/isPlainRecord'

import type { Tool } from 'react-instantsearch'

type ToolCallHandler = NonNullable<Tool['onToolCall']>

/**
 * Standard `onToolCall` for render-only client tools: the sanitized record
 * becomes the echoed tool output, and any non-record input degrades to a
 * `null` output the layout component renders nothing for.
 */
export const createSanitizingToolCall =
  <T>(sanitize: (input: unknown) => T | null): ToolCallHandler =>
  async ({ input, addToolResult }) => {
    await addToolResult({
      output: isPlainRecord(input) ? sanitize(input) : null,
    })
  }
