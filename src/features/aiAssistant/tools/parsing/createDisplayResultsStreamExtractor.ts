// =============================================================================
// Generic streaming JSON extractor for the `displayResults` tool.
// -----------------------------------------------------------------------------
// The agent streams a JSON object of the rough shape:
//
//   { "intro": "...", "groups": [{ "title": "...", "type": "...", "why": "...",
//                                  "items": [{ "objectID": "...", "why": "..." }] }] }
//
// Each vertical (ecommerce, travel, b2b-content) varies only in:
//   - the items array field name (`products` vs `items`),
//   - whether a `type` discriminator exists, and which literal values it allows,
//   - the validation predicate used to decide a fully parsed group is keepable.
//
// This factory captures the shared brace-depth scanning + regex-based partial
// extraction once, so each per-vertical parser becomes a thin config wrapper.
// =============================================================================

interface BasePartial {
  title: string | null
  why: string | null
  /**
   * True once the group's items array has been fully streamed (its closing `]`
   * has arrived), even if the group object `}` hasn't. Lets the UI stop showing
   * a trailing "loading next item" skeleton for a group that is already full.
   */
  itemsComplete?: boolean
}

export interface StreamExtractorResult<TGroup, TPartial> {
  intro: string
  answer: string
  groups: TGroup[]
  streamingGroup: TPartial | null
}

export interface StreamExtractorConfig<TPartial extends BasePartial> {
  /** Name of the per-item array field inside a group (e.g. `items`, `products`). */
  itemsField: string
  /**
   * Optional discriminator pattern. When provided, must capture the matched
   * literal value as group 1 (e.g. /"type"\s*:\s*"(articles|podcasts)"/).
   */
  typePattern?: RegExp
  /** Predicate that decides whether a fully parsed group is keepable. */
  validateCompleteGroup: (group: unknown) => boolean
  /** Builds an empty partial group with all keys present. */
  createPartial: () => TPartial
  /** Assigns a successfully matched type discriminator onto the partial. */
  setPartialType?: (partial: TPartial, value: string) => void
  /** Pushes a parsed item (must have an objectID) onto the partial. */
  pushItem: (partial: TPartial, item: unknown) => void
}

// A JSON string body: any char that isn't a quote or backslash, or an escape
// sequence. Matching `\"` as a unit is what stops a title like `He said \"hi\"`
// from being cut short at the first escaped quote.
const JSON_STRING_BODY = String.raw`(?:[^"\\]|\\.)*`

const TITLE_PATTERN = new RegExp(`"title"\\s*:\\s*"(${JSON_STRING_BODY})"`)
const WHY_PATTERN = new RegExp(`"why"\\s*:\\s*"(${JSON_STRING_BODY})"`)
const GROUPS_START_PATTERN = /"groups"\s*:\s*\[/
// Capture the intro and answer even while still streaming (no closing quote
// yet), so both sentences render progressively above the results.
const INTRO_PATTERN = new RegExp(`"intro"\\s*:\\s*"(${JSON_STRING_BODY})`)
const ANSWER_PATTERN = new RegExp(`"answer"\\s*:\\s*"(${JSON_STRING_BODY})`)

const JSON_ESCAPES: Record<string, string> = {
  '"': '"',
  '\\': '\\',
  '/': '/',
  b: '\b',
  f: '\f',
  n: '\n',
  r: '\r',
  t: '\t',
}

// Unknown or half-streamed escapes (`\u12` at the buffer edge) are left as-is;
// they resolve on a later chunk, and the final render is JSON.parse'd anyway.
const unescapeJsonString = (value: string): string =>
  value.replace(
    /\\u([0-9a-fA-F]{4})|\\(.)/g,
    (match, hex: string | undefined, char: string) =>
      hex === undefined
        ? (JSON_ESCAPES[char] ?? match)
        : String.fromCharCode(parseInt(hex, 16)),
  )

/**
 * Walk a string and split it into top-level `{...}` objects via brace depth.
 * Returns the fully-closed objects and an optional trailing partial object
 * (the one we're still streaming).
 */
const splitTopLevelObjects = (
  text: string,
): { complete: string[]; partial: string | null } => {
  const complete: string[] = []
  let depth = 0
  let currentStart = -1

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (char === '{') {
      if (depth === 0) currentStart = i
      depth++
    } else if (char === '}') {
      depth--
      if (depth === 0 && currentStart !== -1) {
        complete.push(text.slice(currentStart, i + 1))
        currentStart = -1
      }
    }
  }

  const partial =
    depth > 0 && currentStart !== -1 ? text.slice(currentStart) : null

  return { complete, partial }
}

