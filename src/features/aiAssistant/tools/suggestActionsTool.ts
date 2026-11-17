import type {
  GartnerQuadrant,
  SuggestAction,
  ToolHandler,
  ToolExecutionContext,
  ToolExecutionResult,
} from '@/features/aiAssistant/types'

export const SUGGEST_ACTIONS_TOOL_NAME = 'suggestActions'

interface SuggestActionsArgs {
  actions: SuggestAction[]
  gartnerQuadrant?: GartnerQuadrant
}

const parseGartnerQuadrant = (raw: unknown): GartnerQuadrant | undefined => {
  const candidate = raw as Partial<GartnerQuadrant> | undefined
  if (
    typeof candidate?.imageUrl === 'string' &&
    !!candidate.imageUrl &&
    typeof candidate?.url === 'string' &&
    !!candidate.url
  ) {
    return { imageUrl: candidate.imageUrl, url: candidate.url }
  }
  return undefined
}

export const parseSuggestActionsArgs = (
  args: Record<string, unknown>,
): SuggestActionsArgs | null => {
  const raw = (args as { actions?: unknown }).actions
  const actions = Array.isArray(raw)
    ? raw.filter(
        (action): action is SuggestAction =>
          typeof (action as SuggestAction)?.label === 'string' &&
          !!(action as SuggestAction).label &&
          typeof (action as SuggestAction)?.url === 'string' &&
          !!(action as SuggestAction).url,
      )
    : []
  const gartnerQuadrant = parseGartnerQuadrant(
    (args as { gartnerQuadrant?: unknown }).gartnerQuadrant,
  )
  if (!actions.length && !gartnerQuadrant) return null
  return { actions, gartnerQuadrant }
}

const executeSuggestActions = async (
  data: SuggestActionsArgs,
  context: ToolExecutionContext,
): Promise<ToolExecutionResult> => {
  context.appendSuggestActions(
    context.assistantMessageId,
    data.actions,
    data.gartnerQuadrant,
  )
  return {}
}

export const suggestActionsToolHandler: ToolHandler<SuggestActionsArgs> = {
  name: SUGGEST_ACTIONS_TOOL_NAME,
  parseArgs: parseSuggestActionsArgs,
  execute: executeSuggestActions,
}
