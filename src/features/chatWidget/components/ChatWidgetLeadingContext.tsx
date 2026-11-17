'use client'

import { useAtomValue } from 'jotai'

import { OrderContextCard } from '@/features/aiAssistant/components/OrderContextCard'
import { ProductContextCard } from '@/features/aiAssistant/components/ProductContextCard'
import { useProductContext } from '@/features/aiAssistant/hooks/useProductContext'
import { chatWidgetOrderContextState } from '@/features/aiAssistant/stores/aiAssistant'

/** Renders the product or order card immediately before the first user turn. */
export const ChatWidgetLeadingContext = () => {
  const productContext = useProductContext()
  const orderContext = useAtomValue(chatWidgetOrderContextState)

  // The wrapper itself is a `:has()` selector target, so an empty one would
  // still add a leading context row to the first message.
  if (!productContext && !orderContext) return <></>

  return (
    <div className="sw-ChatWidget-productContext">
      {orderContext ? (
        <OrderContextCard data={orderContext} />
      ) : (
        <ProductContextCard />
      )}
    </div>
  )
}