/**
 * Whether the items array (starting right after its opening `[`) has been
 * closed by a top-level `]`. Item objects `{...}` are skipped via brace depth,
 * so the `]` that closes the array — not one nested inside an object — is found.
 */
const isItemsArrayClosed = (afterItemsStart: string): boolean => {
  let depth = 0
  for (const char of afterItemsStart) {
    if (char === '{') depth++
    else if (char === '}') depth--
    else if (char === ']' && depth === 0) return true
  }
  return false
}

export const createDisplayResultsStreamExtractor = <
  TGroup,
  TPartial extends BasePartial,
>(
  config: StreamExtractorConfig<TPartial>,
) => {
  const itemsArrayPattern = new RegExp(`"${config.itemsField}"\\s*:\\s*\\[`)

  const parsePartial = (partialStr: string): TPartial | null => {
    const partial = config.createPartial()

    const titleMatch = partialStr.match(TITLE_PATTERN)
    if (titleMatch) partial.title = unescapeJsonString(titleMatch[1])

    if (config.typePattern && config.setPartialType) {
      const typeMatch = partialStr.match(config.typePattern)
      if (typeMatch) config.setPartialType(partial, typeMatch[1])
    }

    const whyMatch = partialStr.match(WHY_PATTERN)
    if (whyMatch) partial.why = unescapeJsonString(whyMatch[1])

    const itemsStartMatch = partialStr.match(itemsArrayPattern)
    if (itemsStartMatch) {
      const itemsStartIndex = itemsStartMatch.index! + itemsStartMatch[0].length
      const afterItemsStart = partialStr.slice(itemsStartIndex)

      const { complete } = splitTopLevelObjects(afterItemsStart)
      for (const itemStr of complete) {
        try {
          const item = JSON.parse(itemStr) as { objectID?: unknown }
          if (item.objectID) config.pushItem(partial, item)
        } catch {
          // Skip invalid items
        }
      }

      partial.itemsComplete = isItemsArrayClosed(afterItemsStart)
    }

    return partial.title ? partial : null
  }

  return (jsonBuffer: string): StreamExtractorResult<TGroup, TPartial> => {
    const result: StreamExtractorResult<TGroup, TPartial> = {
      intro: '',
      answer: '',
      groups: [],
      streamingGroup: null,
    }

    const introMatch = jsonBuffer.match(INTRO_PATTERN)
    if (introMatch) result.intro = unescapeJsonString(introMatch[1])

    const answerMatch = jsonBuffer.match(ANSWER_PATTERN)
    if (answerMatch) result.answer = unescapeJsonString(answerMatch[1])

    const groupsStartMatch = jsonBuffer.match(GROUPS_START_PATTERN)
    if (!groupsStartMatch) return result

    const afterGroupsStart = jsonBuffer.slice(
      groupsStartMatch.index! + groupsStartMatch[0].length,
    )

    const { complete, partial } = splitTopLevelObjects(afterGroupsStart)

    for (const groupStr of complete) {
      try {
        const group = JSON.parse(groupStr)
        if (config.validateCompleteGroup(group)) {
          result.groups.push(group as TGroup)
        }
      } catch {
        // Skip invalid groups
      }
    }

    if (partial) {
      const partialGroup = parsePartial(partial)
      if (partialGroup) result.streamingGroup = partialGroup
    }

    return result
  }
}
