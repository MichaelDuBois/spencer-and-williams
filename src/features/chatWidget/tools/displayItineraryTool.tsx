'use client'

import { motion } from 'motion/react'

import { ChatItineraryMessage } from '@/features/chatWidget/components/ChatItineraryMessage'
import { useCollapseChatWidgetPanel } from '@/features/chatWidget/components/chatWidgetPanelContext'
import { createSanitizingToolCall } from '@/features/chatWidget/tools/shared'
import { sanitizeItineraryData } from '@/features/chatWidget/utils/itineraryDisplay'
import { DURATION_LAYOUT, EASE_SMOOTH } from '@/lib/animations'

import type { ClientSideToolComponentProps } from 'instantsearch-ui-components'
import type { Tool } from 'react-instantsearch'

/** Quiet placeholder shown while streamed input has nothing renderable yet. */
const ItineraryStreamSkeleton = () => (
  <motion.div
    className="bg-muted rounded-card h-24"
    animate={{ opacity: [0.4, 1, 0.4] }}
    transition={{
      duration: DURATION_LAYOUT,
      ease: EASE_SMOOTH,
      repeat: Infinity,
    }}
    aria-hidden
  />
)

const DisplayItineraryToolMessage = ({
  context,
}: ClientSideToolComponentProps) => {
  const collapsePanel = useCollapseChatWidgetPanel()

  if (context.message.state === 'input-streaming') {
    // Streaming preview (`streamInput: true`): render whatever already
    // validates from the agent's partial arguments. The preview reads `input`
    // only — never the output, and never calls addToolResult; the echoed
    // output stays the source of truth once it arrives.
    const preview = sanitizeItineraryData(context.message.input)
    if (!preview) return <ItineraryStreamSkeleton />

    return (
      <div aria-busy="true">
        <ChatItineraryMessage data={preview} isStreaming />
      </div>
    )
  }

  if (context.message.state !== 'output-available') return <></>

  const data = sanitizeItineraryData(context.message.output)
  if (!data) return <></>

  return <ChatItineraryMessage data={data} onLinkClick={collapsePanel} />
}

/**
 * Render-only client tool for the Agent Studio travel agent: the agent
 * composes a structured itinerary as the tool arguments and the widget renders
 * them as day-by-day cards, previewing the itinerary while the arguments
 * stream in. No client-side search happens here — malformed arguments degrade
 * to "nothing rendered" rather than an error.
 */
export const displayItineraryTool: Tool = {
  streamInput: true,
  onToolCall: createSanitizingToolCall(sanitizeItineraryData),
  layoutComponent: DisplayItineraryToolMessage,
}
