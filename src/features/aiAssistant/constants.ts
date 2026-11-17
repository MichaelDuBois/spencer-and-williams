export const MOBILE_BREAKPOINT = 1023
export const MAX_VISIBLE_ITEMS = 4
export const AGENT_REQUEST_TIMEOUT_MS = 30_000
export const PROFILE_REQUEST_TIMEOUT_MS = 10_000
export const IMAGE_ONLY_RESPONSE_INSTRUCTION =
  '[Mandatory response rules for this turn: The user uploaded an image without any accompanying message. Any bracketed image-upload text in the request is an internal transport marker, not a message from the user. First search for catalog items genuinely similar to the item in the image. Your reply MUST begin with exactly one of these sentences. If you found at least one genuinely similar item, begin: "No message with your image? Here’s what comes closest." If you found no genuinely similar item, begin: "No message with your image? I couldn’t find a close match." Do not omit, soften, paraphrase, or precede this opening sentence. Use the "Here’s what comes closest" sentence only when you actually found close matches, and never present unrelated items as matches. After the opening, show any close matches you found or ask for the item type, brand, or other details. Do not imply that the user asked to find similar items.]'
// Hidden text for image-only turns; InstantSearch Chat needs a non-empty message.
export const IMAGE_ONLY_MESSAGE = '[Image uploaded without accompanying text]'
