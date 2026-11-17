'use client'

import { useEffect, useRef } from 'react'

import { useOpenAssistantPanel } from '@/features/aiAssistant'
import { useChatWidgetMode } from '@/features/chatWidget/hooks/useChatWidgetMode'

interface UseAIButtonInjectionParams {
  enabled: boolean
  basePath: string
}

const AI_BUTTON_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
  </svg>
`

const getInputValue = (): string => {
  const input = document.querySelector<HTMLInputElement>(
    '.ais-AutocompleteForm input',
  )
  return input?.value?.trim() || ''
}

/**
 * Injects an AI mode button into the Algolia autocomplete form.
 * Opens the AI assistant with the current query when clicked.
 */
export const useAIButtonInjection = ({
  enabled,
  basePath,
}: UseAIButtonInjectionParams) => {
  const mode = useChatWidgetMode(basePath)
  const { openWithMessage } = useOpenAssistantPanel({ basePath })
  // `openWithMessage` is a new function every render; read it via a ref so the
  // effect below doesn't tear down and re-attach the MutationObserver on
  // every render.
  const openWithMessageRef = useRef(openWithMessage)
  useEffect(() => {
    openWithMessageRef.current = openWithMessage
  }, [openWithMessage])

  useEffect(() => {
    if (!enabled) return

    const handleAIButtonClick = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()

      const query = getInputValue()

      // Blur the autocomplete input to prevent it from firing additional events
      const input = document.querySelector<HTMLInputElement>(
        '.ais-AutocompleteForm input',
      )
      if (input) input.blur()

      openWithMessageRef.current(query, {
        navigate: false,
        keepQuery: true,
        clearHistory: false,
        expanded: mode === 'fullscreen',
      })
    }

    const createAIButton = () => {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'aa-AIButton'
      button.innerHTML = `${AI_BUTTON_SVG}<span>AI Mode</span>`
      button.addEventListener('click', handleAIButtonClick)
      return button
    }

    const injectButton = () => {
      // Inject into the autocomplete form (button inside form is valid)
      const form = document.querySelector('.ais-AutocompleteForm')
      if (form && !form.querySelector('.aa-AIButton')) {
        form.appendChild(createAIButton())
      }

      // For the detached search button, inject as a sibling into its parent
      // to avoid nesting a button inside a button (invalid HTML)
      const detachedBtn = document.querySelector(
        '.ais-AutocompleteDetachedSearchButton',
      )
      if (
        detachedBtn?.parentElement &&
        !detachedBtn.parentElement.querySelector('.aa-AIButton')
      ) {
        detachedBtn.parentElement.appendChild(createAIButton())
      }
    }

    injectButton()

    const observer = new MutationObserver(() => injectButton())
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      document.querySelectorAll('.aa-AIButton').forEach((btn) => btn.remove())
    }
  }, [enabled, mode])
}
