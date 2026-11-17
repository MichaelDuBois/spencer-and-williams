import type { OrderContextData } from '@/features/aiAssistant/types'
import type { OrderBase } from '@/stores/order'

/** Selects the order fields that are safe and useful to send to the assistant. */
export const toOrderContext = ({ id, items }: OrderBase): OrderContextData => {
  return {
    orderId: id,
    items: items.map((item) => {
      return {
        objectID: item.objectID,
        name: item.name,
        image: item.image,
        price: item.price,
      }
    }),
  }
}

/** Formats a completed order as context for an AI conversation. */
export const buildOrderContextNote = ({
  orderId,
  items,
}: OrderContextData): string => {
  const productNames = items.map((item) => item.name).join(', ')

  return `[Order context: Order ${orderId} containing: ${productNames}]`
}
