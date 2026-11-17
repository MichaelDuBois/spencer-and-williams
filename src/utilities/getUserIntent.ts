const CONVERSATIONAL_PHRASES = [
  // First-person framing
  'i want',
  'i need',
  'i wonder',
  'i like',
  'i love',
  'i have',
  'i am looking',
  "i'm looking",
  'i am after',
  "i'm after",
  'i am searching',
  "i'm searching",
  'i am interested in',
  "i'm interested in",
  'i am trying to',
  "i'm trying to",
  'i would like',
  "i'd like",
  'we need',
  'we want',
  'my ',
  'for me',
  'for my',

  // Addressing the assistant
  'can you',
  'could you',
  'would you',
  'do you',
  'did you',
  'have you',
  'are you',
  'show me',
  'give me',
  'find me',
  'get me',
  'tell me',
  'guide me',
  'help me',
  'help with',
  'help choosing',
  'please',
  'recommend',
  'suggest',

  // Question framing
  'what should',
  'what are the',
  'what is the',
  "what's the",
  'what do you',
  'what can i',
  'what to wear',
  'which one',
  'which should',
  'where can i',
  'how do i',
  'how should i',
  'why is',
  'is there',
  'are there',
  'do i need',

  // Comparison and similarity
  'similar to',
  'something like',
  'sort of like',
  'kind of like',
  'closest to',
  'goes with',
  'match with',
  'matches my',
  'difference between',
  'compare',
  'versus',
  'vs ',
  'instead of',
  'better than',

  // Constraint phrasing. Bare comparators (`under`, `over`) are handled by
  // NUMERIC_FILTER_PATTERNS instead, so brands like "under armour" survive.
  'cheaper than',
  'more expensive than',
  'less than',
  'more than',
  'no more than',
  'at least',
  'up to',
  'starting at',
  'in my budget',
  'on a budget',

  // Styling requests
  'looking for',
  'looking to',
  'options for',
  'ideas for',
  'idea for',
  'suitable for',
  'appropriate for',
  'style me',
  'dress me',
  'put together',
  'build an outfit',
  'create an outfit',
  'create a look',
  'complete the look',
  'complete ensemble',
  'outfit for',
  'ensemble for',
  'to wear to',
  'to wear with',
  'goes well',
]

// A comparator qualifying a number is a request to apply a filter — "handbag
// under 100" wants a price ceiling, not the literal token "100". Requiring the
// digit keeps "under armour" and "over the knee boots" as keyword searches.
const NUMERIC_FILTER_PATTERNS = [
  /\b(under|over|above|below|within|around|max|maximum|min|minimum)\s+[$£€]?\d/,
  /\bbetween\s+[$£€]?\d/,
]

// Words that carry no product meaning. A query dominated by these reads as a
// sentence even when it contains none of the phrases above.
const FUNCTION_WORDS = new Set([
  'a',
  'about',
  'am',
  'an',
  'and',
  'any',
  'anything',
  'are',
  'as',
  'at',
  'be',
  'but',
  'can',
  'could',
  'do',
  'does',
  'for',
  'from',
  'have',
  'i',
  'if',
  'in',
  'is',
  'it',
  'like',
  'me',
  'my',
  'of',
  'on',
  'or',
  'should',
  'some',
  'something',
  'that',
  'the',
  'there',
  'these',
  'this',
  'to',
  'us',
  'we',
  'what',
  'which',
  'will',
  'with',
  'would',
  'you',
  'your',
])

const FUNCTION_WORD_RATIO_THRESHOLD = 0.4
const MIN_WORDS_FOR_RATIO_CHECK = 4
const SENTENCE_LENGTH_WORDS = 8

const PHRASE_PATTERNS = CONVERSATIONAL_PHRASES.map((phrase) => {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  // A trailing space means "followed by another word" — keep it as an explicit
  // separator instead of a word boundary, which would never match after a space.
  return phrase.endsWith(' ')
    ? new RegExp(`\\b${escaped.trimEnd()}\\s`)
    : new RegExp(`\\b${escaped}\\b`)
})

export const getUserIntent = (query: string): boolean => {
  // Normalise smart quotes so "what’s" and "what's" behave identically
  const normalised = query.trim().toLowerCase().replace(/[‘’]/g, "'")

  if (normalised.includes('?')) {
    return true
  }

  if (PHRASE_PATTERNS.some((pattern) => pattern.test(normalised))) {
    return true
  }

  if (NUMERIC_FILTER_PATTERNS.some((pattern) => pattern.test(normalised))) {
    return true
  }

  const words = normalised.split(/\s+/).filter(Boolean)

  if (words.length >= SENTENCE_LENGTH_WORDS) {
    return true
  }

  if (words.length < MIN_WORDS_FOR_RATIO_CHECK) {
    return false
  }

  const functionWordCount = words.filter((word) =>
    FUNCTION_WORDS.has(word.replace(/[^a-z']/g, '')),
  ).length

  return functionWordCount / words.length > FUNCTION_WORD_RATIO_THRESHOLD
}
