import { useEffect, useRef } from 'react'

/**
 * Calls `onEscape` when the Escape key is pressed while `enabled` is true.
 * The handler is kept in a ref so changing its identity between renders does
 * not re-subscribe the keydown listener.
 */
export const useEscapeKey = (onEscape: () => void, enabled = true): void => {
  const handlerRef = useRef(onEscape)

  useEffect(() => {
    handlerRef.current = onEscape
  }, [onEscape])

  useEffect(() => {
    if (!enabled) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handlerRef.current()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled])
}
