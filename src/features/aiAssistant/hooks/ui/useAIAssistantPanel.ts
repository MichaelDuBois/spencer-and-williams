import { useAtom } from 'jotai'

import { MOBILE_BREAKPOINT } from '@/features/aiAssistant/constants'
import {
  isAIAssistantExpandedState,
  isAIAssistantOpenState,
} from '@/features/aiAssistant/stores/aiAssistant'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { CLIP_PATH_HIDDEN_RIGHT, CLIP_PATH_VISIBLE } from '@/lib/animations'

// Must match --assistant-panel-width in globals.css
const PANEL_WIDTH = 400

export const useAIAssistantPanel = () => {
  const [isOpen, setIsOpen] = useAtom(isAIAssistantOpenState)
  const [isExpanded, setIsExpanded] = useAtom(isAIAssistantExpandedState)
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`)

  const handleClose = () => {
    setIsOpen(false)
    setIsExpanded(false)
  }

  const handleToggleExpand = () => {
    setIsExpanded((prev: boolean) => !prev)
  }

  const getWidth = (): number | string => {
    if (!isOpen) return 0
    if (isMobile || isExpanded) return '100%'
    return PANEL_WIDTH
  }

  const getClipPath = (): string =>
    isOpen ? CLIP_PATH_VISIBLE : CLIP_PATH_HIDDEN_RIGHT

  return {
    isOpen,
    isExpanded,
    isMobile,
    handleClose,
    handleToggleExpand,
    width: getWidth(),
    clipPath: getClipPath(),
  }
}
