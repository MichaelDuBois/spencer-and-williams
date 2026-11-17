'use client'

import { Send, Square } from 'lucide-react'
import { type FormEvent, type KeyboardEvent, type ChangeEvent } from 'react'

import {
  ImageUploadButton,
  ImageUploadPreview,
} from '@/features/aiAssistant/components/ImageUpload'
import { useChatPromptImageSubmission } from '@/features/chatWidget/hooks/useChatPromptImageSubmission'

import type { ChatPromptOwnProps } from 'instantsearch-ui-components'

const CHAT_BUSY_STATUSES = new Set(['submitted', 'streaming'])

export const ChatPrompt = ({
  value = '',
  placeholder,
  status = 'ready',
  disabled = false,
  autoFocus = true,
  translations,
  onInput,
  onSubmit,
  onStop,
  promptRef,
  headerComponent: HeaderComponent,
}: ChatPromptOwnProps) => {
  const {
    uploaded,
    uploadError,
    analysisError,
    isAnalyzingImage,
    uploadFile,
    clear,
    submitUploadedImage,
  } = useChatPromptImageSubmission({ value, onInput })
  const hasValue = value.trim().length > 0
  const canStop = CHAT_BUSY_STATUSES.has(status)
  const isAnalysisPending = isAnalyzingImage && !canStop
  const isSubmitDisabled =
    (!hasValue && !uploaded && !canStop) || disabled || isAnalyzingImage
  const submitLabel = canStop
    ? (translations?.stopResponseTooltip ?? 'Stop response')
    : isAnalysisPending
      ? 'Analyzing image'
      : hasValue || uploaded
        ? (translations?.sendMessageTooltip ?? 'Send message')
        : (translations?.emptyMessageTooltip ?? 'Message is empty')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (canStop) {
      onStop?.()
      return
    }

    if (uploaded) {
      void submitUploadedImage()
      return
    }

    if (hasValue) onSubmit?.(event.nativeEvent as SubmitEvent)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) return

    event.preventDefault()

    if (canStop) {
      onStop?.()
      return
    }

    if (uploaded) {
      void submitUploadedImage()
      return
    }

    if (hasValue) onSubmit?.(new SubmitEvent('submit'))
  }

  const handleInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onInput?.(event as unknown as InputEvent)
  }

  return (
    <form
      className="border-border sw-ChatWidget-prompt shrink-0 border-t p-4"
      onSubmit={submit}>
      {HeaderComponent && <HeaderComponent />}
      {uploaded && !isAnalyzingImage && (
        <div className="mb-3 max-w-sm">
          <ImageUploadPreview
            uploaded={uploaded}
            disabled={isAnalyzingImage}
            onClear={clear}
            compact
          />
        </div>
      )}
      <div className="border-border bg-background focus-within:ring-primary/20 rounded-input flex min-h-9 w-full border focus-within:ring-2">
        <ImageUploadButton
          disabled={disabled || canStop || isAnalyzingImage}
          onUploadFile={uploadFile}
          compact
        />
        <textarea
          ref={(element) => {
            if (promptRef) promptRef.current = element
          }}
          rows={1}
          value={value}
          placeholder={placeholder ?? translations?.textareaPlaceholder}
          aria-label={translations?.textareaLabel ?? 'Type your message'}
          disabled={disabled || isAnalyzingImage}
          autoFocus={autoFocus}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          className="text-foreground placeholder:text-muted-foreground my-1 h-8 min-h-8 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-5 outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isSubmitDisabled}
          aria-label={submitLabel}
          title={submitLabel}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-button m-1 inline-flex min-h-8 min-w-10 cursor-pointer items-center justify-center px-3 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50">
          {isAnalyzingImage || canStop ? (
            <Square className="h-4 w-4" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
      <p className="text-muted-foreground mt-2 text-center text-xs">
        {translations?.disclaimer ?? 'AI can make mistakes. Verify responses.'}
      </p>
      {(uploadError || analysisError) && (
        <p className="text-destructive mt-2 text-center text-xs">
          {uploadError ?? analysisError}
        </p>
      )}
    </form>
  )
}
